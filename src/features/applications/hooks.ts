import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { logActivity } from "@/lib/activity-log";
import type { ReviewValues } from "./schemas";
import type { ApplicationWithRelations } from "./types";

export function useApplicationsQuery() {
  return useQuery({
    queryKey: ["applications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applications")
        .select("*, positions(title, department), users:applicant_id(full_name, email, asal, jurusan)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as ApplicationWithRelations[];
    },
  });
}

export function useUpdateApplication(callbacks: {
  onSuccess: (values: ReviewValues, selectedApp: ApplicationWithRelations) => void;
  onError: (e: Error) => void;
}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ values, selectedApp, userId }: { values: ReviewValues; selectedApp: ApplicationWithRelations; userId: string }) => {
      let acceptanceLetterPath: string | null = null;
      if (values.status === "accepted" && values.acceptanceLetterFile) {
        const file = values.acceptanceLetterFile;
        const path = `${selectedApp.applicant_id}/acceptance_${Date.now()}_${file.name}`;
        const { error: upErr } = await supabase.storage.from("resumes").upload(path, file, {
          contentType: "application/pdf",
          upsert: false,
        });
        if (upErr) throw upErr;
        acceptanceLetterPath = path;
      }

      const updatePayload = {
        status: values.status,
        reviewer_notes: values.reviewerNotes ?? null,
        reviewed_by: userId,
        start_date: values.startDate || null,
        end_date: values.endDate || null,
        penempatan: values.penempatan || null,
        ...(acceptanceLetterPath ? { acceptance_letter_url: acceptanceLetterPath } : {}),
      };

      const { error } = await supabase
        .from("applications")
        .update(updatePayload)
        .eq("id", selectedApp.id);
      if (error) throw error;

      // Notify applicant of status change
      const positionTitle = selectedApp.positions?.title ?? "posisi magang";
      if (selectedApp.status !== values.status || acceptanceLetterPath) {
        const statusLabels: Record<string, string> = {
          accepted: "DITERIMA",
          rejected: "DITOLAK",
          reviewing: "sedang direview",
          pending: "menunggu review",
        };
        await supabase.from("notifications").insert({
          user_id: selectedApp.applicant_id,
          title:
            values.status === "accepted"
              ? `🎉 Selamat! Lamaran Anda diterima`
              : `Status lamaran diperbarui`,
          description:
            values.status === "accepted"
              ? `Lamaran "${positionTitle}" telah ${statusLabels[values.status]}. ${acceptanceLetterPath ? "Surat penerimaan tersedia untuk diunduh. " : ""}Wajib gabung grup WhatsApp Magang Kemenkum: https://chat.whatsapp.com/Hqr3re5Vfps9uwtXHkbbaP`
              : `Lamaran "${positionTitle}" sekarang ${statusLabels[values.status] ?? values.status}.`,
          type:
            values.status === "accepted" ? "success" : values.status === "rejected" ? "error" : "info",
          file_url: acceptanceLetterPath,
        });
      }


      const oldStatus = selectedApp.status;
      const statusChanged = oldStatus !== values.status;
      const applicantName = selectedApp.users?.full_name ?? selectedApp.users?.email ?? "pelamar";
      logActivity({
        action: statusChanged ? "status_change" : "update",
        entity: "application",
        entityId: selectedApp.id,
        description: statusChanged
          ? `Mengubah status lamaran ${applicantName} menjadi ${values.status}`
          : `Memperbarui catatan lamaran ${applicantName}`,
        metadata: {
          old_status: oldStatus,
          new_status: values.status,
          reviewer_notes: values.reviewerNotes ?? null,
          start_date: values.startDate ?? null,
          end_date: values.endDate ?? null,
          penempatan: values.penempatan ?? null,
        },
      });
      const applicantId = selectedApp.applicant_id;
      const applicantProfile = selectedApp.users;

      if (applicantProfile) {
        const statusMap: Record<string, string> = {
          accepted: "Aktif",
          rejected: "Selesai",
          pending: "Aktif",
          reviewing: "Aktif",
        };

        const { data: existing } = await supabase.from("intern").select("id")
          .eq("user_id", applicantId)
          .maybeSingle();

        const internPayload = {
          nama: applicantProfile.full_name || "",
          asal: applicantProfile.asal || "",
          jurusan: applicantProfile.jurusan || "",
          start_date: values.startDate || null,
          end_date: values.endDate || null,
          penempatan: values.penempatan || "",
          status: statusMap[values.status] || "Aktif",
          user_id: applicantId,
        };

        if (existing) {
          await supabase.from("intern").update(internPayload).eq("id", existing.id);
        } else if (values.status === "accepted") {
          await supabase.from("intern").insert(internPayload);
        }
      }
      return { values, selectedApp };
    },
    onSuccess: ({ values, selectedApp }) => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      queryClient.invalidateQueries({ queryKey: ["intern"] });
      queryClient.invalidateQueries({ queryKey: ["position-accepted-counts"] });
      callbacks.onSuccess(values, selectedApp);
    },
    onError: callbacks.onError,
  });
}

export function useDeleteApplication(callbacks: {
  onSuccess: () => void;
  onError: (e: Error) => void;
}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("applications").delete().eq("id", id);
      if (error) throw error;
      logActivity({
        action: "delete",
        entity: "application",
        entityId: id,
        description: `Menghapus lamaran`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      queryClient.invalidateQueries({ queryKey: ["applications-stats"] });
      queryClient.invalidateQueries({ queryKey: ["position-accepted-counts"] });
      callbacks.onSuccess();
    },
    onError: callbacks.onError,
  });
}

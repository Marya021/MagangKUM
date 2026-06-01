import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { logActivity } from "@/lib/activity-log";
import type { PositionValues, ApplyValues } from "./schemas";

export function usePositionsQuery() {
  return useQuery({
    queryKey: ["positions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("positions")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useMyApplications(userId: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: ["my-applications", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applications")
        .select("position_id, status")
        .eq("applicant_id", userId!);
      if (error) throw error;
      return data;
    },
    enabled: !!userId && enabled,
  });
}

export function useAcceptedCounts() {
  return useQuery({
    queryKey: ["position-accepted-counts"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_accepted_counts");
      if (error) throw error;
      const counts: Record<string, number> = {};
      (data as { position_id: string; count: number }[] | null)?.forEach((r) => {
        counts[r.position_id] = r.count;
      });
      return counts;
    },
  });
}

export function useUpsertPosition(callbacks: {
  onSuccess: (editId: string | null) => void;
  onError: (e: Error) => void;
}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ values, editId, userId }: { values: PositionValues; editId: string | null; userId: string }) => {
      const payload = {
        ...values,
        deadline: values.deadline ? format(values.deadline, "yyyy-MM-dd") : null,
      };
      if (editId) {
        const { error } = await supabase.from("positions").update(payload).eq("id", editId);
        if (error) throw error;
        logActivity({
          action: "update",
          entity: "position",
          entityId: editId,
          description: `Mengubah posisi "${values.title}"`,
          metadata: { title: values.title, department: values.department, status: values.status },
        });
      } else {
        const { data: inserted, error } = await supabase.from("positions").insert({ ...payload, created_by: userId }).select("id").single();
        if (error) throw error;
        logActivity({
          action: "create",
          entity: "position",
          entityId: inserted?.id ?? null,
          description: `Membuat posisi baru "${values.title}"`,
          metadata: { title: values.title, department: values.department, quota: values.quota },
        });
      }
      return editId;
    },
    onSuccess: (editId) => {
      queryClient.invalidateQueries({ queryKey: ["positions"] });
      callbacks.onSuccess(editId);
    },
    onError: callbacks.onError,
  });
}

export function useDeletePosition(callbacks: {
  onSuccess: () => void;
}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data: pos } = await supabase.from("positions").select("title").eq("id", id).maybeSingle();
      const { error } = await supabase.from("positions").delete().eq("id", id);
      if (error) throw error;
      logActivity({
        action: "delete",
        entity: "position",
        entityId: id,
        description: `Menghapus posisi "${pos?.title ?? id}"`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["positions"] });
      callbacks.onSuccess();
    },
  });
}

export function useApplyPosition(callbacks: {
  onSuccess: () => void;
  onError: (e: Error) => void;
}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      values,
      userId,
      positionId,
      alreadyApplied,
    }: {
      values: ApplyValues;
      userId: string;
      positionId: string;
      alreadyApplied: boolean;
    }) => {
      if (alreadyApplied) throw new Error("Anda sudah melamar posisi ini");

      const file = values.resumeFile;
      const filePath = `${userId}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from("resumes").upload(filePath, file);
      if (uploadError) throw uploadError;

      const schoolFile = values.schoolLetterFile;
      const schoolFilePath = `${userId}/${Date.now()}_school_${schoolFile.name}`;
      const { error: schoolUploadError } = await supabase.storage.from("resumes").upload(schoolFilePath, schoolFile);
      if (schoolUploadError) throw schoolUploadError;

      const { data: inserted, error } = await supabase.from("applications").insert({
        position_id: positionId,
        applicant_id: userId,
        cover_letter: values.coverLetter || null,
        resume_url: filePath,
        school_letter_url: schoolFilePath,
        duration_months: values.durationMonths,
      }).select("id").single();
      if (error) {
        if (error.code === "23505") throw new Error("Anda sudah melamar posisi ini");
        throw error;
      }
      logActivity({
        action: "create",
        entity: "application",
        entityId: inserted?.id ?? null,
        description: `Mengajukan lamaran magang baru`,
        metadata: { position_id: positionId, resume: file.name, school_letter: schoolFile.name },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      queryClient.invalidateQueries({ queryKey: ["my-applications"] });
      callbacks.onSuccess();
    },
    onError: callbacks.onError,
  });
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { logActivity } from "@/lib/activity-log";
import type { ProfileValues, PasswordValues } from "./schemas";

export function useProfileQuery(userId: string | undefined) {
  return useQuery({
    queryKey: ["my-profile", userId],
    queryFn: async () => {
      const { data, error } = await supabase.from("users").select("*").eq("user_id", userId!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

export function useUpdateProfile(userId: string | undefined, callbacks: { onSuccess: () => void; onError: (e: Error) => void }) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: ProfileValues) => {
      const { error } = await supabase
        .from("users")
        .update({
          full_name: values.full_name,
          asal: values.asal || "",
          jurusan: values.jurusan || "",
        })
        .eq("user_id", userId!);
      if (error) throw error;

      const { data: acceptedApp } = await supabase
        .from("applications")
        .select("start_date, end_date, penempatan, status")
        .eq("applicant_id", userId!)
        .eq("status", "accepted")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (acceptedApp) {
        const { data: existing } = await supabase.from("intern").select("id")
          .eq("user_id", userId!)
          .maybeSingle();

        const internPayload = {
          nama: values.full_name,
          asal: values.asal || "",
          jurusan: values.jurusan || "",
          start_date: acceptedApp.start_date,
          end_date: acceptedApp.end_date,
          penempatan: acceptedApp.penempatan || "",
          status: "Aktif",
          user_id: userId!,
        };

        if (existing) {
          await supabase.from("intern").update(internPayload).eq("id", existing.id);
        } else {
          await supabase.from("intern").insert(internPayload);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
      queryClient.invalidateQueries({ queryKey: ["intern"] });
      callbacks.onSuccess();
    },
    onError: callbacks.onError,
  });
}

export function useUploadAvatar(userId: string | undefined, callbacks: { onSuccess: () => void; onError: (e: Error) => void }) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const filePath = `${userId!}/avatar.${ext}`;

      const { error: uploadErr } = await supabase.storage.from("avatars").upload(filePath, file, { upsert: true });
      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;
      const { error: updateErr } = await supabase.from("users").update({ avatar_url: avatarUrl }).eq("user_id", userId!);
      if (updateErr) throw updateErr;
      logActivity({
        action: "upload",
        entity: "profile",
        entityId: userId,
        description: `Mengganti foto profil`,
        metadata: { file_name: file.name, size: file.size },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
      callbacks.onSuccess();
    },
    onError: callbacks.onError,
  });
}

export function useChangePassword(callbacks: { onSuccess: () => void; onError: (e: Error) => void }) {
  return useMutation({
    mutationFn: async (values: PasswordValues) => {
      const { error } = await supabase.auth.updateUser({ password: values.newPassword });
      if (error) throw error;
      logActivity({
        action: "update",
        entity: "profile",
        description: `Mengubah kata sandi`,
      });
    },
    onSuccess: callbacks.onSuccess,
    onError: callbacks.onError,
  });
}

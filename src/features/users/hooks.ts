import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { logActivity } from "@/lib/activity-log";
import type { AppRole } from "./types";

export function useUsersQuery(enabled: boolean) {
  return useQuery({
    queryKey: ["users-management"],
    queryFn: async () => {
      const { data: profiles, error: pErr } = await supabase.from("users").select("id, user_id, full_name, email, avatar_url, created_at");
      if (pErr) throw pErr;
      const { data: roles, error: rErr } = await supabase.from("roles").select("user_id, id, role");
      if (rErr) throw rErr;
      const roleMap = new Map(roles.map((r) => [r.user_id, r]));
      return profiles.map((p) => ({
        ...p,
        role: (roleMap.get(p.user_id)?.role as AppRole) ?? "applier",
        roleId: roleMap.get(p.user_id)?.id,
      }));
    },
    enabled,
  });
}

export function useUpdateRole(callbacks: { onSuccess: () => void; onError: (e: Error) => void }) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: AppRole }) => {
      await supabase.from("roles").delete().eq("user_id", userId);
      const { error } = await supabase.from("roles").insert({ user_id: userId, role: newRole });
      if (error) throw error;
      logActivity({
        action: "status_change",
        entity: "user",
        entityId: userId,
        description: `Mengubah peran pengguna menjadi ${newRole}`,
        metadata: { user_id: userId, new_role: newRole },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users-management"] });
      callbacks.onSuccess();
    },
    onError: callbacks.onError,
  });
}

export function useDeleteUser(callbacks: { onSuccess: () => void; onError: (e: Error) => void }) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const { data: u } = await supabase.from("users").select("email, full_name").eq("user_id", userId).maybeSingle();
      const { error: rErr } = await supabase.from("roles").delete().eq("user_id", userId);
      if (rErr) throw rErr;
      const { error: pErr } = await supabase.from("users").delete().eq("user_id", userId);
      if (pErr) throw pErr;
      logActivity({
        action: "delete",
        entity: "user",
        entityId: userId,
        description: `Menghapus pengguna ${u?.full_name ?? u?.email ?? userId}`,
        metadata: { email: u?.email },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users-management"] });
      callbacks.onSuccess();
    },
    onError: callbacks.onError,
  });
}

export function useAddUser(callbacks: { onSuccess: () => void; onError: (e: Error) => void }) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ fullName, email, password, role }: { fullName: string; email: string; password: string; role: "admin" | "reviewer" | "supervisor" }) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) throw error;
      if (!data.user) throw new Error("Gagal membuat pengguna");
      await supabase.from("roles").delete().eq("user_id", data.user.id);
      const { error: roleErr } = await supabase.from("roles").insert({ user_id: data.user.id, role });
      if (roleErr) throw roleErr;
      logActivity({
        action: "create",
        entity: "user",
        entityId: data.user.id,
        description: `Membuat pengguna baru ${fullName} (${email}) sebagai ${role}`,
        metadata: { email, role, full_name: fullName },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users-management"] });
      callbacks.onSuccess();
    },
    onError: callbacks.onError,
  });
}

export function useEditUser(callbacks: { onSuccess: () => void; onError: (e: Error) => void }) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, fullName, email }: { userId: string; fullName: string; email: string }) => {
      const { error } = await supabase.from("users").update({ full_name: fullName, email }).eq("user_id", userId);
      if (error) throw error;
      logActivity({
        action: "update",
        entity: "user",
        entityId: userId,
        description: `Memperbarui data pengguna ${fullName}`,
        metadata: { email, full_name: fullName },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users-management"] });
      callbacks.onSuccess();
    },
    onError: callbacks.onError,
  });
}

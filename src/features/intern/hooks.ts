import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { logActivity } from "@/lib/activity-log";
import type { InternRow } from "./types";
import type { TablesUpdate } from "@/integrations/supabase/types";

export function useInternQuery() {
  return useQuery({
    queryKey: ["intern"],
    queryFn: async () => {
      const { data, error } = await supabase.from("intern").select("*").order("created_at", { ascending: true });
      if (error) throw error;
      return data as InternRow[];
    },
  });
}

export function useSupervisorUsers() {
  return useQuery({
    queryKey: ["supervisor-users"],
    queryFn: async () => {
      const { data: roles, error: rErr } = await supabase.from("roles").select("user_id").eq("role", "supervisor");
      if (rErr) throw rErr;
      if (!roles.length) return [];
      const ids = roles.map((r) => r.user_id);
      const { data: users, error: uErr } = await supabase.from("users").select("user_id, full_name").in("user_id", ids);
      if (uErr) throw uErr;
      return users;
    },
  });
}

export function useSupervisorAssignments() {
  return useQuery({
    queryKey: ["supervisor-assignments"],
    queryFn: async () => {
      const { data, error } = await supabase.from("supervisors").select("id, supervisor_id, intern_id");
      if (error) throw error;
      return data;
    },
  });
}

export function useAssignSupervisor(callbacks: { onSuccess: () => void; onError: (e: Error) => void }) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ internId, supervisorId }: { internId: string; supervisorId: string | null }) => {
      await supabase.from("supervisors").delete().eq("intern_id", internId);
      if (supervisorId) {
        const { error } = await supabase.from("supervisors").insert({ supervisor_id: supervisorId, intern_id: internId });
        if (error) throw error;
      }
      logActivity({
        action: supervisorId ? "update" : "delete",
        entity: "supervisor",
        entityId: internId,
        description: supervisorId
          ? `Menugaskan pembimbing untuk magang`
          : `Mencabut penugasan pembimbing`,
        metadata: { intern_id: internId, supervisor_id: supervisorId },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supervisor-assignments"] });
      callbacks.onSuccess();
    },
    onError: callbacks.onError,
  });
}

export function useUpdateIntern(callbacks: {
  onSuccess: () => void;
  onError: (e: Error) => void;
}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (item: Partial<InternRow> & { id: string }) => {
      const { id, ...rest } = item;
      const { error } = await supabase
        .from("intern")
        .update(rest as TablesUpdate<"intern">)
        .eq("id", id);
      if (error) throw error;
      logActivity({
        action: "update",
        entity: "intern",
        entityId: id,
        description: `Memperbarui data magang ${item.nama ?? id}`,
        metadata: rest,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["intern"] });
      callbacks.onSuccess();
    },
    onError: callbacks.onError,
  });
}

export function useDeleteIntern(callbacks: {
  onSuccess: () => void;
  onError: (e: Error) => void;
}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data: row } = await supabase.from("intern").select("nama").eq("id", id).maybeSingle();
      const { error } = await supabase.from("intern").delete().eq("id", id);
      if (error) throw error;
      logActivity({
        action: "delete",
        entity: "intern",
        entityId: id,
        description: `Menghapus data magang ${row?.nama ?? id}`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["intern"] });
      callbacks.onSuccess();
    },
    onError: callbacks.onError,
  });
}

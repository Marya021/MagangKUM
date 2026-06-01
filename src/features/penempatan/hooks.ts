import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Penempatan = {
  id: string;
  name: string;
  sort_order: number;
};

export function usePenempatanList() {
  return useQuery({
    queryKey: ["penempatan"],
    queryFn: async (): Promise<Penempatan[]> => {
      const { data, error } = await supabase
        .from("penempatan")
        .select("id, name, sort_order")
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

/** Returns just the names, for use in select dropdowns. */
export function usePenempatanOptions() {
  const { data, ...rest } = usePenempatanList();
  return { ...rest, options: (data ?? []).map((p) => p.name) };
}

export function useCreatePenempatan(opts?: { onSuccess?: () => void }) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { name: string; sort_order: number }) => {
      const { error } = await supabase.from("penempatan").insert(input);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["penempatan"] });
      opts?.onSuccess?.();
    },
  });
}

export function useUpdatePenempatan(opts?: { onSuccess?: () => void }) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; name: string; sort_order: number }) => {
      const { id, ...rest } = input;
      const { error } = await supabase.from("penempatan").update(rest).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["penempatan"] });
      opts?.onSuccess?.();
    },
  });
}

export function useDeletePenempatan(opts?: { onSuccess?: () => void }) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("penempatan").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["penempatan"] });
      opts?.onSuccess?.();
    },
  });
}

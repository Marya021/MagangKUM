import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CRUD_ACTIONS, PAGE_SIZE } from "./constants";

export interface ActivityLogRow {
  id: string;
  user_id: string | null;
  user_email: string | null;
  user_role: string | null;
  action: string;
  entity: string;
  entity_id: string | null;
  description: string;
  metadata: unknown;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface ActivityLogFilters {
  search: string;
  action: string;
  entity: string;
  from: string | null;
  to: string | null;
  page: number;
}

export function useActivityLogs(filters: ActivityLogFilters) {
  return useQuery({
    queryKey: ["activity-logs", filters],
    queryFn: async () => {
      const start = filters.page * PAGE_SIZE;
      const end = start + PAGE_SIZE - 1;

      let q = supabase
        .from("activity_logs")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false });

      if (filters.action !== "all") {
        q = q.eq("action", filters.action);
      } else {
        q = q.in("action", CRUD_ACTIONS as unknown as string[]);
      }
      if (filters.entity !== "all") {
        q = q.eq("entity", filters.entity);
      } else {
        q = q.not("entity", "in", "(auth,profile)");
      }
      if (filters.from) q = q.gte("created_at", `${filters.from}T00:00:00`);
      if (filters.to) q = q.lte("created_at", `${filters.to}T23:59:59`);
      if (filters.search.trim()) {
        const s = filters.search.trim().replace(/[%,]/g, "");
        q = q.or(`description.ilike.%${s}%,user_email.ilike.%${s}%`);
      }

      const { data, error, count } = await q.range(start, end);
      if (error) throw error;
      return { rows: (data ?? []) as ActivityLogRow[], total: count ?? 0 };
    },
  });
}

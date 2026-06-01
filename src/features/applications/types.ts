import type { Tables } from "@/integrations/supabase/types";

export type AppSortKey = "posisi" | "pelamar" | "status" | "tanggal";

export interface ApplicationWithRelations extends Tables<"applications"> {
  positions: { title: string; department: string } | null;
  users: { full_name: string; email: string; asal: string; jurusan: string } | null;
}

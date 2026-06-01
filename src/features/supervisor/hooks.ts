import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { AssignedIntern, InternAttendance, InternReport } from "./types";

interface SupervisorRow {
  id: string;
  intern_id: string;
  intern: {
    id: string;
    nama: string;
    asal: string;
    jurusan: string;
    start_date: string | null;
    end_date: string | null;
    penempatan: string;
    status: string;
    user_id: string | null;
  };
}

export function useAssignedInterns(supervisorId: string | undefined) {
  return useQuery({
    queryKey: ["assigned-interns", supervisorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("supervisors")
        .select("id, intern_id, intern!inner(id, nama, asal, jurusan, start_date, end_date, penempatan, status, user_id)")
        .eq("supervisor_id", supervisorId!);
      if (error) throw error;
      return (data as unknown as SupervisorRow[] ?? []).map((row) => ({
        id: row.id,
        intern_id: row.intern_id,
        ...row.intern,
      })) as AssignedIntern[];
    },
    enabled: !!supervisorId,
  });
}

export function useInternAttendance(userId: string | null | undefined) {
  return useQuery({
    queryKey: ["intern-attendance", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("attendances")
        .select("id, date, time_in, time_out")
        .eq("user_id", userId!)
        .order("date", { ascending: false })
        .limit(30);
      if (error) throw error;
      return data as InternAttendance[];
    },
    enabled: !!userId,
  });
}

export function useInternReports(userId: string | null | undefined) {
  return useQuery({
    queryKey: ["intern-reports", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reports")
        .select("id, report_date, activities, obstacles, plan_tomorrow")
        .eq("user_id", userId!)
        .order("report_date", { ascending: false })
        .limit(30);
      if (error) throw error;
      return data as InternReport[];
    },
    enabled: !!userId,
  });
}

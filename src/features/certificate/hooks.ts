import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useCertificateProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("users")
        .select("full_name")
        .eq("user_id", userId!)
        .maybeSingle();
      return data;
    },
    enabled: !!userId,
  });
}

export function useAttendanceDates(userId: string | undefined) {
  return useQuery({
    queryKey: ["intern-range", userId],
    queryFn: async () => {
      // Prefer intern.start_date/end_date as the official internship period
      const { data: intern } = await supabase
        .from("intern")
        .select("start_date, end_date")
        .eq("user_id", userId!)
        .maybeSingle();

      if (intern?.start_date && intern?.end_date) {
        return { startDate: intern.start_date as string, endDate: intern.end_date as string };
      }

      // Fallback to attendance range
      const [{ data: first }, { data: last }] = await Promise.all([
        supabase
          .from("attendances")
          .select("date")
          .eq("user_id", userId!)
          .order("date", { ascending: true })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("attendances")
          .select("date")
          .eq("user_id", userId!)
          .order("date", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);
      return { startDate: first?.date as string | undefined, endDate: last?.date as string | undefined };
    },
    enabled: !!userId,
  });
}

export function useSupervisorName(userId: string | undefined) {
  return useQuery({
    queryKey: ["supervisor-name", userId],
    queryFn: async () => {
      const { data: intern } = await supabase
        .from("intern")
        .select("id")
        .eq("user_id", userId!)
        .maybeSingle();
      if (!intern) return null;

      const { data: assignment } = await supabase
        .from("supervisors")
        .select("supervisor_id")
        .eq("intern_id", intern.id)
        .maybeSingle();
      if (!assignment) return null;

      const { data: profile } = await supabase
        .from("users")
        .select("full_name")
        .eq("user_id", assignment.supervisor_id)
        .maybeSingle();
      return profile?.full_name ?? null;
    },
    enabled: !!userId,
  });
}

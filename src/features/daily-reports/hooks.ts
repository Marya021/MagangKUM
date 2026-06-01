import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, endOfWeek } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { logActivity } from "@/lib/activity-log";
import type { DailyReport } from "./types";
import type { ReportValues } from "./schemas";

interface AcceptedAppRow {
  applicant_id: string;
  users: { user_id: string; full_name: string; email: string } | null;
}

export function useIsAcceptedReports(userId: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: ["is-accepted-reports", userId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("applications")
        .select("id", { count: "exact", head: true })
        .eq("applicant_id", userId!)
        .eq("status", "accepted");
      if (error) return false;
      return (count ?? 0) > 0;
    },
    enabled: !!userId && enabled,
  });
}

export function useInternStartDateReports(userId: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: ["intern-start-date-reports", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applications")
        .select("start_date")
        .eq("applicant_id", userId!)
        .eq("status", "accepted")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error || !data?.start_date) return null;
      return data.start_date;
    },
    enabled: !!userId && enabled,
  });
}

export function useAcceptedDate(userId: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: ["accepted-date", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applications")
        .select("updated_at")
        .eq("applicant_id", userId!)
        .eq("status", "accepted")
        .order("updated_at", { ascending: true })
        .limit(1)
        .single();
      if (error) return null;
      return data?.updated_at ? new Date(data.updated_at) : null;
    },
    enabled: !!userId && enabled,
  });
}

export function useDailyReports(
  currentWeekStart: Date,
  isAdmin: boolean,
  filterUserId: string,
  userId: string | undefined,
) {
  const currentWeekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });

  return useQuery({
    queryKey: ["daily-reports", format(currentWeekStart, "yyyy-MM-dd"), isAdmin, filterUserId],
    queryFn: async () => {
      let query = supabase
        .from("reports")
        .select("*")
        .gte("report_date", format(currentWeekStart, "yyyy-MM-dd"))
        .lte("report_date", format(currentWeekEnd, "yyyy-MM-dd"))
        .order("report_date", { ascending: true });
      if (!isAdmin) query = query.eq("user_id", userId!);
      else if (filterUserId !== "all") query = query.eq("user_id", filterUserId);
      const { data, error } = await query;
      if (error) throw error;
      return data as DailyReport[];
    },
    enabled: !!userId,
  });
}

export function useInternProfiles(enabled: boolean) {
  return useQuery({
    queryKey: ["intern-profiles"],
    queryFn: async () => {
      const { data: apps } = await supabase
        .from("applications")
        .select("applicant_id, users!applications_applicant_id_fkey(user_id, full_name, email)")
        .eq("status", "accepted");
      if (!apps?.length) return [];
      const uniqueUsers = new Map<string, { user_id: string; full_name: string; email: string }>();
      (apps as unknown as AcceptedAppRow[]).forEach((app) => {
        const profile = app.users;
        if (profile && !uniqueUsers.has(profile.user_id)) {
          uniqueUsers.set(profile.user_id, {
            user_id: profile.user_id,
            full_name: profile.full_name || profile.email,
            email: profile.email,
          });
        }
      });
      return Array.from(uniqueUsers.values());
    },
    enabled,
  });
}

export function useUpsertReport(callbacks: {
  onSuccess: (isEdit: boolean) => void;
  onError: (e: Error) => void;
}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      values,
      selectedDate,
      editingReport,
      userId,
    }: {
      values: ReportValues;
      selectedDate: Date;
      editingReport: DailyReport | null;
      userId: string;
    }) => {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      if (editingReport) {
        const { error } = await supabase
          .from("reports")
          .update({
            activities: values.activities,
            obstacles: values.obstacles || null,
            plan_tomorrow: values.plan_tomorrow || null,
          })
          .eq("id", editingReport.id);
        if (error) throw error;
        logActivity({
          action: "update",
          entity: "report",
          entityId: editingReport.id,
          description: `Memperbarui laporan harian tanggal ${dateStr}`,
        });
      } else {
        const { data: inserted, error } = await supabase.from("reports").insert({
          user_id: userId,
          report_date: dateStr,
          activities: values.activities,
          obstacles: values.obstacles || null,
          plan_tomorrow: values.plan_tomorrow || null,
        }).select("id").single();
        if (error) {
          if (error.code === "23505") throw new Error("Laporan untuk tanggal ini sudah ada");
          throw error;
        }
        logActivity({
          action: "create",
          entity: "report",
          entityId: inserted?.id ?? null,
          description: `Membuat laporan harian tanggal ${dateStr}`,
        });
      }
      return !!editingReport;
    },
    onSuccess: (isEdit) => {
      queryClient.invalidateQueries({ queryKey: ["daily-reports"] });
      callbacks.onSuccess(isEdit);
    },
    onError: callbacks.onError,
  });
}

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, differenceInCalendarDays, parseISO, isWeekend, isAfter, startOfDay } from "date-fns";

export function usePositionsCount() {
  return useQuery({
    queryKey: ["positions-count"],
    queryFn: async () => {
      const { count } = await supabase.from("positions").select("id", { count: "exact", head: true });
      return count ?? 0;
    },
  });
}

export function useApplicationsStats() {
  return useQuery({
    queryKey: ["applications-stats"],
    queryFn: async () => {
      const { data } = await supabase.from("applications").select("status, created_at");
      const stats = { total: 0, pending: 0, reviewing: 0, accepted: 0, rejected: 0 };
      data?.forEach((a) => {
        stats.total++;
        if (a.status in stats) stats[a.status as keyof typeof stats]++;
      });
      return { stats, raw: data || [] };
    },
  });
}

export function useAttendanceWeeklyStats() {
  return useQuery({
    queryKey: ["attendance-weekly-stats"],
    queryFn: async () => {
      const today = new Date();
      const sevenDaysAgo = format(subDays(today, 6), "yyyy-MM-dd");
      const { data } = await supabase
        .from("attendances")
        .select("date, time_in")
        .gte("date", sevenDaysAgo)
        .order("date");

      const dayMap: Record<string, { ontime: number; late: number; absent: number }> = {};
      for (let i = 6; i >= 0; i--) {
        const d = format(subDays(today, i), "yyyy-MM-dd");
        dayMap[d] = { ontime: 0, late: 0, absent: 0 };
      }

      data?.forEach((a) => {
        if (dayMap[a.date]) {
          if (!a.time_in) {
            dayMap[a.date].absent++;
          } else {
            const hour = parseInt(a.time_in.split(":")[0], 10);
            const minute = parseInt(a.time_in.split(":")[1], 10);
            if (hour < 8 || (hour === 8 && minute === 0)) {
              dayMap[a.date].ontime++;
            } else {
              dayMap[a.date].late++;
            }
          }
        }
      });

      return Object.entries(dayMap).map(([date, vals]) => ({
        date,
        ...vals,
      }));
    },
  });
}

export function usePositionQuotaStats() {
  return useQuery({
    queryKey: ["positions-quota-stats"],
    queryFn: async () => {
      const { data: pos } = await supabase.from("positions").select("title, quota, id, status").eq("status", "open");
      if (!pos?.length) return [];

      const { data: apps } = await supabase.from("applications").select("position_id, status").eq("status", "accepted");
      const acceptedMap: Record<string, number> = {};
      apps?.forEach((a) => {
        acceptedMap[a.position_id] = (acceptedMap[a.position_id] || 0) + 1;
      });

      return pos.slice(0, 5).map((p) => ({
        name: p.title.length > 15 ? p.title.slice(0, 15) + "…" : p.title,
        terisi: acceptedMap[p.id] || 0,
        sisa: Math.max((p.quota || 0) - (acceptedMap[p.id] || 0), 0),
      }));
    },
  });
}

export interface InternDashboardData {
  hasInternship: boolean;
  startDate: string | null;
  endDate: string | null;
  totalDays: number;
  daysPassed: number;
  daysRemaining: number;
  progressPercent: number;
  attendancePresent: number;
  attendanceExpected: number;
  attendanceRate: number;
  journalCount: number;
  journalExpected: number;
  todayHasJournal: boolean;
  todayIsWorkday: boolean;
}

function countWorkdays(from: Date, to: Date): number {
  if (isAfter(from, to)) return 0;
  let count = 0;
  const cur = new Date(from);
  while (cur <= to) {
    if (!isWeekend(cur)) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

export function useInternDashboard(userId: string | undefined) {
  return useQuery<InternDashboardData>({
    queryKey: ["intern-dashboard", userId],
    enabled: !!userId,
    queryFn: async () => {
      const empty: InternDashboardData = {
        hasInternship: false,
        startDate: null,
        endDate: null,
        totalDays: 0,
        daysPassed: 0,
        daysRemaining: 0,
        progressPercent: 0,
        attendancePresent: 0,
        attendanceExpected: 0,
        attendanceRate: 0,
        journalCount: 0,
        journalExpected: 0,
        todayHasJournal: false,
        todayIsWorkday: false,
      };

      const { data: app } = await supabase
        .from("applications")
        .select("start_date, end_date, duration_months, updated_at")
        .eq("applicant_id", userId!)
        .eq("status", "accepted")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!app) return empty;

      const today = startOfDay(new Date());
      const startDate = app.start_date ? parseISO(app.start_date) : null;
      let endDate = app.end_date ? parseISO(app.end_date) : null;
      if (!endDate && startDate && app.duration_months) {
        endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + app.duration_months);
      }

      if (!startDate || !endDate) {
        return { ...empty, hasInternship: true };
      }

      const totalDays = Math.max(differenceInCalendarDays(endDate, startDate) + 1, 1);
      const daysPassed = Math.max(Math.min(differenceInCalendarDays(today, startDate) + 1, totalDays), 0);
      const daysRemaining = Math.max(differenceInCalendarDays(endDate, today), 0);
      const progressPercent = Math.round((daysPassed / totalDays) * 100);

      const periodStart = startDate;
      const periodEnd = today > endDate ? endDate : today;

      // Attendance
      const { data: attData } = await supabase
        .from("attendances")
        .select("date, time_in, status")
        .eq("user_id", userId!)
        .gte("date", format(periodStart, "yyyy-MM-dd"))
        .lte("date", format(periodEnd, "yyyy-MM-dd"));

      const attendanceExpected = countWorkdays(periodStart, periodEnd);
      const attendancePresent = (attData || []).filter(
        (a) => a.time_in || a.status === "present" || a.status === "late"
      ).length;
      const attendanceRate = attendanceExpected > 0
        ? Math.round((attendancePresent / attendanceExpected) * 100)
        : 0;

      // Journals (reports)
      const { data: reportsData } = await supabase
        .from("reports")
        .select("report_date")
        .eq("user_id", userId!)
        .gte("report_date", format(periodStart, "yyyy-MM-dd"))
        .lte("report_date", format(periodEnd, "yyyy-MM-dd"));

      const journalCount = reportsData?.length ?? 0;
      const journalExpected = attendanceExpected;
      const todayStr = format(today, "yyyy-MM-dd");
      const todayHasJournal = !!reportsData?.some((r) => r.report_date === todayStr);
      const todayIsWorkday = !isWeekend(today) && today >= startDate && today <= endDate;

      return {
        hasInternship: true,
        startDate: app.start_date,
        endDate: format(endDate, "yyyy-MM-dd"),
        totalDays,
        daysPassed,
        daysRemaining,
        progressPercent,
        attendancePresent,
        attendanceExpected,
        attendanceRate,
        journalCount,
        journalExpected,
        todayHasJournal,
        todayIsWorkday,
      };
    },
  });
}

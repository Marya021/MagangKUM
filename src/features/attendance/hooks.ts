import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { logActivity } from "@/lib/activity-log";
import { useAuth } from "@/hooks/use-auth";
import { useNotificationStore } from "@/hooks/use-notification-store";
import { toast } from "sonner";
import type { AttendanceRow, AcceptedUser, ScheduleRow, AttendanceStatus } from "./types";

interface AcceptedAppRow {
  applicant_id: string;
  users: { user_id: string; full_name: string; email: string } | null;
}

export function useIsAccepted(userId: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: ["is-accepted", userId],
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

export function useInternStartDate(userId: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: ["intern-start-date", userId],
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

export function useAcceptedUsers(enabled: boolean) {
  return useQuery({
    queryKey: ["accepted-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applications")
        .select("applicant_id, users!applications_applicant_id_fkey(user_id, full_name, email)")
        .eq("status", "accepted");
      if (error) throw error;
      const uniqueUsers = new Map<string, AcceptedUser>();
      (data as unknown as AcceptedAppRow[] ?? []).forEach((app) => {
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

export function useAdminSchedule(currentMonth: Date, enabled: boolean) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  const { data: adminSchedule = [] } = useQuery({
    queryKey: ["admin-schedule", format(monthStart, "yyyy-MM")],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_admin_schedule", {
        _start_date: format(monthStart, "yyyy-MM-dd"),
        _end_date: format(monthEnd, "yyyy-MM-dd"),
      });
      if (error) throw error;
      return (data ?? []) as ScheduleRow[];
    },
    enabled,
  });

  const adminScheduleMap = useMemo(() => {
    const map: Record<string, ScheduleRow> = {};
    adminSchedule.forEach((a) => {
      map[a.date] = a;
    });
    return map;
  }, [adminSchedule]);

  return { adminSchedule, adminScheduleMap };
}

export function useAttendances(viewUserId: string | undefined, currentMonth: Date) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  const { data: attendances = [], isLoading } = useQuery({
    queryKey: ["attendances", viewUserId, format(monthStart, "yyyy-MM")],
    queryFn: async () => {
      if (!viewUserId) return [];
      const { data, error } = await supabase
        .from("attendances")
        .select("*")
        .eq("user_id", viewUserId)
        .gte("date", format(monthStart, "yyyy-MM-dd"))
        .lte("date", format(monthEnd, "yyyy-MM-dd"));
      if (error) throw error;
      return (data ?? []) as AttendanceRow[];
    },
    enabled: !!viewUserId,
  });

  const attendanceMap = useMemo(() => {
    const map: Record<string, AttendanceRow> = {};
    attendances.forEach((a) => {
      map[a.date] = a;
    });
    return map;
  }, [attendances]);

  return { attendances, attendanceMap, isLoading };
}

export function useClockMutation(callbacks: {
  onSuccess: () => void;
  onError: (e: Error) => void;
}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      type,
      userId,
      attendanceMap,
    }: {
      type: "in" | "out";
      userId: string;
      attendanceMap: Record<string, AttendanceRow>;
    }) => {
      const today = format(new Date(), "yyyy-MM-dd");
      const now = format(new Date(), "HH:mm:ssxxx");
      const existing = attendanceMap[today];
      if (existing && existing.status !== "hadir") {
        throw new Error("Sudah tercatat izin/sakit hari ini");
      }
      if (type === "in") {
        if (existing?.time_in) throw new Error("Already clocked in");
        if (existing) {
          const { error } = await supabase.from("attendances").update({ time_in: now }).eq("id", existing.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from("attendances").insert({ user_id: userId, date: today, time_in: now, status: "hadir" });
          if (error) throw error;
        }
      } else {
        if (!existing?.time_in) throw new Error("Not clocked in");
        if (existing?.time_out) throw new Error("Already clocked out");
        const { error } = await supabase.from("attendances").update({ time_out: now }).eq("id", existing.id);
        if (error) throw error;
      }
      logActivity({
        action: type === "in" ? "create" : "update",
        entity: "attendance",
        description: type === "in" ? `Melakukan absen masuk` : `Melakukan absen pulang`,
        metadata: { date: today, time: now, type },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendances"] });
      callbacks.onSuccess();
    },
    onError: callbacks.onError,
  });
}

export function useAbsenceMutation(callbacks: {
  onSuccess: () => void;
  onError: (e: Error) => void;
}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      status,
      note,
      userId,
      attendanceMap,
    }: {
      status: "izin" | "sakit";
      note: string;
      userId: string;
      attendanceMap: Record<string, AttendanceRow>;
    }) => {
      const today = format(new Date(), "yyyy-MM-dd");
      const existing = attendanceMap[today];
      if (existing?.time_in) throw new Error("Sudah melakukan clock in hari ini");
      if (existing) {
        const { error } = await supabase.from("attendances").update({ status, note }).eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("attendances").insert({ user_id: userId, date: today, status, note });
        if (error) throw error;
      }
      logActivity({
        action: "create",
        entity: "attendance",
        description: status === "izin" ? `Mengajukan izin` : `Melaporkan sakit`,
        metadata: { date: today, status, note },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendances"] });
      callbacks.onSuccess();
    },
    onError: callbacks.onError,
  });
}

export function useAttendanceRealtime() {
  const queryClient = useQueryClient();
  const { user, role } = useAuth();
  const addNotification = useNotificationStore((s) => s.addNotification);

  useEffect(() => {
    if (!user || role !== "admin") return;
    const channel = supabase
      .channel("attendance-absence-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "attendances" },
        async (payload) => {
          const row = payload.new as AttendanceRow;
          if (row.status !== "izin" && row.status !== "sakit") return;
          queryClient.invalidateQueries({ queryKey: ["attendances"] });
          const { data: u } = await supabase.from("users").select("full_name, email").eq("user_id", row.user_id).maybeSingle();
          const name = u?.full_name || u?.email || "Magang";
          const label = row.status === "sakit" ? "🤒 Laporan Sakit" : "📝 Pengajuan Izin";
          const desc = `${name} - ${row.note ?? ""}`;
          addNotification({ title: label, description: desc, type: "warning" });
          toast.warning(label, { description: desc });
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "attendances" },
        async (payload) => {
          const row = payload.new as AttendanceRow;
          const old = payload.old as Partial<AttendanceRow>;
          if (row.status === old.status) return;
          if (row.status !== "izin" && row.status !== "sakit") return;
          queryClient.invalidateQueries({ queryKey: ["attendances"] });
          const { data: u } = await supabase.from("users").select("full_name, email").eq("user_id", row.user_id).maybeSingle();
          const name = u?.full_name || u?.email || "Magang";
          const label = row.status === "sakit" ? "🤒 Laporan Sakit" : "📝 Pengajuan Izin";
          const desc = `${name} - ${row.note ?? ""}`;
          addNotification({ title: label, description: desc, type: "warning" });
          toast.warning(label, { description: desc });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, role, addNotification, queryClient]);
}

export function useEditAttendance(callbacks: {
  onSuccess: () => void;
  onError: (e: Error) => void;
}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      date,
      time_in,
      time_out,
      applyToAll,
      viewUserId,
      attendanceMap,
      datesToApply,
    }: {
      date: string;
      time_in: string | null;
      time_out: string | null;
      applyToAll?: boolean;
      viewUserId: string;
      attendanceMap: Record<string, AttendanceRow>;
      datesToApply: string[];
    }) => {
      const timeInVal = time_in ? time_in + ":00+07" : null;
      const timeOutVal = time_out ? time_out + ":00+07" : null;
      const dates = applyToAll ? datesToApply : [date];
      for (const dt of dates) {
        const existing = attendanceMap[dt];
        if (existing) {
          const { error } = await supabase.from("attendances").update({ time_in: timeInVal, time_out: timeOutVal }).eq("id", existing.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from("attendances").insert({ user_id: viewUserId, date: dt, time_in: timeInVal, time_out: timeOutVal });
          if (error) throw error;
        }
      }
      logActivity({
        action: "update",
        entity: "attendance",
        description: applyToAll
          ? `Mengubah absensi untuk ${dates.length} tanggal`
          : `Mengubah absensi tanggal ${date}`,
        metadata: { dates, time_in, time_out, viewUserId },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendances"] });
      callbacks.onSuccess();
    },
    onError: callbacks.onError,
  });
}

export function useBulkAttendance(callbacks: {
  onSuccess: (count: number) => void;
  onError: (e: Error) => void;
}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      dates,
      time_in,
      time_out,
      acceptedUsers,
      adminUserId,
    }: {
      dates: string[];
      time_in: string | null;
      time_out: string | null;
      acceptedUsers: { user_id: string }[];
      adminUserId: string;
    }) => {
      const timeInVal = time_in ? time_in + ":00+07" : null;
      const timeOutVal = time_out ? time_out + ":00+07" : null;
      const allUserIds = new Set(acceptedUsers.map((u) => u.user_id));
      allUserIds.add(adminUserId);

      const { data: existingRecords, error: fetchError } = await supabase
        .from("attendances")
        .select("id, user_id, date")
        .in("user_id", Array.from(allUserIds))
        .in("date", dates);
      if (fetchError) throw fetchError;

      const existingMap = new Map<string, string>();
      (existingRecords ?? []).forEach((r) => existingMap.set(`${r.user_id}_${r.date}`, r.id));

      for (const userId of allUserIds) {
        for (const date of dates) {
          const key = `${userId}_${date}`;
          const existingId = existingMap.get(key);
          if (existingId) {
            const { error } = await supabase.from("attendances").update({ time_in: timeInVal, time_out: timeOutVal }).eq("id", existingId);
            if (error) throw error;
          } else {
            const { error } = await supabase.from("attendances").insert({ user_id: userId, date, time_in: timeInVal, time_out: timeOutVal });
            if (error) throw error;
          }
        }
      }
      logActivity({
        action: "update",
        entity: "attendance",
        description: `Mengatur absensi massal untuk ${dates.length} tanggal (${allUserIds.size} pengguna)`,
        metadata: { dates, time_in, time_out, user_count: allUserIds.size },
      });
      return dates.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ["attendances"] });
      callbacks.onSuccess(count);
    },
    onError: callbacks.onError,
  });
}

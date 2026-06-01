export type AttendanceStatus = "hadir" | "izin" | "sakit";

export type AttendanceRow = {
  id: string;
  user_id: string;
  date: string;
  time_in: string | null;
  time_out: string | null;
  status: AttendanceStatus;
  note: string | null;
  created_at: string;
  updated_at: string;
};

export type AcceptedUser = { user_id: string; full_name: string; email: string };

export type ScheduleRow = { date: string; time_in: string | null; time_out: string | null };

export interface AssignedIntern {
  id: string;
  intern_id: string;
  nama: string;
  asal: string;
  jurusan: string;
  start_date: string | null;
  end_date: string | null;
  penempatan: string;
  status: string;
  user_id: string | null;
}

export interface InternAttendance {
  id: string;
  date: string;
  time_in: string | null;
  time_out: string | null;
}

export interface InternReport {
  id: string;
  report_date: string;
  activities: string;
  obstacles: string | null;
  plan_tomorrow: string | null;
}

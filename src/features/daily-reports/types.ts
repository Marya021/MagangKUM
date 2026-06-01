export type DailyReport = {
  id: string;
  user_id: string;
  report_date: string;
  activities: string;
  obstacles: string | null;
  plan_tomorrow: string | null;
  created_at: string;
  updated_at: string;
};

CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications (status);
CREATE INDEX IF NOT EXISTS idx_applications_applicant_id ON public.applications (applicant_id);
CREATE INDEX IF NOT EXISTS idx_attendances_date ON public.attendances (date);
CREATE INDEX IF NOT EXISTS idx_daily_reports_report_date ON public.daily_reports (report_date);
CREATE INDEX IF NOT EXISTS idx_internship_positions_status ON public.internship_positions (status);
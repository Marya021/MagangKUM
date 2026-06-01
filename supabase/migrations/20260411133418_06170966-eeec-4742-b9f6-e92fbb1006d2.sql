
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey;
ALTER TABLE public.applications DROP CONSTRAINT IF EXISTS applications_reviewed_by_fkey;
ALTER TABLE public.attendances DROP CONSTRAINT IF EXISTS attendances_user_id_fkey;
ALTER TABLE public.daily_reports DROP CONSTRAINT IF EXISTS daily_reports_user_id_fkey;

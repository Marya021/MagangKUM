-- Drop existing constraints if any
ALTER TABLE public.applications DROP CONSTRAINT IF EXISTS applications_applicant_id_fkey;
ALTER TABLE public.applications DROP CONSTRAINT IF EXISTS applications_position_id_fkey;
ALTER TABLE public.applications DROP CONSTRAINT IF EXISTS applications_reviewed_by_fkey;
ALTER TABLE public.attendances DROP CONSTRAINT IF EXISTS attendances_user_id_fkey;
ALTER TABLE public.reports DROP CONSTRAINT IF EXISTS reports_user_id_fkey;
ALTER TABLE public.reports DROP CONSTRAINT IF EXISTS daily_reports_user_id_fkey;
ALTER TABLE public.positions DROP CONSTRAINT IF EXISTS positions_created_by_fkey;
ALTER TABLE public.positions DROP CONSTRAINT IF EXISTS internship_positions_created_by_fkey;
ALTER TABLE public.roles DROP CONSTRAINT IF EXISTS roles_user_id_fkey;

-- Re-add foreign key constraints
ALTER TABLE public.applications
  ADD CONSTRAINT applications_applicant_id_fkey FOREIGN KEY (applicant_id) REFERENCES public.users(user_id) ON DELETE CASCADE;

ALTER TABLE public.applications
  ADD CONSTRAINT applications_position_id_fkey FOREIGN KEY (position_id) REFERENCES public.positions(id) ON DELETE CASCADE;

ALTER TABLE public.applications
  ADD CONSTRAINT applications_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.users(user_id) ON DELETE SET NULL;

ALTER TABLE public.attendances
  ADD CONSTRAINT attendances_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;

ALTER TABLE public.reports
  ADD CONSTRAINT reports_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;

ALTER TABLE public.positions
  ADD CONSTRAINT positions_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(user_id) ON DELETE CASCADE;

ALTER TABLE public.roles
  ADD CONSTRAINT roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Restore trigger for auto-creating user profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
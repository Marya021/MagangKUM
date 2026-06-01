
-- Drop any existing FK constraints to avoid conflicts
ALTER TABLE public.applications DROP CONSTRAINT IF EXISTS applications_applicant_id_fkey;
ALTER TABLE public.applications DROP CONSTRAINT IF EXISTS applications_position_id_fkey;
ALTER TABLE public.applications DROP CONSTRAINT IF EXISTS applications_reviewed_by_fkey;
ALTER TABLE public.attendances DROP CONSTRAINT IF EXISTS attendances_user_id_fkey;
ALTER TABLE public.reports DROP CONSTRAINT IF EXISTS reports_user_id_fkey;
ALTER TABLE public.roles DROP CONSTRAINT IF EXISTS roles_user_id_fkey;
ALTER TABLE public.intern DROP CONSTRAINT IF EXISTS intern_user_id_fkey;
ALTER TABLE public.supervisors DROP CONSTRAINT IF EXISTS supervisors_intern_id_fkey;
ALTER TABLE public.supervisors DROP CONSTRAINT IF EXISTS supervisors_supervisor_id_fkey;
ALTER TABLE public.positions DROP CONSTRAINT IF EXISTS positions_created_by_fkey;

-- Make positions.created_by nullable for SET NULL
ALTER TABLE public.positions ALTER COLUMN created_by DROP NOT NULL;

-- Add foreign keys: applications
ALTER TABLE public.applications
  ADD CONSTRAINT applications_applicant_id_fkey FOREIGN KEY (applicant_id) REFERENCES public.users(user_id) ON DELETE CASCADE;

ALTER TABLE public.applications
  ADD CONSTRAINT applications_position_id_fkey FOREIGN KEY (position_id) REFERENCES public.positions(id) ON DELETE CASCADE;

ALTER TABLE public.applications
  ADD CONSTRAINT applications_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.users(user_id) ON DELETE SET NULL;

-- Add foreign keys: attendances
ALTER TABLE public.attendances
  ADD CONSTRAINT attendances_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;

-- Add foreign keys: reports
ALTER TABLE public.reports
  ADD CONSTRAINT reports_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;

-- Add foreign keys: roles
ALTER TABLE public.roles
  ADD CONSTRAINT roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;

-- Add foreign keys: intern
ALTER TABLE public.intern
  ADD CONSTRAINT intern_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE SET NULL;

-- Add foreign keys: supervisors
ALTER TABLE public.supervisors
  ADD CONSTRAINT supervisors_intern_id_fkey FOREIGN KEY (intern_id) REFERENCES public.intern(id) ON DELETE CASCADE;

ALTER TABLE public.supervisors
  ADD CONSTRAINT supervisors_supervisor_id_fkey FOREIGN KEY (supervisor_id) REFERENCES public.users(user_id) ON DELETE CASCADE;

-- Add foreign key: positions
ALTER TABLE public.positions
  ADD CONSTRAINT positions_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(user_id) ON DELETE SET NULL;

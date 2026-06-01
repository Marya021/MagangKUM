
ALTER TABLE public.internship_positions DROP CONSTRAINT IF EXISTS internship_positions_created_by_fkey;
ALTER TABLE public.applications DROP CONSTRAINT IF EXISTS applications_applicant_id_fkey;
ALTER TABLE public.applications DROP CONSTRAINT IF EXISTS applications_applicant_id_profiles_fkey;
ALTER TABLE public.applications DROP CONSTRAINT IF EXISTS applications_position_id_fkey;

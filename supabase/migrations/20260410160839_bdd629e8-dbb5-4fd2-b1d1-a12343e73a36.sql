ALTER TABLE public.applications DROP CONSTRAINT applications_applicant_id_fkey;

ALTER TABLE public.applications
ADD CONSTRAINT applications_applicant_id_profiles_fkey
FOREIGN KEY (applicant_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

ALTER TABLE public.applications
  ADD CONSTRAINT applications_applicant_id_fkey
  FOREIGN KEY (applicant_id) REFERENCES public.profiles(user_id);

ALTER TABLE public.applications
  ADD CONSTRAINT applications_position_id_fkey
  FOREIGN KEY (position_id) REFERENCES public.internship_positions(id);

ALTER TABLE public.applications
  ADD CONSTRAINT applications_reviewed_by_fkey
  FOREIGN KEY (reviewed_by) REFERENCES public.profiles(user_id);

ALTER TABLE public.attendances
  ADD CONSTRAINT attendances_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(user_id);

ALTER TABLE public.daily_reports
  ADD CONSTRAINT daily_reports_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(user_id);

ALTER TABLE public.internship_positions
  ADD CONSTRAINT internship_positions_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES public.profiles(user_id);

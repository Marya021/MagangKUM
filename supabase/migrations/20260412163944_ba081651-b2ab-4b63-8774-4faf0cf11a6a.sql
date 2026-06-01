-- Fix 1: Unify reports policies - add role check to view policy for consistency
DROP POLICY IF EXISTS "Interns can view own reports" ON public.reports;
CREATE POLICY "Interns can view own reports"
  ON public.reports FOR SELECT TO authenticated
  USING ((auth.uid() = user_id) AND has_role(auth.uid(), 'applier'::app_role));

-- Fix 3: Applications UPDATE - restrict which fields reviewers can modify
DROP POLICY IF EXISTS "Reviewers can update applications" ON public.reports;
DROP POLICY IF EXISTS "Reviewers can update applications" ON public.applications;

-- Reviewers can only update status, reviewed_by, and reviewer_notes
CREATE POLICY "Reviewers can update applications"
  ON public.applications FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'reviewer'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (
    applicant_id = (SELECT a.applicant_id FROM public.applications a WHERE a.id = applications.id)
    AND position_id = (SELECT a.position_id FROM public.applications a WHERE a.id = applications.id)
    AND cover_letter IS NOT DISTINCT FROM (SELECT a.cover_letter FROM public.applications a WHERE a.id = applications.id)
    AND resume_url IS NOT DISTINCT FROM (SELECT a.resume_url FROM public.applications a WHERE a.id = applications.id)
    AND school_letter_url IS NOT DISTINCT FROM (SELECT a.school_letter_url FROM public.applications a WHERE a.id = applications.id)
  );
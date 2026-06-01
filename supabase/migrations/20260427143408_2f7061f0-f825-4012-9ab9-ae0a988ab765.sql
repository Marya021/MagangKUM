-- Allow interns to delete their own reports
CREATE POLICY "Interns can delete own reports"
ON public.reports
FOR DELETE
TO authenticated
USING ((auth.uid() = user_id) AND public.has_role(auth.uid(), 'applier'::app_role));

-- Allow admins to delete any report (for moderation)
CREATE POLICY "Admins can delete any report"
ON public.reports
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));
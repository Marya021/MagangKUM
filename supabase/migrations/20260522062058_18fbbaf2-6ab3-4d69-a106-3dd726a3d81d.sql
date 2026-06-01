-- Admin can insert reports for any user
CREATE POLICY "Admins can create any report"
ON public.reports
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admin can update any report
CREATE POLICY "Admins can update any report"
ON public.reports
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
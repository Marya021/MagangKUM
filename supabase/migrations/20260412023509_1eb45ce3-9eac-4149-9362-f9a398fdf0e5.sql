CREATE POLICY "Anon can count applications"
ON public.applications
FOR SELECT
TO anon
USING (true);
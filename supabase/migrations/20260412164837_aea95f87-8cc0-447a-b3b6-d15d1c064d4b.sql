
CREATE POLICY "Anon can check user existence by email"
  ON public.users FOR SELECT TO anon
  USING (true);

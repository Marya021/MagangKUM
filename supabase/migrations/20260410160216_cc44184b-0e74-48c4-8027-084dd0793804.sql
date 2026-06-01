
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', false);

CREATE POLICY "Authenticated users can upload resumes"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own resumes"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'resumes' AND (
  auth.uid()::text = (storage.foldername(name))[1]
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'reviewer')
));

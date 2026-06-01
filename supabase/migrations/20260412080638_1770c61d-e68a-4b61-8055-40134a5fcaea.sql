
-- Allow admins and reviewers to read/download any resume
CREATE POLICY "Admins and reviewers can read resumes"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'resumes'
  AND (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'reviewer'::public.app_role)
  )
);

-- Allow applicants to read their own uploads
CREATE POLICY "Applicants can read own resumes"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'resumes'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow applicants to upload their own resumes
CREATE POLICY "Applicants can upload own resumes"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'resumes'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

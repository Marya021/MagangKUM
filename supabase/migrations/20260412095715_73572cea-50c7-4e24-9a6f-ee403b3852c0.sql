
-- 1. Replace anon SELECT on applications with a count-only function
DROP POLICY IF EXISTS "Anon can count applications" ON public.applications;

CREATE OR REPLACE FUNCTION public.count_applications_by_position(_position_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::integer FROM public.applications WHERE position_id = _position_id;
$$;

-- 2. Restrict profiles SELECT: users see own profile, admin/reviewer see all
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;

CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'reviewer'::app_role)
);

-- 3. Add DELETE and UPDATE storage policies for resumes bucket
CREATE POLICY "Users can delete own resumes"
ON storage.objects
FOR DELETE
USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own resumes"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 4. Rate-limit-friendly: add index on profiles user_id for faster RLS checks
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles (user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles (user_id);

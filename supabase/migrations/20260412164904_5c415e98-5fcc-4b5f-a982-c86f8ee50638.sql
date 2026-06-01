
-- Remove the broad anon policy
DROP POLICY IF EXISTS "Anon can check user existence by email" ON public.users;

-- Create a secure function to check email existence
CREATE OR REPLACE FUNCTION public.check_email_exists(_email text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users WHERE email = _email
  )
$$;

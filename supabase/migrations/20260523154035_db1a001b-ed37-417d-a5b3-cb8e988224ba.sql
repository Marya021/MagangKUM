-- 1. Allow appliers to SELECT their own intern profile row
CREATE POLICY "Appliers can view own intern data"
  ON public.intern
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'applier'::app_role) AND user_id = auth.uid());

-- 2. Tighten activity_logs INSERT policy: require user_id = auth.uid() (no nulls)
DROP POLICY IF EXISTS "Users can insert own activity logs" ON public.activity_logs;
CREATE POLICY "Users can insert own activity logs"
  ON public.activity_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Update log_activity() to refuse logging when not authenticated
CREATE OR REPLACE FUNCTION public.log_activity(
  _action text, _entity text, _entity_id uuid DEFAULT NULL::uuid,
  _description text DEFAULT ''::text, _metadata jsonb DEFAULT NULL::jsonb,
  _user_agent text DEFAULT NULL::text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _uid uuid := auth.uid();
  _email text;
  _role app_role;
  _new_id uuid;
BEGIN
  IF _uid IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT email INTO _email FROM public.users WHERE user_id = _uid LIMIT 1;
  SELECT role INTO _role FROM public.roles WHERE user_id = _uid LIMIT 1;

  INSERT INTO public.activity_logs (
    user_id, user_email, user_role, action, entity, entity_id, description, metadata, user_agent
  ) VALUES (
    _uid, _email, _role, _action, _entity, _entity_id, COALESCE(_description, ''), _metadata, _user_agent
  )
  RETURNING id INTO _new_id;

  RETURN _new_id;
END;
$function$;

-- 3 & 4. Revoke EXECUTE on internal trigger-only SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.handle_new_user()                  FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.notify_admins_on_new_application() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.validate_attendance_status()       FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column()         FROM anon, authenticated, public;

-- Revoke anon execute on SECURITY DEFINER helpers that should require login
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role)              FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_user_role(uuid)                   FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_admin_schedule(date, date)        FROM anon;
REVOKE EXECUTE ON FUNCTION public.log_activity(text, text, uuid, text, jsonb, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_accepted_counts()                 FROM anon;
REVOKE EXECUTE ON FUNCTION public.count_applications_by_position(uuid)  FROM anon;
-- check_email_exists is intentionally callable by anon (used during signup)

-- 5. Restrict listing of public 'avatars' bucket — files still readable by direct URL
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Public can read avatars" ON storage.objects;

CREATE POLICY "Public can read avatar files"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] IS NOT NULL
  );
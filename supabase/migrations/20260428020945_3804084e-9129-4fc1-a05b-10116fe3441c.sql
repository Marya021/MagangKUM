-- Activity logs table
CREATE TABLE public.activity_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  user_email text,
  user_role app_role,
  action text NOT NULL,
  entity text NOT NULL,
  entity_id uuid,
  description text NOT NULL,
  metadata jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_activity_logs_created_at ON public.activity_logs (created_at DESC);
CREATE INDEX idx_activity_logs_user_id ON public.activity_logs (user_id);
CREATE INDEX idx_activity_logs_entity ON public.activity_logs (entity);
CREATE INDEX idx_activity_logs_action ON public.activity_logs (action);

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can read logs
CREATE POLICY "Admins can view all activity logs"
ON public.activity_logs
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Authenticated users can insert their own log entries
CREATE POLICY "Users can insert own activity logs"
ON public.activity_logs
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- Helper RPC: snapshots role/email and inserts a log row
CREATE OR REPLACE FUNCTION public.log_activity(
  _action text,
  _entity text,
  _entity_id uuid DEFAULT NULL,
  _description text DEFAULT '',
  _metadata jsonb DEFAULT NULL,
  _user_agent text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _email text;
  _role app_role;
  _new_id uuid;
BEGIN
  IF _uid IS NOT NULL THEN
    SELECT email INTO _email FROM public.users WHERE user_id = _uid LIMIT 1;
    SELECT role INTO _role FROM public.roles WHERE user_id = _uid LIMIT 1;
  END IF;

  INSERT INTO public.activity_logs (
    user_id, user_email, user_role, action, entity, entity_id, description, metadata, user_agent
  ) VALUES (
    _uid, _email, _role, _action, _entity, _entity_id, COALESCE(_description, ''), _metadata, _user_agent
  )
  RETURNING id INTO _new_id;

  RETURN _new_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.log_activity(text, text, uuid, text, jsonb, text) TO authenticated;
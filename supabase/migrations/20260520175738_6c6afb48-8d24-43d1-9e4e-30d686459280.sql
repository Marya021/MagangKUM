
CREATE OR REPLACE FUNCTION public.notify_admins_on_new_application()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _applicant_name text;
  _position_title text;
BEGIN
  SELECT COALESCE(NULLIF(full_name, ''), email) INTO _applicant_name
  FROM public.users WHERE user_id = NEW.applicant_id LIMIT 1;

  SELECT title INTO _position_title
  FROM public.positions WHERE id = NEW.position_id LIMIT 1;

  INSERT INTO public.notifications (user_id, title, description, type)
  SELECT r.user_id,
         'Lamaran magang baru',
         COALESCE(_applicant_name, 'Seseorang') || ' melamar posisi ' || COALESCE(_position_title, 'magang'),
         'info'
  FROM public.roles r
  WHERE r.role = 'admin';

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_admins_on_new_application ON public.applications;
CREATE TRIGGER trg_notify_admins_on_new_application
AFTER INSERT ON public.applications
FOR EACH ROW
EXECUTE FUNCTION public.notify_admins_on_new_application();

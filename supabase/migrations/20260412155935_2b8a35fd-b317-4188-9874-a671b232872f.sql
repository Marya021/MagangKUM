
-- 1. Rename tables
ALTER TABLE public.internship_positions RENAME TO positions;
ALTER TABLE public.profiles RENAME TO users;
ALTER TABLE public.user_roles RENAME TO roles;
ALTER TABLE public.daily_reports RENAME TO reports;

-- 2. Update functions to reference new table names
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (user_id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), NEW.email);
  
  INSERT INTO public.roles (user_id, role)
  VALUES (NEW.id, 'applier');
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_admin_schedule(_start_date date, _end_date date)
RETURNS TABLE(date date, time_in time with time zone, time_out time with time zone)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT a.date, a.time_in, a.time_out
  FROM public.attendances a
  INNER JOIN public.roles ur ON ur.user_id = a.user_id AND ur.role = 'admin'
  WHERE a.date >= _start_date AND a.date <= _end_date
  ORDER BY a.date
  LIMIT 31;
$$;

CREATE OR REPLACE FUNCTION public.count_applications_by_position(_position_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::integer FROM public.applications WHERE position_id = _position_id;
$$;

-- 3. Drop and recreate RLS policies on renamed tables

-- positions (was internship_positions)
DROP POLICY IF EXISTS "Admins can create positions" ON public.positions;
DROP POLICY IF EXISTS "Admins can delete positions" ON public.positions;
DROP POLICY IF EXISTS "Admins can update positions" ON public.positions;
DROP POLICY IF EXISTS "Anon can view open positions" ON public.positions;
DROP POLICY IF EXISTS "Authenticated can view all positions" ON public.positions;

CREATE POLICY "Admins can create positions" ON public.positions FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete positions" ON public.positions FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update positions" ON public.positions FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Anon can view open positions" ON public.positions FOR SELECT TO anon USING (status = 'open'::text);
CREATE POLICY "Authenticated can view all positions" ON public.positions FOR SELECT TO authenticated USING (true);

-- users (was profiles)
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;

CREATE POLICY "Admins can delete users" ON public.users FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT TO authenticated USING ((auth.uid() = user_id) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'reviewer'::app_role));

-- roles (was user_roles)
DROP POLICY IF EXISTS "Admins can delete roles" ON public.roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON public.roles;
DROP POLICY IF EXISTS "Admins can update roles" ON public.roles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.roles;

CREATE POLICY "Admins can delete roles" ON public.roles FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert roles" ON public.roles FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update roles" ON public.roles FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can view own roles" ON public.roles FOR SELECT TO authenticated USING ((auth.uid() = user_id) OR has_role(auth.uid(), 'admin'::app_role));

-- reports (was daily_reports)
DROP POLICY IF EXISTS "Admins and reviewers can view all reports" ON public.reports;
DROP POLICY IF EXISTS "Interns can create own reports" ON public.reports;
DROP POLICY IF EXISTS "Interns can update own reports" ON public.reports;
DROP POLICY IF EXISTS "Interns can view own reports" ON public.reports;

CREATE POLICY "Admins and reviewers can view all reports" ON public.reports FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'reviewer'::app_role));
CREATE POLICY "Interns can create own reports" ON public.reports FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id) AND has_role(auth.uid(), 'applier'::app_role));
CREATE POLICY "Interns can update own reports" ON public.reports FOR UPDATE TO authenticated USING ((auth.uid() = user_id) AND has_role(auth.uid(), 'applier'::app_role));
CREATE POLICY "Interns can view own reports" ON public.reports FOR SELECT TO authenticated USING (auth.uid() = user_id);

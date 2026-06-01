CREATE OR REPLACE FUNCTION public.get_admin_schedule(_start_date date, _end_date date)
RETURNS TABLE (
  date date,
  time_in time with time zone,
  time_out time with time zone
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT a.date, a.time_in, a.time_out
  FROM public.attendances a
  INNER JOIN public.user_roles ur ON ur.user_id = a.user_id AND ur.role = 'admin'
  WHERE a.date >= _start_date AND a.date <= _end_date
  ORDER BY a.date
  LIMIT 31;
$$;
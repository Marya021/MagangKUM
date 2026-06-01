
CREATE OR REPLACE FUNCTION public.get_accepted_counts()
RETURNS TABLE(position_id uuid, count bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT a.position_id, COUNT(*) as count
  FROM public.applications a
  WHERE a.status = 'accepted'
  GROUP BY a.position_id
$$;

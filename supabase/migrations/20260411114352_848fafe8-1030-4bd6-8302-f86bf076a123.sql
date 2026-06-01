-- Drop existing select policy
DROP POLICY "Public can view open positions" ON public.internship_positions;

-- Create new policy: authenticated users can see all positions, anon only sees open
CREATE POLICY "Authenticated can view all positions"
ON public.internship_positions
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Anon can view open positions"
ON public.internship_positions
FOR SELECT
TO anon
USING (status = 'open'::text);
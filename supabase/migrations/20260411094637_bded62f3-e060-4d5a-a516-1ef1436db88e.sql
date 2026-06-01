
-- Drop existing SELECT policy that requires authenticated
DROP POLICY IF EXISTS "Anyone can view open positions" ON public.internship_positions;

-- Create new policy allowing anonymous + authenticated to view open positions
CREATE POLICY "Public can view open positions"
ON public.internship_positions
FOR SELECT
TO anon, authenticated
USING (status = 'open' OR has_role(auth.uid(), 'admin'::app_role));

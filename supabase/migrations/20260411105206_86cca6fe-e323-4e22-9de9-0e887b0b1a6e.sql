-- Drop existing insert policy
DROP POLICY "Users can insert own attendance" ON public.attendances;

-- Create new insert policy that allows admin to insert for any user
CREATE POLICY "Users can insert own attendance or admin for any"
ON public.attendances
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role)
);
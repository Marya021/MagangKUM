CREATE POLICY "Appliers can insert own intern data"
ON public.intern_data FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'applier') AND user_id = auth.uid());

CREATE POLICY "Appliers can update own intern data"
ON public.intern_data FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'applier') AND user_id = auth.uid());
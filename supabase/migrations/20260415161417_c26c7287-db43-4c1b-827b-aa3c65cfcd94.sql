-- Create supervisors table
CREATE TABLE public.supervisors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supervisor_id uuid NOT NULL,
  intern_id uuid NOT NULL REFERENCES public.intern(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (supervisor_id, intern_id)
);

ALTER TABLE public.supervisors ENABLE ROW LEVEL SECURITY;

-- RLS for supervisors table
CREATE POLICY "Admins can manage all supervisor assignments"
ON public.supervisors FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Supervisors can view own assignments"
ON public.supervisors FOR SELECT TO authenticated
USING (supervisor_id = auth.uid());

-- Supervisors can view assigned intern attendance
CREATE POLICY "Supervisors can view assigned intern attendance"
ON public.attendances FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'supervisor') AND
  user_id IN (
    SELECT i.user_id FROM public.intern i
    JOIN public.supervisors s ON s.intern_id = i.id
    WHERE s.supervisor_id = auth.uid() AND i.user_id IS NOT NULL
  )
);

-- Supervisors can view assigned intern reports
CREATE POLICY "Supervisors can view assigned intern reports"
ON public.reports FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'supervisor') AND
  user_id IN (
    SELECT i.user_id FROM public.intern i
    JOIN public.supervisors s ON s.intern_id = i.id
    WHERE s.supervisor_id = auth.uid() AND i.user_id IS NOT NULL
  )
);

-- Supervisors can view assigned intern data
CREATE POLICY "Supervisors can view assigned intern data"
ON public.intern FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'supervisor') AND
  id IN (
    SELECT s.intern_id FROM public.supervisors s
    WHERE s.supervisor_id = auth.uid()
  )
);

-- Supervisors can view user profiles of assigned interns
CREATE POLICY "Supervisors can view assigned intern profiles"
ON public.users FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'supervisor') AND
  user_id IN (
    SELECT i.user_id FROM public.intern i
    JOIN public.supervisors s ON s.intern_id = i.id
    WHERE s.supervisor_id = auth.uid() AND i.user_id IS NOT NULL
  )
);
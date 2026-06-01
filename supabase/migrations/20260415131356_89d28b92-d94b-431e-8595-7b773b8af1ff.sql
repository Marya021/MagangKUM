
CREATE TABLE public.intern_data (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nama text NOT NULL,
  asal text NOT NULL DEFAULT '',
  jurusan text NOT NULL DEFAULT '',
  start_date date,
  end_date date,
  penempatan text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'Aktif',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.intern_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and reviewers can view intern data"
ON public.intern_data FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'reviewer'));

CREATE POLICY "Admins can insert intern data"
ON public.intern_data FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update intern data"
ON public.intern_data FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete intern data"
ON public.intern_data FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_intern_data_updated_at
BEFORE UPDATE ON public.intern_data
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

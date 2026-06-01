CREATE TABLE public.penempatan (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.penempatan ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view penempatan"
ON public.penempatan FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Admins can insert penempatan"
ON public.penempatan FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update penempatan"
ON public.penempatan FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete penempatan"
ON public.penempatan FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_penempatan_updated_at
BEFORE UPDATE ON public.penempatan
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.penempatan (name, sort_order) VALUES
  ('Umum', 1),
  ('Yankum dan Helpdesk', 2),
  ('Humas', 3),
  ('Program', 4),
  ('Keuangan', 5),
  ('Kepegawaian', 6),
  ('P3H (Perancang)', 7),
  ('Yankum', 8)
ON CONFLICT (name) DO NOTHING;
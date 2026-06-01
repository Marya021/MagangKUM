ALTER TABLE public.intern_data ADD COLUMN user_id uuid UNIQUE;

CREATE INDEX idx_intern_data_user_id ON public.intern_data (user_id) WHERE user_id IS NOT NULL;
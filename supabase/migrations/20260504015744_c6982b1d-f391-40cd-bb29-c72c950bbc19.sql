-- Add status and note columns to attendances for izin/sakit tracking
ALTER TABLE public.attendances
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'hadir',
  ADD COLUMN IF NOT EXISTS note text;

-- Validation trigger to ensure status is valid
CREATE OR REPLACE FUNCTION public.validate_attendance_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.status NOT IN ('hadir', 'izin', 'sakit') THEN
    RAISE EXCEPTION 'Invalid attendance status: %', NEW.status;
  END IF;
  IF NEW.status IN ('izin', 'sakit') AND (NEW.note IS NULL OR length(trim(NEW.note)) = 0) THEN
    RAISE EXCEPTION 'Alasan wajib diisi untuk izin/sakit';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_attendance_status_trigger ON public.attendances;
CREATE TRIGGER validate_attendance_status_trigger
  BEFORE INSERT OR UPDATE ON public.attendances
  FOR EACH ROW EXECUTE FUNCTION public.validate_attendance_status();

-- Enable realtime for attendances so admin can be notified
ALTER TABLE public.attendances REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.attendances;
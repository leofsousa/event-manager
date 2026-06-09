-- Enable RLS on events table and restrict SELECT to previous, current, and next month
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "agenda_month_window"
  ON public.events
  FOR SELECT
  USING (
    data >= (date_trunc('month', CURRENT_DATE) - interval '1 month')
    AND data <= (date_trunc('month', CURRENT_DATE) + interval '2 month' - interval '1 day')
  );

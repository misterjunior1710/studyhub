CREATE TABLE IF NOT EXISTS public.cached_updates (
  id text PRIMARY KEY,
  payload jsonb NOT NULL,
  fetched_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.cached_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read cached updates"
  ON public.cached_updates
  FOR SELECT
  USING (true);

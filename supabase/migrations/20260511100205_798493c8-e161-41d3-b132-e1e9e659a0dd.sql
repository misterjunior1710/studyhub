
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TABLE public.calendar_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('google','microsoft')),
  account_email TEXT,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  scope TEXT,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, provider)
);
ALTER TABLE public.calendar_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cc_select_own" ON public.calendar_connections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "cc_insert_own" ON public.calendar_connections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "cc_update_own" ON public.calendar_connections FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "cc_delete_own" ON public.calendar_connections FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER trg_cc_touch BEFORE UPDATE ON public.calendar_connections FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.calendar_sync_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('google','microsoft')),
  selected_calendar_ids TEXT[] NOT NULL DEFAULT '{}',
  default_write_calendar_id TEXT,
  sync_days_past INTEGER NOT NULL DEFAULT 30,
  sync_days_future INTEGER NOT NULL DEFAULT 90,
  two_way_sync BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, provider)
);
ALTER TABLE public.calendar_sync_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "css_all_own" ON public.calendar_sync_settings FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_css_touch BEFORE UPDATE ON public.calendar_sync_settings FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.external_calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('google','microsoft')),
  external_id TEXT NOT NULL,
  calendar_id TEXT NOT NULL,
  calendar_name TEXT,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  all_day BOOLEAN NOT NULL DEFAULT false,
  location TEXT,
  meeting_link TEXT,
  html_link TEXT,
  etag TEXT,
  raw JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, provider, external_id)
);
CREATE INDEX idx_external_events_user_time ON public.external_calendar_events (user_id, start_time);
ALTER TABLE public.external_calendar_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ece_all_own" ON public.external_calendar_events FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_ece_touch BEFORE UPDATE ON public.external_calendar_events FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

ALTER TABLE public.study_events
  ADD COLUMN external_provider TEXT,
  ADD COLUMN external_calendar_id TEXT,
  ADD COLUMN external_id TEXT,
  ADD COLUMN external_etag TEXT;

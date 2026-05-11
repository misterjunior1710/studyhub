
CREATE OR REPLACE FUNCTION public.set_updated_at_now()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TABLE public.assistant_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'New conversation',
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_assistant_threads_user ON public.assistant_threads(user_id, last_message_at DESC);
ALTER TABLE public.assistant_threads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own threads" ON public.assistant_threads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own threads" ON public.assistant_threads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own threads" ON public.assistant_threads FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own threads" ON public.assistant_threads FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER trg_assistant_threads_updated BEFORE UPDATE ON public.assistant_threads
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_now();

CREATE TABLE public.assistant_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES public.assistant_threads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user','assistant','system')),
  content TEXT NOT NULL DEFAULT '',
  parts JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_assistant_messages_thread ON public.assistant_messages(thread_id, created_at);
ALTER TABLE public.assistant_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own messages" ON public.assistant_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own messages" ON public.assistant_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own messages" ON public.assistant_messages FOR DELETE USING (auth.uid() = user_id);

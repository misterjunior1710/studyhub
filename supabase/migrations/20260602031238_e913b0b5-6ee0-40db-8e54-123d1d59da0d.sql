
INSERT INTO storage.buckets (id, name, public)
VALUES ('academic-imports', 'academic-imports', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users read own academic imports"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'academic-imports' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users upload own academic imports"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'academic-imports' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users delete own academic imports"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'academic-imports' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE TABLE public.academic_imports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_path text NOT NULL,
  mime_type text,
  status text NOT NULL DEFAULT 'pending',
  event_count integer NOT NULL DEFAULT 0,
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.academic_imports TO authenticated;
GRANT ALL ON public.academic_imports TO service_role;

ALTER TABLE public.academic_imports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own imports" ON public.academic_imports
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users create own imports" ON public.academic_imports
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own imports" ON public.academic_imports
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users delete own imports" ON public.academic_imports
FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_academic_imports_user ON public.academic_imports(user_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.touch_academic_imports_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_academic_imports_updated_at
BEFORE UPDATE ON public.academic_imports
FOR EACH ROW EXECUTE FUNCTION public.touch_academic_imports_updated_at();

-- Create table for AI-generated study content
CREATE TABLE public.generated_study_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  topic TEXT NOT NULL,
  subject TEXT NOT NULL,
  grade TEXT NOT NULL,
  stream TEXT NOT NULL,
  
  -- Generated content sections
  explanation TEXT,
  key_concepts JSONB DEFAULT '[]'::jsonb,
  revision_notes TEXT,
  examples JSONB DEFAULT '[]'::jsonb,
  practice_questions JSONB DEFAULT '[]'::jsonb,
  
  -- Metadata
  sources JSONB DEFAULT '[]'::jsonb,
  generation_status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.generated_study_content ENABLE ROW LEVEL SECURITY;

-- Users can create their own content
CREATE POLICY "Users can create their own generated content"
ON public.generated_study_content
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can view their own content
CREATE POLICY "Users can view their own generated content"
ON public.generated_study_content
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own content
CREATE POLICY "Users can update their own generated content"
ON public.generated_study_content
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own content
CREATE POLICY "Users can delete their own generated content"
ON public.generated_study_content
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_generated_study_content_updated_at
BEFORE UPDATE ON public.generated_study_content
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();
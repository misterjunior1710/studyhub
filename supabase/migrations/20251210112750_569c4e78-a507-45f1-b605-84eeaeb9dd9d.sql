-- Add columns for file and voice message support to group_messages
ALTER TABLE public.group_messages 
ADD COLUMN IF NOT EXISTS file_url TEXT,
ADD COLUMN IF NOT EXISTS file_type TEXT,
ADD COLUMN IF NOT EXISTS audio_url TEXT,
ADD COLUMN IF NOT EXISTS audio_duration INTEGER;

-- Add comments for clarity
COMMENT ON COLUMN public.group_messages.file_type IS 'Type: image, pdf, or other';
COMMENT ON COLUMN public.group_messages.audio_duration IS 'Duration in seconds';

-- Create storage bucket for group chat media
INSERT INTO storage.buckets (id, name, public)
VALUES ('group-chat-files', 'group-chat-files', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policy for group-chat-files bucket - upload
CREATE POLICY "Users can upload group chat files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'group-chat-files');

-- RLS policy for group-chat-files bucket - view
CREATE POLICY "Anyone can view group chat files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'group-chat-files');

-- RLS policy for group-chat-files bucket - delete own files
CREATE POLICY "Users can delete their own group chat files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'group-chat-files' AND auth.uid()::text = (storage.foldername(name))[1]);
-- Add file and audio support to direct_messages
ALTER TABLE public.direct_messages
ADD COLUMN file_url TEXT,
ADD COLUMN file_type TEXT,
ADD COLUMN file_name TEXT,
ADD COLUMN audio_url TEXT,
ADD COLUMN audio_duration INTEGER;

-- Create storage bucket for DM files
INSERT INTO storage.buckets (id, name, public)
VALUES ('dm-files', 'dm-files', true);

-- Storage policies for dm-files bucket
CREATE POLICY "Users can upload DM files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'dm-files' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Users can view DM files"
ON storage.objects FOR SELECT
USING (bucket_id = 'dm-files');

CREATE POLICY "Users can delete their own DM files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'dm-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
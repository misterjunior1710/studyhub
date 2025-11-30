-- Create storage bucket for post files
insert into storage.buckets (id, name, public)
values ('post-files', 'post-files', true);

-- Create RLS policies for post-files bucket
CREATE POLICY "Public can view post files"
ON storage.objects FOR SELECT
USING (bucket_id = 'post-files');

CREATE POLICY "Authenticated users can upload post files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'post-files' 
  AND auth.uid() IS NOT NULL
  AND (storage.extension(name) = 'pdf' OR storage.extension(name) = 'jpg' OR storage.extension(name) = 'jpeg')
);

CREATE POLICY "Users can delete their own post files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'post-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Add file_url column to posts table for storing uploaded file URLs
ALTER TABLE public.posts ADD COLUMN file_url text;

-- Add post_type column to distinguish between doubts and memes
ALTER TABLE public.posts ADD COLUMN post_type text NOT NULL DEFAULT 'doubt';

-- Add a check constraint for post_type
ALTER TABLE public.posts ADD CONSTRAINT posts_type_check CHECK (post_type IN ('doubt', 'meme', 'general'));
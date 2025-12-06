-- Drop the existing restrictive upload policy
DROP POLICY IF EXISTS "Authenticated users can upload post files" ON storage.objects;

-- Create a new policy that allows all common image formats plus PDF
CREATE POLICY "Authenticated users can upload files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'post-files' AND
  auth.uid() IS NOT NULL AND
  (
    storage.extension(name) = 'pdf' OR
    storage.extension(name) = 'jpg' OR
    storage.extension(name) = 'jpeg' OR
    storage.extension(name) = 'png' OR
    storage.extension(name) = 'gif' OR
    storage.extension(name) = 'webp'
  )
);

-- Add UPDATE policy for upsert to work (needed for avatar updates)
CREATE POLICY "Users can update their own files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'post-files' AND
  (auth.uid())::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'post-files' AND
  (auth.uid())::text = (storage.foldername(name))[1]
);
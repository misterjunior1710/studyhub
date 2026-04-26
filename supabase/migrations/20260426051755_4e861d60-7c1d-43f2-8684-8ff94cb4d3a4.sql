UPDATE storage.buckets
SET public = false
WHERE id = 'group-chat-files';

DROP POLICY IF EXISTS "Anyone can view group chat files" ON storage.objects;

CREATE POLICY "Group members can view group chat files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'group-chat-files'
  AND (storage.foldername(name))[2] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  AND public.is_group_member(((storage.foldername(name))[2])::uuid, auth.uid())
);
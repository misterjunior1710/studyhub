DROP POLICY IF EXISTS "Users can upload group chat files" ON storage.objects;

CREATE POLICY "Group members can upload group chat files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'group-chat-files'
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND (storage.foldername(name))[2] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  AND public.is_group_member(((storage.foldername(name))[2])::uuid, auth.uid())
);
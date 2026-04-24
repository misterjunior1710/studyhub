-- 1. Make dm-files bucket private
UPDATE storage.buckets SET public = false WHERE id = 'dm-files';

-- 2. Drop existing overly-permissive policies on storage.objects for dm-files
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN
    SELECT polname FROM pg_policy
    WHERE polrelid = 'storage.objects'::regclass
      AND (
        polname ILIKE '%dm-files%'
        OR polname ILIKE '%dm_files%'
        OR polname ILIKE '%dm files%'
      )
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.polname);
  END LOOP;
END $$;

-- 3. Helper function: can current user access a dm-files object at given path?
-- Path layout: {senderUserId}/{filename}
-- Access allowed if:
--   a) auth.uid() is the uploader (first folder segment), OR
--   b) auth.uid() shares a conversation with the uploader AND a direct_message
--      in that conversation references this file path in file_url or audio_url.
CREATE OR REPLACE FUNCTION public.can_access_dm_file(_object_name text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH parts AS (
    SELECT
      auth.uid() AS uid,
      (string_to_array(_object_name, '/'))[1]::uuid AS uploader_id,
      _object_name AS path
  )
  SELECT
    parts.uid IS NOT NULL
    AND (
      parts.uid = parts.uploader_id
      OR EXISTS (
        SELECT 1
        FROM public.conversations c
        JOIN public.direct_messages dm ON dm.conversation_id = c.id
        WHERE (
              (c.user1_id = parts.uid AND c.user2_id = parts.uploader_id)
           OR (c.user2_id = parts.uid AND c.user1_id = parts.uploader_id)
        )
        AND (
          dm.file_url  LIKE '%/dm-files/' || parts.path
          OR dm.audio_url LIKE '%/dm-files/' || parts.path
        )
      )
    )
  FROM parts;
$$;

-- 4. SELECT policy — only conversation participants
CREATE POLICY "dm-files: participants can read"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'dm-files'
  AND public.can_access_dm_file(name)
);

-- 5. INSERT policy — only allow uploads under your own user-id folder
CREATE POLICY "dm-files: users upload to own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'dm-files'
  AND auth.uid() IS NOT NULL
  AND (string_to_array(name, '/'))[1] = auth.uid()::text
);

-- 6. UPDATE policy — only owner of the path
CREATE POLICY "dm-files: users update own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'dm-files'
  AND (string_to_array(name, '/'))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'dm-files'
  AND (string_to_array(name, '/'))[1] = auth.uid()::text
);

-- 7. DELETE policy — only owner of the path
CREATE POLICY "dm-files: users delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'dm-files'
  AND (string_to_array(name, '/'))[1] = auth.uid()::text
);
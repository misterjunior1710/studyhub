-- Protect post attachment storage
UPDATE storage.buckets
SET public = false
WHERE id = 'post-files';

DROP POLICY IF EXISTS "Public can view post files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view post files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own post files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload files" ON storage.objects;

CREATE POLICY "Authenticated users can view post files"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'post-files');

CREATE POLICY "Authenticated users can upload post files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'post-files'
  AND auth.uid() IS NOT NULL
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND lower(storage.extension(name)) IN ('pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp')
);

CREATE POLICY "Users can update their own post files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'post-files'
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'post-files'
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND lower(storage.extension(name)) IN ('pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp')
);

CREATE POLICY "Users can delete their own post files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'post-files'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Public avatars should not be stored in the private post attachment bucket going forward
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET public = true,
    file_size_limit = 2097152,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;

CREATE POLICY "Public can view avatars"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatars"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND lower(storage.extension(name)) IN ('jpg', 'jpeg', 'png', 'gif', 'webp')
);

CREATE POLICY "Users can update their own avatars"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND lower(storage.extension(name)) IN ('jpg', 'jpeg', 'png', 'gif', 'webp')
);

CREATE POLICY "Users can delete their own avatars"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Restrict direct execution of SECURITY DEFINER functions by default
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM PUBLIC;
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM anon;
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM authenticated;

-- Functions intentionally called by signed-in users from the app
GRANT EXECUTE ON FUNCTION public.create_whiteboard(text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_leaderboard(text, text, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_rank(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.assign_daily_missions() TO authenticated;
GRANT EXECUTE ON FUNCTION public.assign_weekly_missions() TO authenticated;
GRANT EXECUTE ON FUNCTION public.purchase_streak_freeze() TO authenticated;

-- Queue wrappers are only for backend email processing
GRANT EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.delete_email(text, bigint) TO service_role;
GRANT EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) TO service_role;
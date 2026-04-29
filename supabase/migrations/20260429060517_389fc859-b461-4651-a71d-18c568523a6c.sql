-- Restrict public profile reads to the safe public_profiles view instead of the full profiles table
DROP POLICY IF EXISTS "Authenticated users can view public profiles" ON public.profiles;

-- Ensure the public profile surface only exposes intended non-sensitive fields
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT
  id,
  username,
  avatar_url,
  bio,
  country,
  grade,
  stream,
  points,
  streak_days,
  created_at,
  is_public
FROM public.profiles
WHERE COALESCE(is_public, false) = true;

GRANT SELECT ON public.public_profiles TO authenticated;

-- Explicitly block direct client-side notification creation; system trigger functions still work
DROP POLICY IF EXISTS "System creates notifications via trusted functions" ON public.notifications;
DROP POLICY IF EXISTS "System can create notifications via triggers" ON public.notifications;

CREATE POLICY "System can create notifications via triggers"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (false);
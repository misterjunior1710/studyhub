-- Drop and recreate the view with security_invoker to respect RLS
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles
WITH (security_invoker = true)
AS
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
FROM profiles
WHERE is_public = true;

-- Add policy to allow authenticated users to view public profiles
CREATE POLICY "Authenticated users can view public profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (is_public = true);

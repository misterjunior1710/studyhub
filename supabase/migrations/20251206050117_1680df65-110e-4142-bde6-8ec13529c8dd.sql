-- Drop the policy that exposes all profile fields to other users
DROP POLICY IF EXISTS "Authenticated users can view public profiles" ON public.profiles;

-- Create a secure view with only safe public fields
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
WHERE is_public = true;

-- Grant access to authenticated users
GRANT SELECT ON public.public_profiles TO authenticated;

-- Enable RLS on the view (views inherit from underlying table)
-- The view already filters to is_public = true
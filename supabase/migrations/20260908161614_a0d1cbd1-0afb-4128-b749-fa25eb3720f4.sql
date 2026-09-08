-- Allow the admin check helper to run for anonymous visitors (used inside the posts read policy)
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;

-- Public read access to comments (non-destructive; write policies unchanged)
DROP POLICY IF EXISTS "Public can view comments" ON public.comments;
CREATE POLICY "Public can view comments"
ON public.comments
FOR SELECT
TO anon
USING (
  EXISTS (
    SELECT 1 FROM public.posts p
    WHERE p.id = comments.post_id
      AND COALESCE(p.is_hidden, false) = false
      AND COALESCE(p.is_flagged, false) = false
  )
);

-- Limit anonymous access on profiles to non-sensitive columns only
REVOKE SELECT ON public.profiles FROM anon;
GRANT SELECT (id, username, avatar_url, bio, country, grade, stream, points, created_at) ON public.profiles TO anon;

DROP POLICY IF EXISTS "Public can view public profile basics" ON public.profiles;
CREATE POLICY "Public can view public profile basics"
ON public.profiles
FOR SELECT
TO anon
USING (COALESCE(is_public, true) = true AND COALESCE(is_banned, false) = false);

-- Public read of the public profile cards table
DROP POLICY IF EXISTS "Public can view public profile cards" ON public.public_profiles;
CREATE POLICY "Public can view public profile cards"
ON public.public_profiles
FOR SELECT
TO anon
USING (is_public = true);

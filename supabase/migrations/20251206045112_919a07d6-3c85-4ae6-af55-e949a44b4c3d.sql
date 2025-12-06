-- Drop the existing SELECT policy
DROP POLICY IF EXISTS "Posts are viewable by everyone except hidden" ON public.posts;

-- Create improved policy with explicit NULL handling and clearer logic
CREATE POLICY "Posts are viewable with proper access control"
ON public.posts
FOR SELECT
USING (
  -- Admins can see everything
  is_admin()
  -- Post owners can see their own posts
  OR (auth.uid() = user_id)
  -- Everyone else can only see posts that are NOT hidden AND NOT flagged
  OR (COALESCE(is_hidden, false) = false AND COALESCE(is_flagged, false) = false)
);
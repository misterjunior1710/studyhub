-- Drop the existing SELECT policy
DROP POLICY IF EXISTS "Posts are viewable with proper access control" ON public.posts;

-- Create policy requiring authentication for viewing posts
CREATE POLICY "Authenticated users can view posts"
ON public.posts
FOR SELECT
TO authenticated
USING (
  -- Admins can see everything
  is_admin()
  -- Post owners can see their own posts (including flagged/hidden)
  OR (auth.uid() = user_id)
  -- Other authenticated users can only see posts that are NOT hidden AND NOT flagged
  OR (COALESCE(is_hidden, false) = false AND COALESCE(is_flagged, false) = false)
);
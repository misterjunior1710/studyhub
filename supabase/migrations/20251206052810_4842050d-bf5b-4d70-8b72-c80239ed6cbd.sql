-- Drop the existing SELECT policy that requires authentication
DROP POLICY IF EXISTS "Authenticated users can view posts" ON public.posts;

-- Create new policy that allows anyone to view non-hidden, non-flagged posts
CREATE POLICY "Anyone can view public posts" 
ON public.posts 
FOR SELECT 
USING (
  is_admin() OR 
  (auth.uid() = user_id) OR 
  ((COALESCE(is_hidden, false) = false) AND (COALESCE(is_flagged, false) = false))
);
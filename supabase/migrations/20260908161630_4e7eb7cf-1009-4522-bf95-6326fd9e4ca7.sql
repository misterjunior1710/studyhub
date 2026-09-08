REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon;

DROP POLICY IF EXISTS "Anyone can view public posts" ON public.posts;
CREATE POLICY "Members can view posts"
ON public.posts
FOR SELECT
TO authenticated
USING (
  is_admin()
  OR auth.uid() = user_id
  OR (COALESCE(is_hidden, false) = false AND COALESCE(is_flagged, false) = false)
);

CREATE POLICY "Public can view visible posts"
ON public.posts
FOR SELECT
TO anon
USING (
  COALESCE(is_hidden, false) = false
  AND COALESCE(is_flagged, false) = false
);

-- Drop the existing policy
DROP POLICY IF EXISTS "Authenticated users can view public profiles" ON public.profiles;

-- Recreate with explicit auth check
CREATE POLICY "Authenticated users can view public profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (is_public = true AND auth.uid() IS NOT NULL);
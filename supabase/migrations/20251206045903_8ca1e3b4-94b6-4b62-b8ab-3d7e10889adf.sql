-- Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON public.comments;

-- Create policy requiring authentication
CREATE POLICY "Authenticated users can view comments"
ON public.comments
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);
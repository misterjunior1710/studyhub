-- Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Votes are viewable by everyone" ON public.votes;

-- Create restrictive policy - users can only see their own votes
CREATE POLICY "Users can view their own votes"
ON public.votes
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all votes for moderation
CREATE POLICY "Admins can view all votes"
ON public.votes
FOR SELECT
USING (is_admin());
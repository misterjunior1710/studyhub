-- Add new columns to posts table for anonymous posting and quiet mode
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS is_anonymous boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS quiet_mode boolean DEFAULT false;

-- Add new columns to comments table for verification
ALTER TABLE public.comments
ADD COLUMN IF NOT EXISTS is_helpful boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS verified_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS verified_at timestamptz,
ADD COLUMN IF NOT EXISTS helpful_count integer DEFAULT 0;

-- Create comment_helpful_votes table for tracking helpful votes
CREATE TABLE IF NOT EXISTS public.comment_helpful_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id uuid NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(comment_id, user_id)
);

-- Enable RLS on comment_helpful_votes
ALTER TABLE public.comment_helpful_votes ENABLE ROW LEVEL SECURITY;

-- Policies for comment_helpful_votes
CREATE POLICY "Users can view all helpful votes"
ON public.comment_helpful_votes
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can add helpful votes"
ON public.comment_helpful_votes
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own helpful votes"
ON public.comment_helpful_votes
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Function to check if user is a verifier
CREATE OR REPLACE FUNCTION public.is_verifier(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'verifier'
  )
$$;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_comments_verified ON public.comments(is_verified) WHERE is_verified = true;
CREATE INDEX IF NOT EXISTS idx_posts_anonymous ON public.posts(is_anonymous) WHERE is_anonymous = true;
CREATE INDEX IF NOT EXISTS idx_comment_helpful_votes_comment ON public.comment_helpful_votes(comment_id);
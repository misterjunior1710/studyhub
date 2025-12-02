-- Add moderation columns to posts table
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS is_hidden boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_flagged boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS flag_reason text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS flagged_at timestamp with time zone DEFAULT NULL,
ADD COLUMN IF NOT EXISTS flagged_by uuid DEFAULT NULL;

-- Create index for faster moderation queries
CREATE INDEX IF NOT EXISTS idx_posts_moderation ON public.posts (is_hidden, is_flagged);

-- Update RLS to hide flagged/hidden posts from non-admins
DROP POLICY IF EXISTS "Posts are viewable by everyone" ON public.posts;

CREATE POLICY "Posts are viewable by everyone except hidden" 
ON public.posts 
FOR SELECT 
USING (
  (NOT is_hidden AND NOT is_flagged) 
  OR is_admin() 
  OR auth.uid() = user_id
);
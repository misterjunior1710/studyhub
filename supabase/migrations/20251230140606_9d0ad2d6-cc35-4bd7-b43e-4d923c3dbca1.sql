-- Add columns for mentions and hashtags to posts table
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS mentions text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS hashtags text[] DEFAULT '{}';

-- Add GIN index for efficient hashtag searching
CREATE INDEX IF NOT EXISTS idx_posts_hashtags ON public.posts USING gin(hashtags);

-- Add GIN index for efficient mention searching
CREATE INDEX IF NOT EXISTS idx_posts_mentions ON public.posts USING gin(mentions);
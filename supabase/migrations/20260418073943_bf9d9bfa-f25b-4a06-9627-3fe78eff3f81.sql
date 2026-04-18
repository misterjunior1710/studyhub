ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS share_count INTEGER NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_posts_share_count ON public.posts(share_count DESC);
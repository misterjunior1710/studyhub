ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS is_mature boolean NOT NULL DEFAULT false;
COMMENT ON COLUMN public.posts.is_mature IS 'Set explicitly by the author or a moderator when the post itself contains adult/mature content. Feed visibility filters on this, never on the author profile grade.';
UPDATE public.posts SET grade = 'Grade 11' WHERE id = '1fbca600-efed-4dc8-b2a5-6cdc4ac4d151';
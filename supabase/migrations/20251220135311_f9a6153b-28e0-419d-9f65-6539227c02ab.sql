-- Drop the existing constraint and add a new one that includes 'update'
ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_type_check;
ALTER TABLE public.posts ADD CONSTRAINT posts_type_check CHECK (post_type IN ('doubt', 'note', 'resource', 'discussion', 'general', 'update'));
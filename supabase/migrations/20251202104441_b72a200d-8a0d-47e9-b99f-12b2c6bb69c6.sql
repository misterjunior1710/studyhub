-- Add foreign key from comments to profiles for username display
ALTER TABLE public.comments
ADD CONSTRAINT comments_user_id_fkey_profiles
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
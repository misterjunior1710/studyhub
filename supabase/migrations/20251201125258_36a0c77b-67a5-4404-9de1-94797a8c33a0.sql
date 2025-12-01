-- First drop the constraint if it exists (ignore errors)
DO $$ 
BEGIN
    ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_user_id_fkey;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Now add the foreign key relationship between posts and profiles
ALTER TABLE public.posts 
ADD CONSTRAINT posts_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.profiles(id) 
ON DELETE CASCADE;
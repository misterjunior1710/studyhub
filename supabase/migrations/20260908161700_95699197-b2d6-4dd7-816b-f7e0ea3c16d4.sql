DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (is_admin());

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all votes" ON public.votes;
CREATE POLICY "Admins can view all votes"
ON public.votes
FOR SELECT
TO authenticated
USING (is_admin());

DROP POLICY IF EXISTS "Users can view their own votes" ON public.votes;
CREATE POLICY "Users can view their own votes"
ON public.votes
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

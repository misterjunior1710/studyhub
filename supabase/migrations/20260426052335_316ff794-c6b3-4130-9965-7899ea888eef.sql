DROP POLICY IF EXISTS "Authenticated users can view XP totals" ON public.user_xp_totals;

CREATE POLICY "Users can view their own XP totals"
ON public.user_xp_totals
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all XP totals"
ON public.user_xp_totals
FOR SELECT
TO authenticated
USING (public.is_admin());
DROP POLICY IF EXISTS "Only admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can delete roles" ON public.user_roles;

CREATE POLICY "Only super admin can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.is_super_admin());

CREATE POLICY "Only super admin can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.is_super_admin());
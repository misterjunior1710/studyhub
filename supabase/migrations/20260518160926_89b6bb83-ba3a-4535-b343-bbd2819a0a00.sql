-- Super admin check (by email, matching existing Super Admin identity)
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
      AND lower(email) = 'misterjunior1710@gmail.com'
  );
$$;

REVOKE ALL ON FUNCTION public.is_super_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;

-- Restrict audit log reads to super admin only
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Super admin can view audit logs" ON public.audit_logs;

CREATE POLICY "Super admin can view audit logs"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (public.is_super_admin());
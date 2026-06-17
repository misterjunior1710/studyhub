
-- Restrict writes on system_config and admin_settings to Super Admin only.
-- Reads remain available to admins so the existing admin UI keeps working.

-- admin_settings
DROP POLICY IF EXISTS "Admins can insert settings" ON public.admin_settings;
DROP POLICY IF EXISTS "Admins can update settings" ON public.admin_settings;

CREATE POLICY "Super admin can insert settings"
  ON public.admin_settings FOR INSERT TO authenticated
  WITH CHECK (public.is_super_admin());

CREATE POLICY "Super admin can update settings"
  ON public.admin_settings FOR UPDATE TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

CREATE POLICY "Super admin can delete settings"
  ON public.admin_settings FOR DELETE TO authenticated
  USING (public.is_super_admin());

-- system_config: replace ALL policy with read-for-admin + write-for-super-admin
DROP POLICY IF EXISTS "Admins can manage system_config" ON public.system_config;

CREATE POLICY "Admins can view system_config"
  ON public.system_config FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "Super admin can insert system_config"
  ON public.system_config FOR INSERT TO authenticated
  WITH CHECK (public.is_super_admin());

CREATE POLICY "Super admin can update system_config"
  ON public.system_config FOR UPDATE TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

CREATE POLICY "Super admin can delete system_config"
  ON public.system_config FOR DELETE TO authenticated
  USING (public.is_super_admin());

-- Revoke anon EXECUTE on is_admin() (linter: anon-executable SECURITY DEFINER).
-- is_admin() reads auth.uid() and is only meaningful for authenticated users.
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role;

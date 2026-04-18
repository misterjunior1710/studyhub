-- The trg_check_badges_* functions already SET search_path in their bodies but the linter
-- wants it as a function attribute. Recreate with explicit attribute.
CREATE OR REPLACE FUNCTION public.trg_check_badges_xp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  PERFORM public.check_and_award_badges(NEW.user_id);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.trg_check_badges_coins()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  PERFORM public.check_and_award_badges(NEW.user_id);
  RETURN NEW;
END;
$$;

-- Replace overly-broad admin policy with explicit per-command policies
DROP POLICY IF EXISTS "Admins manage badges" ON public.badges;

CREATE POLICY "Admins insert badges"
ON public.badges FOR INSERT TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "Admins update badges"
ON public.badges FOR UPDATE TO authenticated
USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admins delete badges"
ON public.badges FOR DELETE TO authenticated
USING (public.is_admin());
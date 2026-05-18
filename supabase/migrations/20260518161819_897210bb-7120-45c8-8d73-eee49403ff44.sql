CREATE OR REPLACE FUNCTION public.protect_profile_moderation_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_admin boolean;
BEGIN
  -- Allow SECURITY DEFINER functions / service_role (no auth.uid()) and admins to update freely
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  v_is_admin := public.has_role(auth.uid(), 'admin'::app_role);
  IF v_is_admin THEN
    RETURN NEW;
  END IF;

  -- Non-admin: revert any attempt to modify moderation fields
  NEW.is_banned    := OLD.is_banned;
  NEW.banned_until := OLD.banned_until;
  NEW.strike_count := OLD.strike_count;
  NEW.safe_mode    := OLD.safe_mode;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.protect_profile_moderation_fields() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS protect_profile_moderation_fields_trg ON public.profiles;
CREATE TRIGGER protect_profile_moderation_fields_trg
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.protect_profile_moderation_fields();
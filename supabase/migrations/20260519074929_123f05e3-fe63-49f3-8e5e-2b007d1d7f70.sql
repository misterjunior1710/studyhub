-- 1) Flag column
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_test_account boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_profiles_is_test_account
  ON public.profiles (is_test_account)
  WHERE is_test_account = false;

-- 2) Backfill seeded demo users (created via seed-test-data, emails end with .test@example.com)
UPDATE public.profiles p
SET is_test_account = true
FROM auth.users u
WHERE u.id = p.id
  AND u.email ILIKE '%.test@example.com';

-- 3) Leaderboard: exclude test accounts from public listings (still shows the caller themselves)
CREATE OR REPLACE FUNCTION public.get_leaderboard(
  p_scope text DEFAULT 'global'::text,
  p_period text DEFAULT 'weekly'::text,
  p_limit integer DEFAULT 50
)
RETURNS TABLE(user_id uuid, username text, avatar_url text, country text, current_league text, xp integer, rank bigint)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_country text;
BEGIN
  IF v_uid IS NULL THEN RETURN; END IF;
  SELECT pr.country INTO v_country FROM public.profiles pr WHERE pr.id = v_uid;

  RETURN QUERY
  WITH base AS (
    SELECT
      p.id AS user_id,
      p.username,
      p.avatar_url,
      p.country,
      p.current_league,
      CASE WHEN p_period = 'weekly' THEN COALESCE(uxt.weekly_xp, 0) ELSE COALESCE(uxt.total_xp, 0) END AS xp
    FROM public.profiles p
    LEFT JOIN public.user_xp_totals uxt ON uxt.user_id = p.id
    WHERE (p.is_public = true OR p.id = v_uid)
      AND (p.is_test_account = false OR p.id = v_uid)
  ),
  scoped AS (
    SELECT * FROM base
    WHERE
      CASE
        WHEN p_scope = 'country' THEN base.country = v_country AND v_country IS NOT NULL
        WHEN p_scope = 'friends' THEN base.user_id IN (
          SELECT CASE WHEN f.user_id = v_uid THEN f.friend_id ELSE f.user_id END
          FROM public.friends f
          WHERE f.status = 'accepted' AND (f.user_id = v_uid OR f.friend_id = v_uid)
        ) OR base.user_id = v_uid
        ELSE true
      END
  )
  SELECT
    s.user_id, s.username, s.avatar_url, s.country, s.current_league, s.xp,
    ROW_NUMBER() OVER (ORDER BY s.xp DESC, s.user_id) AS rank
  FROM scoped s
  ORDER BY s.xp DESC, s.user_id
  LIMIT p_limit;
END;
$function$;
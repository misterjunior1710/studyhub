-- ============ BADGES CATALOG ============
CREATE TABLE public.badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  rarity text NOT NULL CHECK (rarity IN ('common','rare','epic','legendary')),
  criteria_type text NOT NULL,
  criteria_value integer NOT NULL DEFAULT 1,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone signed in can view badges"
ON public.badges FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins manage badges"
ON public.badges FOR ALL TO authenticated
USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============ USER BADGES ============
CREATE TABLE public.user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  badge_slug text NOT NULL REFERENCES public.badges(slug) ON DELETE CASCADE,
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  seen boolean NOT NULL DEFAULT false,
  UNIQUE (user_id, badge_slug)
);

CREATE INDEX idx_user_badges_user ON public.user_badges(user_id);

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own badges"
ON public.user_badges FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "View public users' badges"
ON public.user_badges FOR SELECT
USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = user_badges.user_id AND p.is_public = true)
);

CREATE POLICY "Users mark own badges seen"
ON public.user_badges FOR UPDATE
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ LEAGUES ============
CREATE TABLE public.leagues (
  slug text PRIMARY KEY,
  name text NOT NULL,
  min_weekly_xp integer NOT NULL,
  icon text NOT NULL,
  color text NOT NULL,
  tier integer NOT NULL UNIQUE
);

ALTER TABLE public.leagues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone signed in can view leagues"
ON public.leagues FOR SELECT TO authenticated USING (true);

-- ============ PROFILE EXTENSION ============
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS current_league text NOT NULL DEFAULT 'bronze';

-- ============ SEED LEAGUES ============
INSERT INTO public.leagues (slug, name, min_weekly_xp, icon, color, tier) VALUES
  ('bronze',   'Bronze',   0,    '🥉', 'amber',   1),
  ('silver',   'Silver',   100,  '🥈', 'slate',   2),
  ('gold',     'Gold',     300,  '🥇', 'yellow',  3),
  ('platinum', 'Platinum', 700,  '💎', 'cyan',    4),
  ('diamond',  'Diamond',  1500, '💠', 'blue',    5);

-- ============ SEED BADGES ============
INSERT INTO public.badges (slug, name, description, icon, rarity, criteria_type, criteria_value, sort_order) VALUES
  -- Streak badges
  ('streak_3',     'On Fire',          '3-day streak',                 '🔥', 'common',    'streak_days', 3,    10),
  ('streak_7',     'Week Warrior',     '7-day streak',                 '🔥', 'rare',      'streak_days', 7,    11),
  ('streak_30',    'Monthly Master',   '30-day streak',                '⚡', 'epic',      'streak_days', 30,   12),
  ('streak_100',   'Centurion',        '100-day streak',               '💯', 'legendary', 'streak_days', 100,  13),
  ('streak_365',   'Year One',         '365-day streak',               '🏆', 'legendary', 'streak_days', 365,  14),

  -- XP/Level badges
  ('xp_100',       'Getting Started',  'Earn 100 XP',                  '✨', 'common',    'total_xp', 100,    20),
  ('xp_500',       'Rising Star',      'Earn 500 XP',                  '⭐', 'rare',      'total_xp', 500,    21),
  ('xp_2000',      'XP Hunter',        'Earn 2,000 XP',                '🌟', 'epic',      'total_xp', 2000,   22),
  ('xp_10000',     'Legend',           'Earn 10,000 XP',               '👑', 'legendary', 'total_xp', 10000,  23),

  -- Coin badges
  ('coins_100',    'Saver',            'Earn 100 coins',               '🪙', 'common',    'total_coins', 100,  30),
  ('coins_1000',   'Wealthy',          'Earn 1,000 coins',             '💰', 'rare',      'total_coins', 1000, 31),
  ('coins_10000',  'Tycoon',           'Earn 10,000 coins',            '💎', 'epic',      'total_coins', 10000,32),

  -- Activity badges
  ('first_post',     'First Words',     'Create your first post',      '📝', 'common',    'posts_count', 1,    40),
  ('first_comment',  'First Reply',     'Post your first comment',     '💬', 'common',    'comments_count', 1, 41),
  ('answers_50',     'Helper',          'Post 50 comments/answers',    '🤝', 'rare',      'comments_count', 50, 42),
  ('answers_500',    'Mentor',          'Post 500 comments/answers',   '🎓', 'epic',      'comments_count', 500,43),

  -- Quiz badges
  ('quiz_1',       'First Attempt',    'Complete your first quiz',     '🧠', 'common',    'quiz_attempts', 1,   50),
  ('quiz_25',      'Quiz Whiz',        'Complete 25 quizzes',          '🧪', 'rare',      'quiz_attempts', 25,  51),
  ('quiz_100',     'Quiz Master',      'Complete 100 quizzes',         '🎯', 'epic',      'quiz_attempts', 100, 52),

  -- Study session badges
  ('study_1',      'Focused',          'Complete first 25-min session','📚', 'common',    'study_sessions', 1, 60),
  ('study_50',     'Scholar',          '50 study sessions completed',  '🎒', 'rare',      'study_sessions', 50,61),

  -- Goal/perfect day badges
  ('perfect_1',    'Perfect Day',      'Complete all 3 goals in a day','🌈', 'rare',      'perfect_days', 1,    70),
  ('perfect_7',    'Perfect Week',     '7 perfect days',               '🎉', 'epic',      'perfect_days', 7,    71),
  ('perfect_30',   'Unstoppable',      '30 perfect days',              '🚀', 'legendary', 'perfect_days', 30,   72);

-- ============ FUNCTION: Get user level from total XP ============
CREATE OR REPLACE FUNCTION public.get_user_level(p_total_xp integer)
RETURNS jsonb
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT jsonb_build_object(
    'level', GREATEST(1, FLOOR(SQRT(GREATEST(p_total_xp, 0)::numeric / 100))::integer + 1),
    'current_level_xp', GREATEST(p_total_xp, 0) - (POWER(GREATEST(1, FLOOR(SQRT(GREATEST(p_total_xp, 0)::numeric / 100))::integer + 1) - 1, 2) * 100)::integer,
    'next_level_xp', (POWER(GREATEST(1, FLOOR(SQRT(GREATEST(p_total_xp, 0)::numeric / 100))::integer + 1), 2) * 100)::integer - (POWER(GREATEST(1, FLOOR(SQRT(GREATEST(p_total_xp, 0)::numeric / 100))::integer + 1) - 1, 2) * 100)::integer
  );
$$;

-- ============ FUNCTION: Check & award badges ============
CREATE OR REPLACE FUNCTION public.check_and_award_badges(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_streak integer;
  v_total_xp integer;
  v_total_coins integer;
  v_posts_count integer;
  v_comments_count integer;
  v_quiz_count integer;
  v_study_count integer;
  v_perfect_days integer;
  v_badge record;
  v_awarded integer := 0;
  v_user_value integer;
BEGIN
  -- Aggregate stats
  SELECT COALESCE(streak_days, 0) INTO v_streak FROM public.profiles WHERE id = p_user_id;
  SELECT COALESCE(total_xp, 0) INTO v_total_xp FROM public.user_xp_totals WHERE user_id = p_user_id;
  SELECT COALESCE(total_coins_earned, 0) INTO v_total_coins FROM public.user_wallet WHERE user_id = p_user_id;
  SELECT COUNT(*) INTO v_posts_count FROM public.posts WHERE user_id = p_user_id;
  SELECT COUNT(*) INTO v_comments_count FROM public.comments WHERE user_id = p_user_id;
  SELECT COUNT(*) INTO v_quiz_count FROM public.quiz_attempts WHERE user_id = p_user_id;
  SELECT COUNT(*) INTO v_study_count FROM public.study_sessions
    WHERE user_id = p_user_id AND ended_at IS NOT NULL AND duration_minutes >= 25;
  SELECT COUNT(DISTINCT local_date) INTO v_perfect_days
    FROM public.daily_goals dg
    WHERE user_id = p_user_id AND completed = true
    GROUP BY user_id
    HAVING COUNT(DISTINCT local_date) > 0;
  v_perfect_days := COALESCE((
    SELECT COUNT(*) FROM (
      SELECT local_date FROM public.daily_goals
      WHERE user_id = p_user_id AND completed = true
      GROUP BY local_date HAVING COUNT(*) = 3
    ) sub
  ), 0);

  -- Iterate eligible badges
  FOR v_badge IN SELECT * FROM public.badges LOOP
    v_user_value := CASE v_badge.criteria_type
      WHEN 'streak_days'     THEN v_streak
      WHEN 'total_xp'        THEN v_total_xp
      WHEN 'total_coins'     THEN v_total_coins
      WHEN 'posts_count'     THEN v_posts_count
      WHEN 'comments_count'  THEN v_comments_count
      WHEN 'quiz_attempts'   THEN v_quiz_count
      WHEN 'study_sessions'  THEN v_study_count
      WHEN 'perfect_days'    THEN v_perfect_days
      ELSE 0
    END;

    IF v_user_value >= v_badge.criteria_value THEN
      INSERT INTO public.user_badges (user_id, badge_slug)
      VALUES (p_user_id, v_badge.slug)
      ON CONFLICT (user_id, badge_slug) DO NOTHING;
      IF FOUND THEN v_awarded := v_awarded + 1; END IF;
    END IF;
  END LOOP;

  RETURN v_awarded;
END;
$$;

-- ============ TRIGGER: Auto check badges on key events ============
CREATE OR REPLACE FUNCTION public.trg_check_badges_xp()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.check_and_award_badges(NEW.user_id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS check_badges_after_xp ON public.xp_events;
CREATE TRIGGER check_badges_after_xp
AFTER INSERT ON public.xp_events
FOR EACH ROW EXECUTE FUNCTION public.trg_check_badges_xp();

CREATE OR REPLACE FUNCTION public.trg_check_badges_coins()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.check_and_award_badges(NEW.user_id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS check_badges_after_coins ON public.coin_transactions;
CREATE TRIGGER check_badges_after_coins
AFTER INSERT ON public.coin_transactions
FOR EACH ROW EXECUTE FUNCTION public.trg_check_badges_coins();

-- ============ FUNCTION: Recalculate leagues (weekly cron) ============
CREATE OR REPLACE FUNCTION public.recalculate_leagues()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.profiles p
  SET current_league = (
    SELECT slug FROM public.leagues l
    WHERE l.min_weekly_xp <= COALESCE(uxt.weekly_xp, 0)
    ORDER BY l.tier DESC LIMIT 1
  )
  FROM public.user_xp_totals uxt
  WHERE p.id = uxt.user_id;
END;
$$;

-- ============ FUNCTION: Leaderboard ============
CREATE OR REPLACE FUNCTION public.get_leaderboard(
  p_scope text DEFAULT 'global',
  p_period text DEFAULT 'weekly',
  p_limit integer DEFAULT 50
)
RETURNS TABLE (
  user_id uuid,
  username text,
  avatar_url text,
  country text,
  current_league text,
  xp integer,
  rank bigint
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
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
    WHERE p.is_public = true OR p.id = v_uid
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
$$;

-- ============ FUNCTION: Get user's rank ============
CREATE OR REPLACE FUNCTION public.get_user_rank(p_scope text DEFAULT 'global', p_period text DEFAULT 'weekly')
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_rank bigint;
  v_total bigint;
  v_xp integer;
  v_country text;
BEGIN
  IF v_uid IS NULL THEN RETURN jsonb_build_object('rank', null); END IF;
  SELECT pr.country INTO v_country FROM public.profiles pr WHERE pr.id = v_uid;

  WITH base AS (
    SELECT
      p.id AS user_id,
      p.country,
      CASE WHEN p_period = 'weekly' THEN COALESCE(uxt.weekly_xp, 0) ELSE COALESCE(uxt.total_xp, 0) END AS xp
    FROM public.profiles p
    LEFT JOIN public.user_xp_totals uxt ON uxt.user_id = p.id
    WHERE p.is_public = true OR p.id = v_uid
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
  ),
  ranked AS (
    SELECT user_id, xp, ROW_NUMBER() OVER (ORDER BY xp DESC, user_id) AS rnk
    FROM scoped
  )
  SELECT rnk, xp INTO v_rank, v_xp FROM ranked WHERE user_id = v_uid;
  SELECT COUNT(*) INTO v_total FROM scoped;

  RETURN jsonb_build_object('rank', v_rank, 'total', v_total, 'xp', COALESCE(v_xp, 0));
END;
$$;
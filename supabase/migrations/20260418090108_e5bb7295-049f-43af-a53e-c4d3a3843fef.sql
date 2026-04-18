
-- ============================================================================
-- GAMIFICATION FOUNDATION: Wallet, Daily Goals, Coin Transactions, Streak v2
-- ============================================================================

-- 1. Profile additions
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS sound_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS last_streak_date date;

-- Backfill last_streak_date from existing last_active_date
UPDATE public.profiles
SET last_streak_date = last_active_date
WHERE last_streak_date IS NULL AND last_active_date IS NOT NULL;

-- 2. user_wallet
CREATE TABLE IF NOT EXISTS public.user_wallet (
  user_id uuid PRIMARY KEY,
  coins integer NOT NULL DEFAULT 0 CHECK (coins >= 0),
  streak_freezes integer NOT NULL DEFAULT 0 CHECK (streak_freezes >= 0 AND streak_freezes <= 2),
  total_coins_earned integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_wallet ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own wallet" ON public.user_wallet
  FOR SELECT USING (auth.uid() = user_id);

-- No INSERT/UPDATE/DELETE policies = only SECURITY DEFINER functions can write

-- 3. coin_transactions (audit + idempotency)
CREATE TABLE IF NOT EXISTS public.coin_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount integer NOT NULL,
  reason text NOT NULL,
  source_type text,
  source_id uuid,
  idempotency_key text NOT NULL UNIQUE,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_coin_tx_user_date ON public.coin_transactions (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_coin_tx_reason_date ON public.coin_transactions (user_id, reason, created_at DESC);

ALTER TABLE public.coin_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own transactions" ON public.coin_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- 4. daily_goals
CREATE TABLE IF NOT EXISTS public.daily_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  local_date date NOT NULL,
  goal_type text NOT NULL CHECK (goal_type IN ('study', 'answer', 'quiz')),
  target integer NOT NULL,
  progress integer NOT NULL DEFAULT 0,
  completed boolean NOT NULL DEFAULT false,
  reward_claimed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, local_date, goal_type)
);

CREATE INDEX IF NOT EXISTS idx_daily_goals_user_date ON public.daily_goals (user_id, local_date DESC);

ALTER TABLE public.daily_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own goals" ON public.daily_goals
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================================================
-- HELPER: get user's local date
-- ============================================================================
CREATE OR REPLACE FUNCTION public.user_local_date(p_user_id uuid)
RETURNS date
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT (now() AT TIME ZONE COALESCE(
    (SELECT timezone FROM public.profiles WHERE id = p_user_id),
    'UTC'
  ))::date
$$;

-- ============================================================================
-- AWARD COINS (idempotent)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.award_coins(
  p_user_id uuid,
  p_amount integer,
  p_reason text,
  p_source_type text DEFAULT NULL,
  p_source_id uuid DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_idempotency_key text;
  v_local_date date;
  v_inserted boolean := false;
  v_new_balance integer;
BEGIN
  IF p_amount <= 0 THEN
    RETURN jsonb_build_object('success', false, 'reason', 'invalid_amount', 'coins_awarded', 0);
  END IF;

  v_local_date := public.user_local_date(p_user_id);
  v_idempotency_key := p_reason || ':' || COALESCE(p_source_id::text, 'none') || ':' || v_local_date::text || ':' || p_user_id::text;

  -- Insert transaction; conflict means already awarded
  INSERT INTO public.coin_transactions (user_id, amount, reason, source_type, source_id, idempotency_key, metadata)
  VALUES (p_user_id, p_amount, p_reason, p_source_type, p_source_id, v_idempotency_key, p_metadata)
  ON CONFLICT (idempotency_key) DO NOTHING
  RETURNING true INTO v_inserted;

  IF NOT COALESCE(v_inserted, false) THEN
    RETURN jsonb_build_object('success', false, 'reason', 'duplicate', 'coins_awarded', 0);
  END IF;

  -- Upsert wallet (atomic increment)
  INSERT INTO public.user_wallet (user_id, coins, total_coins_earned, updated_at)
  VALUES (p_user_id, p_amount, p_amount, now())
  ON CONFLICT (user_id) DO UPDATE SET
    coins = user_wallet.coins + p_amount,
    total_coins_earned = user_wallet.total_coins_earned + p_amount,
    updated_at = now()
  RETURNING coins INTO v_new_balance;

  RETURN jsonb_build_object(
    'success', true,
    'coins_awarded', p_amount,
    'new_balance', v_new_balance,
    'reason', p_reason
  );
END;
$$;

-- ============================================================================
-- PURCHASE STREAK FREEZE (50 coins, max 2 owned)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.purchase_streak_freeze()
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_wallet record;
  v_cost constant integer := 50;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Lock wallet row
  SELECT * INTO v_wallet FROM public.user_wallet WHERE user_id = v_user_id FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO public.user_wallet (user_id, coins, streak_freezes) VALUES (v_user_id, 0, 0);
    SELECT * INTO v_wallet FROM public.user_wallet WHERE user_id = v_user_id FOR UPDATE;
  END IF;

  IF v_wallet.streak_freezes >= 2 THEN
    RETURN jsonb_build_object('success', false, 'reason', 'max_freezes_owned');
  END IF;

  IF v_wallet.coins < v_cost THEN
    RETURN jsonb_build_object('success', false, 'reason', 'insufficient_coins', 'needed', v_cost, 'have', v_wallet.coins);
  END IF;

  UPDATE public.user_wallet
  SET coins = coins - v_cost,
      streak_freezes = streak_freezes + 1,
      updated_at = now()
  WHERE user_id = v_user_id;

  -- Audit (negative amount for spend)
  INSERT INTO public.coin_transactions (user_id, amount, reason, idempotency_key, metadata)
  VALUES (v_user_id, -v_cost, 'streak_freeze_purchase',
          'streak_freeze:' || gen_random_uuid()::text,
          jsonb_build_object('cost', v_cost));

  RETURN jsonb_build_object('success', true, 'freezes_owned', v_wallet.streak_freezes + 1, 'coins_spent', v_cost);
END;
$$;

-- ============================================================================
-- UPDATE DAILY GOAL PROGRESS
-- ============================================================================
CREATE OR REPLACE FUNCTION public.update_daily_goal(
  p_user_id uuid,
  p_goal_type text,
  p_increment integer DEFAULT 1
)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_local_date date;
  v_target integer;
  v_goal record;
  v_just_completed boolean := false;
  v_bonus_result jsonb;
  v_perfect_result jsonb;
  v_all_complete boolean;
BEGIN
  v_local_date := public.user_local_date(p_user_id);

  -- Default targets
  v_target := CASE p_goal_type
    WHEN 'study' THEN 1
    WHEN 'answer' THEN 2
    WHEN 'quiz' THEN 1
    ELSE 1
  END;

  -- Upsert today's goal row
  INSERT INTO public.daily_goals (user_id, local_date, goal_type, target, progress)
  VALUES (p_user_id, v_local_date, p_goal_type, v_target, LEAST(p_increment, v_target))
  ON CONFLICT (user_id, local_date, goal_type) DO UPDATE SET
    progress = LEAST(daily_goals.progress + p_increment, daily_goals.target),
    updated_at = now()
  RETURNING * INTO v_goal;

  -- Check if just hit completion (and not previously rewarded)
  IF v_goal.progress >= v_goal.target AND NOT v_goal.completed THEN
    UPDATE public.daily_goals
    SET completed = true, reward_claimed = true, updated_at = now()
    WHERE id = v_goal.id AND NOT completed
    RETURNING true INTO v_just_completed;

    IF COALESCE(v_just_completed, false) THEN
      -- Award goal completion bonus
      v_bonus_result := public.award_coins(
        p_user_id,
        CASE p_goal_type WHEN 'study' THEN 25 WHEN 'answer' THEN 15 WHEN 'quiz' THEN 20 ELSE 10 END,
        'goal_complete_' || p_goal_type,
        'daily_goal',
        v_goal.id,
        jsonb_build_object('goal_type', p_goal_type, 'date', v_local_date)
      );

      -- Check if all 3 goals complete today → perfect day bonus
      SELECT COUNT(*) = 3 INTO v_all_complete
      FROM public.daily_goals
      WHERE user_id = p_user_id AND local_date = v_local_date AND completed = true;

      IF v_all_complete THEN
        v_perfect_result := public.award_coins(
          p_user_id, 50, 'daily_perfect', 'daily_goal', NULL,
          jsonb_build_object('date', v_local_date)
        );
      END IF;
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'goal_type', p_goal_type,
    'progress', v_goal.progress,
    'target', v_goal.target,
    'completed', v_goal.progress >= v_goal.target,
    'just_completed', COALESCE(v_just_completed, false),
    'bonus', v_bonus_result,
    'perfect_day', v_perfect_result
  );
END;
$$;

-- ============================================================================
-- STREAK V2 (timezone-aware, freeze-consuming, race-safe)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.update_user_streak_v2(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_today date;
  v_last date;
  v_current_streak integer;
  v_freezes integer;
  v_missed integer;
  v_consumed integer := 0;
  v_milestone boolean := false;
BEGIN
  v_today := public.user_local_date(p_user_id);

  -- Lock profile and wallet
  SELECT last_streak_date, COALESCE(streak_days, 0)
    INTO v_last, v_current_streak
  FROM public.profiles WHERE id = p_user_id FOR UPDATE;

  -- Ensure wallet exists & lock it
  INSERT INTO public.user_wallet (user_id) VALUES (p_user_id) ON CONFLICT DO NOTHING;
  SELECT streak_freezes INTO v_freezes FROM public.user_wallet WHERE user_id = p_user_id FOR UPDATE;

  -- Already counted today
  IF v_last = v_today THEN
    RETURN jsonb_build_object('streak', v_current_streak, 'changed', false, 'today', v_today);
  END IF;

  IF v_last IS NULL OR v_last = v_today - 1 THEN
    -- First day or consecutive day
    v_current_streak := COALESCE(v_current_streak, 0) + 1;
  ELSE
    v_missed := (v_today - v_last) - 1;
    IF v_missed > 0 AND v_missed <= v_freezes THEN
      -- Consume freezes, preserve streak
      v_consumed := v_missed;
      UPDATE public.user_wallet
      SET streak_freezes = streak_freezes - v_consumed, updated_at = now()
      WHERE user_id = p_user_id;
      v_current_streak := v_current_streak + 1;
    ELSE
      -- Streak broken
      v_current_streak := 1;
    END IF;
  END IF;

  -- Milestone check
  IF v_current_streak IN (7, 30, 100, 365) THEN
    v_milestone := true;
  END IF;

  UPDATE public.profiles
  SET streak_days = v_current_streak,
      last_streak_date = v_today,
      last_active_date = v_today
  WHERE id = p_user_id;

  RETURN jsonb_build_object(
    'streak', v_current_streak,
    'changed', true,
    'today', v_today,
    'freezes_consumed', v_consumed,
    'milestone', v_milestone
  );
END;
$$;

-- ============================================================================
-- TRIGGERS: hook into existing actions
-- ============================================================================

-- Comment created → answer goal +1, max 5 coin-rewarded comments/day
CREATE OR REPLACE FUNCTION public.on_comment_gamification()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_today date;
  v_count integer;
BEGIN
  v_today := public.user_local_date(NEW.user_id);

  -- Update streak
  PERFORM public.update_user_streak_v2(NEW.user_id);

  -- Update daily goal
  PERFORM public.update_daily_goal(NEW.user_id, 'answer', 1);

  -- Anti-farming: limit coin-rewarded comments to 5/day
  SELECT COUNT(*) INTO v_count
  FROM public.coin_transactions
  WHERE user_id = NEW.user_id
    AND reason = 'comment_reward'
    AND created_at >= v_today::timestamptz;

  IF v_count < 5 THEN
    PERFORM public.award_coins(NEW.user_id, 2, 'comment_reward', 'comment', NEW.id);
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_comment_gamification ON public.comments;
CREATE TRIGGER trg_comment_gamification
  AFTER INSERT ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.on_comment_gamification();

-- Quiz attempt completed → quiz goal +1, one coin-reward per quiz per day
CREATE OR REPLACE FUNCTION public.on_quiz_attempt_gamification()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_today date;
  v_already integer;
BEGIN
  -- Only reward if scored at least 1
  IF NEW.score <= 0 THEN
    RETURN NEW;
  END IF;

  v_today := public.user_local_date(NEW.user_id);

  PERFORM public.update_user_streak_v2(NEW.user_id);
  PERFORM public.update_daily_goal(NEW.user_id, 'quiz', 1);

  -- Reward coins only once per quiz per day
  SELECT COUNT(*) INTO v_already
  FROM public.coin_transactions
  WHERE user_id = NEW.user_id
    AND reason = 'quiz_reward'
    AND source_id = NEW.quiz_id
    AND created_at >= v_today::timestamptz;

  IF v_already = 0 THEN
    PERFORM public.award_coins(
      NEW.user_id, 10, 'quiz_reward', 'quiz', NEW.quiz_id,
      jsonb_build_object('score', NEW.score, 'total', NEW.total_questions)
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_quiz_attempt_gamification ON public.quiz_attempts;
CREATE TRIGGER trg_quiz_attempt_gamification
  AFTER INSERT ON public.quiz_attempts
  FOR EACH ROW EXECUTE FUNCTION public.on_quiz_attempt_gamification();

-- Study session ≥25min completed → study goal complete + 25 coins
CREATE OR REPLACE FUNCTION public.on_study_session_gamification()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NEW.ended_at IS NULL OR NEW.duration_minutes < 25 THEN
    RETURN NEW;
  END IF;

  -- Validate duration matches actual elapsed time (anti-tamper)
  IF EXTRACT(EPOCH FROM (NEW.ended_at - NEW.started_at)) < (NEW.duration_minutes * 60 - 30) THEN
    RETURN NEW;
  END IF;

  PERFORM public.update_user_streak_v2(NEW.user_id);
  PERFORM public.update_daily_goal(NEW.user_id, 'study', 1);
  -- Goal completion bonus is awarded inside update_daily_goal

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_study_session_gamification ON public.study_sessions;
CREATE TRIGGER trg_study_session_gamification
  AFTER INSERT OR UPDATE OF ended_at ON public.study_sessions
  FOR EACH ROW EXECUTE FUNCTION public.on_study_session_gamification();

-- ============================================================================
-- REALTIME
-- ============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_wallet;
ALTER PUBLICATION supabase_realtime ADD TABLE public.daily_goals;

-- ============================================================================
-- BACKFILL: create wallet rows for existing users
-- ============================================================================
INSERT INTO public.user_wallet (user_id)
SELECT id FROM public.profiles
ON CONFLICT (user_id) DO NOTHING;

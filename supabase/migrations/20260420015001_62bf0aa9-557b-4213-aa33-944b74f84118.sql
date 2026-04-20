-- Local trigger function for updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at_timestamp()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- ============ MISSIONS ============
CREATE TABLE public.missions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text NOT NULL,
  period text NOT NULL CHECK (period IN ('daily', 'weekly')),
  difficulty text NOT NULL DEFAULT 'easy' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  event_type text NOT NULL,
  target integer NOT NULL DEFAULT 1,
  xp_reward integer NOT NULL DEFAULT 10,
  coin_reward integer NOT NULL DEFAULT 5,
  icon text DEFAULT 'Target',
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone signed in can view active missions" ON public.missions FOR SELECT TO authenticated USING (is_active = true OR is_admin());
CREATE POLICY "Admins manage missions" ON public.missions FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- ============ USER MISSIONS ============
CREATE TABLE public.user_missions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  mission_id uuid NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
  period_start date NOT NULL,
  progress integer NOT NULL DEFAULT 0,
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  reward_claimed boolean NOT NULL DEFAULT false,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, mission_id, period_start)
);
CREATE INDEX idx_user_missions_user ON public.user_missions(user_id);
CREATE INDEX idx_user_missions_user_active ON public.user_missions(user_id, expires_at) WHERE completed = false;
ALTER TABLE public.user_missions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own missions" ON public.user_missions FOR SELECT USING (auth.uid() = user_id);
CREATE TRIGGER trg_user_missions_updated BEFORE UPDATE ON public.user_missions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

-- ============ FOLLOWS ============
CREATE TABLE public.follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL,
  following_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (follower_id, following_id),
  CHECK (follower_id <> following_id)
);
CREATE INDEX idx_follows_follower ON public.follows(follower_id);
CREATE INDEX idx_follows_following ON public.follows(following_id);
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone authenticated can view follows" ON public.follows FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can follow others" ON public.follows FOR INSERT TO authenticated WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow" ON public.follows FOR DELETE TO authenticated USING (auth.uid() = follower_id);

-- ============ ACTIVITY FEED ============
CREATE TABLE public.activity_feed (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('level_up', 'badge_unlock', 'streak_milestone', 'mission_complete', 'post_created')),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_activity_feed_actor ON public.activity_feed(actor_id, created_at DESC);
CREATE INDEX idx_activity_feed_created ON public.activity_feed(created_at DESC);
ALTER TABLE public.activity_feed ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_mutual_friend(_user_a uuid, _user_b uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.friends WHERE status = 'accepted'
    AND ((user_id = _user_a AND friend_id = _user_b) OR (user_id = _user_b AND friend_id = _user_a)));
$$;

CREATE OR REPLACE FUNCTION public.is_following(_follower uuid, _following uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.follows WHERE follower_id = _follower AND following_id = _following);
$$;

CREATE POLICY "Users see own + friends + followed activity" ON public.activity_feed FOR SELECT TO authenticated
  USING (actor_id = auth.uid() OR public.is_mutual_friend(auth.uid(), actor_id) OR public.is_following(auth.uid(), actor_id));

-- ============ POWERUPS ============
CREATE TABLE public.powerups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL,
  category text NOT NULL CHECK (category IN ('xp_multiplier', 'streak_shield', 'coin_multiplier')),
  cost_coins integer NOT NULL DEFAULT 100,
  duration_minutes integer NOT NULL DEFAULT 60,
  multiplier numeric NOT NULL DEFAULT 2.0,
  icon text DEFAULT 'Zap',
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.powerups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone signed in can view active powerups" ON public.powerups FOR SELECT TO authenticated USING (is_active = true OR is_admin());
CREATE POLICY "Admins manage powerups" ON public.powerups FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

CREATE TABLE public.user_powerups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  powerup_id uuid NOT NULL REFERENCES public.powerups(id) ON DELETE CASCADE,
  category text NOT NULL,
  multiplier numeric NOT NULL,
  activated_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL
);
CREATE INDEX idx_user_powerups_active ON public.user_powerups(user_id, expires_at);
ALTER TABLE public.user_powerups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own powerups" ON public.user_powerups FOR SELECT USING (auth.uid() = user_id);

-- ============ NOTIFICATIONS dedupe ============
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS dedupe_key text;
CREATE UNIQUE INDEX IF NOT EXISTS idx_notifications_dedupe ON public.notifications(user_id, dedupe_key) WHERE dedupe_key IS NOT NULL;

-- ============ RPCs ============
CREATE OR REPLACE FUNCTION public.assign_daily_missions()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_user uuid := auth.uid(); v_today date := CURRENT_DATE; v_assigned int := 0; v_mission record;
BEGIN
  IF v_user IS NULL THEN RETURN jsonb_build_object('success', false, 'reason', 'not_authenticated'); END IF;
  IF EXISTS (SELECT 1 FROM public.user_missions um JOIN public.missions m ON m.id = um.mission_id
    WHERE um.user_id = v_user AND um.period_start = v_today AND m.period = 'daily') THEN
    RETURN jsonb_build_object('success', true, 'assigned', 0, 'reason', 'already_assigned');
  END IF;
  FOR v_mission IN SELECT id FROM public.missions WHERE period = 'daily' AND is_active = true ORDER BY random() LIMIT 3 LOOP
    INSERT INTO public.user_missions (user_id, mission_id, period_start, expires_at)
    VALUES (v_user, v_mission.id, v_today, (v_today + interval '1 day')::timestamptz)
    ON CONFLICT (user_id, mission_id, period_start) DO NOTHING;
    v_assigned := v_assigned + 1;
  END LOOP;
  RETURN jsonb_build_object('success', true, 'assigned', v_assigned);
END; $$;

CREATE OR REPLACE FUNCTION public.assign_weekly_missions()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_user uuid := auth.uid(); v_week_start date := date_trunc('week', CURRENT_DATE)::date; v_assigned int := 0; v_mission record;
BEGIN
  IF v_user IS NULL THEN RETURN jsonb_build_object('success', false, 'reason', 'not_authenticated'); END IF;
  IF EXISTS (SELECT 1 FROM public.user_missions um JOIN public.missions m ON m.id = um.mission_id
    WHERE um.user_id = v_user AND um.period_start = v_week_start AND m.period = 'weekly') THEN
    RETURN jsonb_build_object('success', true, 'assigned', 0, 'reason', 'already_assigned');
  END IF;
  FOR v_mission IN SELECT id FROM public.missions WHERE period = 'weekly' AND is_active = true ORDER BY random() LIMIT 2 LOOP
    INSERT INTO public.user_missions (user_id, mission_id, period_start, expires_at)
    VALUES (v_user, v_mission.id, v_week_start, (v_week_start + interval '7 days')::timestamptz)
    ON CONFLICT (user_id, mission_id, period_start) DO NOTHING;
    v_assigned := v_assigned + 1;
  END LOOP;
  RETURN jsonb_build_object('success', true, 'assigned', v_assigned);
END; $$;

CREATE OR REPLACE FUNCTION public.get_active_xp_multiplier(_user_id uuid)
RETURNS numeric LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(MAX(multiplier), 1.0) FROM public.user_powerups
  WHERE user_id = _user_id AND category = 'xp_multiplier' AND expires_at > now();
$$;

CREATE OR REPLACE FUNCTION public.update_mission_progress(_user_id uuid, _event_type text, _value integer DEFAULT 1)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_um record; v_mult numeric; v_xp int;
BEGIN
  v_mult := public.get_active_xp_multiplier(_user_id);
  FOR v_um IN
    SELECT um.id, um.progress, m.target, m.xp_reward, m.coin_reward, m.title, m.id AS mission_id
    FROM public.user_missions um JOIN public.missions m ON m.id = um.mission_id
    WHERE um.user_id = _user_id AND m.event_type = _event_type AND um.expires_at > now() AND um.completed = false
    FOR UPDATE
  LOOP
    UPDATE public.user_missions
      SET progress = LEAST(v_um.progress + _value, v_um.target),
          completed = (v_um.progress + _value) >= v_um.target,
          completed_at = CASE WHEN (v_um.progress + _value) >= v_um.target THEN now() ELSE NULL END
    WHERE id = v_um.id;
    IF (v_um.progress + _value) >= v_um.target THEN
      v_xp := ROUND(v_um.xp_reward * v_mult)::int;
      INSERT INTO public.user_wallet (user_id, coins, total_coins_earned)
        VALUES (_user_id, v_um.coin_reward, v_um.coin_reward)
        ON CONFLICT (user_id) DO UPDATE SET coins = user_wallet.coins + v_um.coin_reward,
          total_coins_earned = user_wallet.total_coins_earned + v_um.coin_reward, updated_at = now();
      INSERT INTO public.coin_transactions (user_id, amount, reason, source_type, source_id, idempotency_key)
        VALUES (_user_id, v_um.coin_reward, 'mission_complete', 'mission', v_um.mission_id, 'mission:' || v_um.id::text)
        ON CONFLICT DO NOTHING;
      INSERT INTO public.user_xp_totals (user_id, total_xp, weekly_xp)
        VALUES (_user_id, v_xp, v_xp)
        ON CONFLICT (user_id) DO UPDATE SET total_xp = user_xp_totals.total_xp + v_xp,
          weekly_xp = user_xp_totals.weekly_xp + v_xp, last_updated_at = now();
      INSERT INTO public.activity_feed (actor_id, event_type, metadata)
        VALUES (_user_id, 'mission_complete',
          jsonb_build_object('mission_id', v_um.mission_id, 'title', v_um.title, 'xp', v_xp, 'coins', v_um.coin_reward));
      INSERT INTO public.notifications (user_id, type, content, dedupe_key)
        VALUES (_user_id, 'mission_complete', 'Mission complete: ' || v_um.title || ' (+' || v_xp || ' XP)',
          'mission_complete:' || v_um.id::text)
        ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;
END; $$;

CREATE OR REPLACE FUNCTION public.claim_mission_reward(_user_mission_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_um record;
BEGIN
  SELECT * INTO v_um FROM public.user_missions WHERE id = _user_mission_id AND user_id = auth.uid();
  IF NOT FOUND THEN RETURN jsonb_build_object('success', false, 'reason', 'not_found'); END IF;
  IF NOT v_um.completed THEN RETURN jsonb_build_object('success', false, 'reason', 'not_completed'); END IF;
  IF v_um.reward_claimed THEN RETURN jsonb_build_object('success', false, 'reason', 'already_claimed'); END IF;
  UPDATE public.user_missions SET reward_claimed = true WHERE id = _user_mission_id;
  RETURN jsonb_build_object('success', true);
END; $$;

CREATE OR REPLACE FUNCTION public.follow_user(_target uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_user uuid := auth.uid();
BEGIN
  IF v_user IS NULL THEN RETURN jsonb_build_object('success', false, 'reason', 'not_authenticated'); END IF;
  IF v_user = _target THEN RETURN jsonb_build_object('success', false, 'reason', 'cannot_follow_self'); END IF;
  INSERT INTO public.follows (follower_id, following_id) VALUES (v_user, _target) ON CONFLICT DO NOTHING;
  INSERT INTO public.notifications (user_id, type, content, dedupe_key)
    VALUES (_target, 'new_follower', 'You have a new follower', 'follower:' || v_user::text)
    ON CONFLICT DO NOTHING;
  RETURN jsonb_build_object('success', true);
END; $$;

CREATE OR REPLACE FUNCTION public.unfollow_user(_target uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  DELETE FROM public.follows WHERE follower_id = auth.uid() AND following_id = _target;
  RETURN jsonb_build_object('success', true);
END; $$;

CREATE OR REPLACE FUNCTION public.get_activity_feed(_limit int DEFAULT 50)
RETURNS TABLE (id uuid, actor_id uuid, event_type text, metadata jsonb, created_at timestamptz, actor_username text, actor_avatar_url text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT af.id, af.actor_id, af.event_type, af.metadata, af.created_at, p.username, p.avatar_url
  FROM public.activity_feed af
  LEFT JOIN public.profiles p ON p.id = af.actor_id
  WHERE af.actor_id = auth.uid()
     OR af.actor_id IN (SELECT CASE WHEN f.user_id = auth.uid() THEN f.friend_id ELSE f.user_id END
        FROM public.friends f WHERE f.status = 'accepted' AND (f.user_id = auth.uid() OR f.friend_id = auth.uid()))
     OR af.actor_id IN (SELECT following_id FROM public.follows WHERE follower_id = auth.uid())
  ORDER BY af.created_at DESC LIMIT _limit;
$$;

CREATE OR REPLACE FUNCTION public.activate_powerup(_slug text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_user uuid := auth.uid(); v_pu record; v_balance int;
BEGIN
  IF v_user IS NULL THEN RETURN jsonb_build_object('success', false, 'reason', 'not_authenticated'); END IF;
  SELECT * INTO v_pu FROM public.powerups WHERE slug = _slug AND is_active = true;
  IF NOT FOUND THEN RETURN jsonb_build_object('success', false, 'reason', 'not_found'); END IF;
  SELECT coins INTO v_balance FROM public.user_wallet WHERE user_id = v_user;
  IF COALESCE(v_balance, 0) < v_pu.cost_coins THEN RETURN jsonb_build_object('success', false, 'reason', 'insufficient_coins'); END IF;
  UPDATE public.user_wallet SET coins = coins - v_pu.cost_coins, updated_at = now() WHERE user_id = v_user;
  INSERT INTO public.coin_transactions (user_id, amount, reason, source_type, source_id, idempotency_key)
    VALUES (v_user, -v_pu.cost_coins, 'powerup_purchase', 'powerup', v_pu.id,
      'powerup:' || v_pu.id::text || ':' || extract(epoch from now())::text);
  DELETE FROM public.user_powerups WHERE user_id = v_user AND category = v_pu.category;
  INSERT INTO public.user_powerups (user_id, powerup_id, category, multiplier, expires_at)
    VALUES (v_user, v_pu.id, v_pu.category, v_pu.multiplier, now() + (v_pu.duration_minutes || ' minutes')::interval);
  RETURN jsonb_build_object('success', true, 'expires_at', now() + (v_pu.duration_minutes || ' minutes')::interval);
END; $$;

-- ============ SEEDS ============
INSERT INTO public.missions (slug, title, description, period, difficulty, event_type, target, xp_reward, coin_reward, icon, sort_order) VALUES
  ('daily_study_15', 'Study for 15 minutes', 'Complete a 15-minute focused study session today', 'daily', 'easy', 'study_minutes', 15, 20, 10, 'BookOpen', 1),
  ('daily_answer_2', 'Answer 2 questions', 'Help peers by answering 2 questions on the feed', 'daily', 'easy', 'comment_created', 2, 25, 15, 'MessageCircle', 2),
  ('daily_quiz_1', 'Complete 1 quiz', 'Take and finish one quiz today', 'daily', 'easy', 'quiz_completed', 1, 30, 15, 'Brain', 3),
  ('daily_flashcards_10', 'Review 10 flashcards', 'Review at least 10 flashcards today', 'daily', 'medium', 'flashcard_reviewed', 10, 30, 20, 'Layers', 4),
  ('daily_post_1', 'Share something', 'Create a post or doubt to share with the community', 'daily', 'easy', 'post_created', 1, 20, 10, 'PenLine', 5),
  ('weekly_study_300', 'Study 5 hours this week', 'Total 300 minutes of focused study time', 'weekly', 'medium', 'study_minutes', 300, 150, 75, 'Target', 1),
  ('weekly_streak_7', 'Maintain 7-day streak', 'Log in and study every day for 7 days', 'weekly', 'hard', 'streak_day', 7, 200, 100, 'Flame', 2),
  ('weekly_helpful_10', 'Be helpful 10 times', 'Receive 10 helpful votes on your answers', 'weekly', 'hard', 'helpful_received', 10, 250, 125, 'ThumbsUp', 3),
  ('weekly_quiz_5', 'Complete 5 quizzes', 'Finish 5 quizzes this week', 'weekly', 'medium', 'quiz_completed', 5, 175, 80, 'Brain', 4)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.powerups (slug, name, description, category, cost_coins, duration_minutes, multiplier, icon, sort_order) VALUES
  ('xp_boost_2x_30', '2x XP Boost (30 min)', 'Double all XP earned for the next 30 minutes', 'xp_multiplier', 50, 30, 2.0, 'Zap', 1),
  ('xp_boost_2x_60', '2x XP Boost (1 hour)', 'Double all XP earned for the next hour', 'xp_multiplier', 90, 60, 2.0, 'Zap', 2),
  ('xp_boost_3x_30', '3x XP Boost (30 min)', 'Triple all XP earned for the next 30 minutes', 'xp_multiplier', 150, 30, 3.0, 'Sparkles', 3),
  ('coin_boost_2x_60', '2x Coin Boost (1 hour)', 'Double all coins earned for the next hour', 'coin_multiplier', 75, 60, 2.0, 'Coins', 4)
ON CONFLICT (slug) DO NOTHING;
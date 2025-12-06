-- Create XP Events Ledger Table (append-only audit log)
CREATE TABLE public.xp_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  event_type text NOT NULL, -- 'answer_minimal', 'answer_quality', 'answer_excellent', 'daily_study', 'streak_bonus'
  xp_amount integer NOT NULL,
  source_type text, -- 'comment', 'study_session', 'streak'
  source_id uuid, -- reference to the triggering record
  idempotency_key text UNIQUE NOT NULL, -- prevents duplicates
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create User XP Totals Table (cached aggregates for fast leaderboard)
CREATE TABLE public.user_xp_totals (
  user_id uuid PRIMARY KEY,
  total_xp integer DEFAULT 0 NOT NULL,
  weekly_xp integer DEFAULT 0 NOT NULL,
  week_start date NOT NULL DEFAULT date_trunc('week', CURRENT_DATE)::date,
  last_updated_at timestamptz DEFAULT now() NOT NULL
);

-- Add quality tracking columns to comments
ALTER TABLE public.comments 
  ADD COLUMN IF NOT EXISTS quality_score integer DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS is_accepted boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS xp_awarded boolean DEFAULT false;

-- Add daily XP tracking columns to profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS daily_xp_date date DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS weekly_xp_last_reset date DEFAULT NULL;

-- Enable RLS on new tables
ALTER TABLE public.xp_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_xp_totals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for xp_events (users can view their own events)
CREATE POLICY "Users can view their own XP events"
ON public.xp_events FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all XP events"
ON public.xp_events FOR SELECT
USING (public.is_admin());

-- RLS Policies for user_xp_totals (public leaderboard)
CREATE POLICY "Anyone can view XP totals for leaderboard"
ON public.user_xp_totals FOR SELECT
USING (true);

-- XP Tier Constants Function
CREATE OR REPLACE FUNCTION public.get_xp_tier(p_event_type text)
RETURNS integer
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE p_event_type
    WHEN 'answer_minimal' THEN 5
    WHEN 'answer_quality' THEN 15
    WHEN 'answer_excellent' THEN 25
    WHEN 'daily_study' THEN 10
    WHEN 'streak_bonus' THEN 5
    ELSE 0
  END
$$;

-- Get daily XP cap remaining function
CREATE OR REPLACE FUNCTION public.get_daily_answer_xp_remaining(p_user_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT GREATEST(0, 100 - COALESCE(
    (SELECT SUM(xp_amount) 
     FROM public.xp_events 
     WHERE user_id = p_user_id 
       AND event_type IN ('answer_minimal', 'answer_quality', 'answer_excellent')
       AND created_at::date = CURRENT_DATE),
    0
  ))::integer
$$;

-- Award XP Function (main function with idempotency and caps)
CREATE OR REPLACE FUNCTION public.award_xp(
  p_user_id uuid,
  p_event_type text,
  p_source_type text DEFAULT NULL,
  p_source_id uuid DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_xp_amount integer;
  v_idempotency_key text;
  v_daily_remaining integer;
  v_week_start date;
  v_result jsonb;
BEGIN
  -- Get XP amount for this event type
  v_xp_amount := public.get_xp_tier(p_event_type);
  
  IF v_xp_amount = 0 THEN
    RETURN jsonb_build_object('success', false, 'reason', 'invalid_event_type', 'xp_awarded', 0);
  END IF;
  
  -- Generate idempotency key
  v_idempotency_key := p_event_type || ':' || COALESCE(p_source_id::text, 'none') || ':' || CURRENT_DATE::text;
  
  -- Check if already awarded
  IF EXISTS (SELECT 1 FROM public.xp_events WHERE idempotency_key = v_idempotency_key) THEN
    RETURN jsonb_build_object('success', false, 'reason', 'duplicate', 'xp_awarded', 0);
  END IF;
  
  -- Check daily cap for answer-related events
  IF p_event_type IN ('answer_minimal', 'answer_quality', 'answer_excellent') THEN
    v_daily_remaining := public.get_daily_answer_xp_remaining(p_user_id);
    IF v_daily_remaining <= 0 THEN
      RETURN jsonb_build_object('success', false, 'reason', 'daily_cap_exceeded', 'xp_awarded', 0);
    END IF;
    -- Clamp to remaining cap
    v_xp_amount := LEAST(v_xp_amount, v_daily_remaining);
  END IF;
  
  -- Check daily study cap (one per day)
  IF p_event_type = 'daily_study' THEN
    IF EXISTS (
      SELECT 1 FROM public.xp_events 
      WHERE user_id = p_user_id 
        AND event_type = 'daily_study' 
        AND created_at::date = CURRENT_DATE
    ) THEN
      RETURN jsonb_build_object('success', false, 'reason', 'daily_study_already_claimed', 'xp_awarded', 0);
    END IF;
  END IF;
  
  -- Insert XP event
  INSERT INTO public.xp_events (user_id, event_type, xp_amount, source_type, source_id, idempotency_key, metadata)
  VALUES (p_user_id, p_event_type, v_xp_amount, p_source_type, p_source_id, v_idempotency_key, p_metadata);
  
  -- Calculate week start
  v_week_start := date_trunc('week', CURRENT_DATE)::date;
  
  -- Upsert user_xp_totals
  INSERT INTO public.user_xp_totals (user_id, total_xp, weekly_xp, week_start, last_updated_at)
  VALUES (p_user_id, v_xp_amount, v_xp_amount, v_week_start, now())
  ON CONFLICT (user_id) DO UPDATE SET
    total_xp = user_xp_totals.total_xp + v_xp_amount,
    weekly_xp = CASE 
      WHEN user_xp_totals.week_start < v_week_start THEN v_xp_amount
      ELSE user_xp_totals.weekly_xp + v_xp_amount
    END,
    week_start = v_week_start,
    last_updated_at = now();
  
  -- Update profiles.points for backward compatibility
  UPDATE public.profiles 
  SET points = COALESCE(points, 0) + v_xp_amount
  WHERE id = p_user_id;
  
  RETURN jsonb_build_object('success', true, 'xp_awarded', v_xp_amount, 'event_type', p_event_type);
END;
$$;

-- Trigger function for comment creation (awards minimal XP)
CREATE OR REPLACE FUNCTION public.on_comment_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
BEGIN
  -- Award minimal XP for posting a comment
  v_result := public.award_xp(
    NEW.user_id,
    'answer_minimal',
    'comment',
    NEW.id,
    jsonb_build_object('post_id', NEW.post_id)
  );
  
  -- Mark as XP awarded if successful
  IF (v_result->>'success')::boolean THEN
    NEW.xp_awarded := true;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger function for comment quality upgrade
CREATE OR REPLACE FUNCTION public.on_comment_quality_updated()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
  v_event_type text;
BEGIN
  -- Only process if quality_score changed and is higher
  IF NEW.quality_score IS NOT NULL AND (OLD.quality_score IS NULL OR NEW.quality_score > OLD.quality_score) THEN
    -- Determine event type based on quality score
    IF NEW.quality_score >= 2 OR NEW.is_accepted = true THEN
      v_event_type := 'answer_excellent';
    ELSIF NEW.quality_score >= 1 THEN
      v_event_type := 'answer_quality';
    ELSE
      RETURN NEW;
    END IF;
    
    -- Award bonus XP (difference from minimal already awarded)
    v_result := public.award_xp(
      NEW.user_id,
      v_event_type,
      'comment',
      NEW.id,
      jsonb_build_object('post_id', NEW.post_id, 'quality_score', NEW.quality_score, 'is_accepted', NEW.is_accepted)
    );
  END IF;
  
  -- Handle accepted answer bonus
  IF NEW.is_accepted = true AND OLD.is_accepted = false THEN
    v_result := public.award_xp(
      NEW.user_id,
      'answer_excellent',
      'comment',
      NEW.id,
      jsonb_build_object('post_id', NEW.post_id, 'accepted', true)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger function for study session completion
CREATE OR REPLACE FUNCTION public.on_study_session_completed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
BEGIN
  -- Only award XP for completed sessions (>= 25 minutes for Pomodoro)
  IF NEW.ended_at IS NOT NULL AND NEW.duration_minutes >= 25 THEN
    v_result := public.award_xp(
      NEW.user_id,
      'daily_study',
      'study_session',
      NEW.id,
      jsonb_build_object('duration_minutes', NEW.duration_minutes, 'session_type', NEW.session_type)
    );
    
    -- Update daily XP date in profiles
    IF (v_result->>'success')::boolean THEN
      UPDATE public.profiles 
      SET daily_xp_date = CURRENT_DATE
      WHERE id = NEW.user_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create triggers
CREATE TRIGGER on_comment_created_award_xp
  BEFORE INSERT ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.on_comment_created();

CREATE TRIGGER on_comment_quality_updated_award_xp
  AFTER UPDATE OF quality_score, is_accepted ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.on_comment_quality_updated();

CREATE TRIGGER on_study_session_completed_award_xp
  AFTER UPDATE OF ended_at ON public.study_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.on_study_session_completed();

-- Function to recalculate weekly XP (for weekly reset)
CREATE OR REPLACE FUNCTION public.reset_weekly_xp()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_week_start date;
BEGIN
  v_week_start := date_trunc('week', CURRENT_DATE)::date;
  
  UPDATE public.user_xp_totals
  SET 
    weekly_xp = COALESCE((
      SELECT SUM(xp_amount) 
      FROM public.xp_events 
      WHERE xp_events.user_id = user_xp_totals.user_id 
        AND created_at >= v_week_start
    ), 0),
    week_start = v_week_start,
    last_updated_at = now()
  WHERE week_start < v_week_start;
END;
$$;

-- Create indexes for performance
CREATE INDEX idx_xp_events_user_id ON public.xp_events(user_id);
CREATE INDEX idx_xp_events_created_at ON public.xp_events(created_at);
CREATE INDEX idx_xp_events_event_type ON public.xp_events(event_type);
CREATE INDEX idx_user_xp_totals_total_xp ON public.user_xp_totals(total_xp DESC);
CREATE INDEX idx_user_xp_totals_weekly_xp ON public.user_xp_totals(weekly_xp DESC);
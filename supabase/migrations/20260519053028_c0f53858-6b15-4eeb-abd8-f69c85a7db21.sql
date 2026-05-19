
-- 1) AI usage ledger (free-tier daily caps)
CREATE TABLE IF NOT EXISTS public.ai_usage_daily (
  user_id uuid NOT NULL,
  bucket text NOT NULL,
  local_date date NOT NULL,
  count integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, bucket, local_date)
);

ALTER TABLE public.ai_usage_daily ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own ai usage" ON public.ai_usage_daily;
CREATE POLICY "Users view own ai usage"
ON public.ai_usage_daily
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- No INSERT/UPDATE/DELETE policies → only service role (and SECURITY DEFINER fns) can mutate.

CREATE INDEX IF NOT EXISTS idx_ai_usage_daily_date
  ON public.ai_usage_daily (local_date);

-- 2) Atomic quota consumption RPC
CREATE OR REPLACE FUNCTION public.consume_ai_quota(
  _user_id uuid,
  _bucket text,
  _free_limit integer
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_pro boolean;
  v_today date;
  v_new_count integer;
BEGIN
  IF _user_id IS NULL OR _bucket IS NULL OR _free_limit IS NULL THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'invalid_args');
  END IF;

  v_is_pro := public.is_pro_user(_user_id);
  v_today := (now() AT TIME ZONE 'UTC')::date;

  IF v_is_pro THEN
    RETURN jsonb_build_object(
      'allowed', true,
      'is_pro', true,
      'limit', null,
      'used', null
    );
  END IF;

  -- Free user: atomically increment
  INSERT INTO public.ai_usage_daily (user_id, bucket, local_date, count, updated_at)
  VALUES (_user_id, _bucket, v_today, 1, now())
  ON CONFLICT (user_id, bucket, local_date) DO UPDATE
    SET count = public.ai_usage_daily.count + 1,
        updated_at = now()
  RETURNING count INTO v_new_count;

  IF v_new_count > _free_limit THEN
    -- Roll back the increment so future queries reflect the true cap
    UPDATE public.ai_usage_daily
    SET count = _free_limit, updated_at = now()
    WHERE user_id = _user_id AND bucket = _bucket AND local_date = v_today;

    RETURN jsonb_build_object(
      'allowed', false,
      'is_pro', false,
      'reason', 'daily_limit_reached',
      'limit', _free_limit,
      'used', _free_limit
    );
  END IF;

  RETURN jsonb_build_object(
    'allowed', true,
    'is_pro', false,
    'limit', _free_limit,
    'used', v_new_count,
    'remaining', _free_limit - v_new_count
  );
END;
$$;

REVOKE ALL ON FUNCTION public.consume_ai_quota(uuid, text, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.consume_ai_quota(uuid, text, integer) TO service_role;

-- 3) Whiteboard creation gated to Pro
CREATE OR REPLACE FUNCTION public.create_whiteboard(p_name text DEFAULT NULL::text, p_group_id uuid DEFAULT NULL::uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid;
  v_whiteboard_id uuid;
  v_name text;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF NOT public.is_pro_user(v_user_id) THEN
    RAISE EXCEPTION 'pro_required' USING HINT = 'Collaborative whiteboards require StudyHub Pro.';
  END IF;

  IF p_group_id IS NOT NULL THEN
    IF NOT public.is_group_member(p_group_id, v_user_id) THEN
      RAISE EXCEPTION 'You must be a member of the group to create a whiteboard';
    END IF;
  END IF;

  v_name := COALESCE(NULLIF(BTRIM(p_name), ''), 'Untitled Whiteboard');

  INSERT INTO public.whiteboards (created_by, name, group_id)
  VALUES (v_user_id, v_name, p_group_id)
  RETURNING id INTO v_whiteboard_id;

  RETURN v_whiteboard_id;
END;
$function$;

-- Tighten direct INSERT path on whiteboards table (in addition to the RPC)
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'whiteboards' AND cmd = 'INSERT'
  LOOP
    EXECUTE format('DROP POLICY %I ON public.whiteboards', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "Pro users can create whiteboards"
ON public.whiteboards
FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid() AND public.is_pro_user(auth.uid()));

-- 4) Pro-status view for badge rendering (no plan/period leakage)
CREATE OR REPLACE VIEW public.user_pro_status AS
SELECT
  p.id AS user_id,
  public.is_pro_user(p.id) AS is_pro
FROM public.profiles p;

GRANT SELECT ON public.user_pro_status TO authenticated, anon;

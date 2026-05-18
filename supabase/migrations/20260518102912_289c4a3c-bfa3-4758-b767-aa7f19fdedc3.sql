
-- ============================================================
-- AUDIT LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  actor_email text,
  action text NOT NULL,
  target_type text,
  target_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs(actor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target ON public.audit_logs(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can read audit logs; nobody can write directly (server-side only)
CREATE POLICY "Admins can view audit logs"
ON public.audit_logs FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- No INSERT/UPDATE/DELETE policies → only SECURITY DEFINER functions or service-role can write
-- This prevents log tampering even by admins via client.

-- Helper to log events
CREATE OR REPLACE FUNCTION public.log_audit_event(
  _action text,
  _target_type text DEFAULT NULL,
  _target_id uuid DEFAULT NULL,
  _metadata jsonb DEFAULT '{}'::jsonb,
  _actor_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor uuid;
  v_email text;
  v_id uuid;
BEGIN
  v_actor := COALESCE(_actor_id, auth.uid());
  IF v_actor IS NOT NULL THEN
    SELECT email INTO v_email FROM auth.users WHERE id = v_actor;
  END IF;
  INSERT INTO public.audit_logs (actor_id, actor_email, action, target_type, target_id, metadata)
  VALUES (v_actor, v_email, _action, _target_type, _target_id, COALESCE(_metadata, '{}'::jsonb))
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.log_audit_event(text, text, uuid, jsonb, uuid) FROM PUBLIC, anon, authenticated;

-- Trigger: log role grants/revocations
CREATE OR REPLACE FUNCTION public.trg_audit_user_roles()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_audit_event(
      'role_granted', 'user_role', NEW.user_id,
      jsonb_build_object('role', NEW.role)
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.log_audit_event(
      'role_revoked', 'user_role', OLD.user_id,
      jsonb_build_object('role', OLD.role)
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS audit_user_roles ON public.user_roles;
CREATE TRIGGER audit_user_roles
AFTER INSERT OR DELETE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.trg_audit_user_roles();

-- Trigger: log ban appeal decisions
CREATE OR REPLACE FUNCTION public.trg_audit_ban_appeals()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    PERFORM public.log_audit_event(
      'ban_appeal_' || NEW.status, 'ban_appeal', NEW.id,
      jsonb_build_object('user_id', NEW.user_id, 'reviewer', NEW.reviewed_by, 'response', NEW.admin_response),
      NEW.reviewed_by
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS audit_ban_appeals ON public.ban_appeals;
CREATE TRIGGER audit_ban_appeals
AFTER UPDATE ON public.ban_appeals
FOR EACH ROW EXECUTE FUNCTION public.trg_audit_ban_appeals();

-- ============================================================
-- RATE LIMITS (ad-hoc DB-backed sliding-window counter)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.rate_limits (
  user_id uuid NOT NULL,
  bucket_key text NOT NULL,
  window_start timestamptz NOT NULL DEFAULT now(),
  count integer NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, bucket_key)
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON public.rate_limits(window_start);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
-- No policies → only service-role / SECURITY DEFINER functions can access

CREATE OR REPLACE FUNCTION public.check_rate_limit(
  _user_id uuid,
  _bucket_key text,
  _max_count integer,
  _window_seconds integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row record;
  v_new_count integer;
  v_window_start timestamptz;
BEGIN
  IF _user_id IS NULL THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'no_user');
  END IF;

  -- Upsert with conditional window reset
  INSERT INTO public.rate_limits (user_id, bucket_key, window_start, count)
  VALUES (_user_id, _bucket_key, now(), 1)
  ON CONFLICT (user_id, bucket_key) DO UPDATE
  SET
    window_start = CASE
      WHEN public.rate_limits.window_start < now() - make_interval(secs => _window_seconds)
        THEN now()
      ELSE public.rate_limits.window_start
    END,
    count = CASE
      WHEN public.rate_limits.window_start < now() - make_interval(secs => _window_seconds)
        THEN 1
      ELSE public.rate_limits.count + 1
    END
  RETURNING count, window_start INTO v_new_count, v_window_start;

  IF v_new_count > _max_count THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'rate_limited',
      'count', v_new_count,
      'limit', _max_count,
      'retry_after_seconds', GREATEST(0, _window_seconds - EXTRACT(EPOCH FROM (now() - v_window_start))::integer)
    );
  END IF;

  RETURN jsonb_build_object(
    'allowed', true,
    'count', v_new_count,
    'limit', _max_count,
    'remaining', _max_count - v_new_count
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.check_rate_limit(uuid, text, integer, integer) FROM PUBLIC, anon, authenticated;

-- Periodic cleanup (optional, can be called by a cron)
CREATE OR REPLACE FUNCTION public.cleanup_rate_limits()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_count integer;
BEGIN
  WITH deleted AS (
    DELETE FROM public.rate_limits
    WHERE window_start < now() - interval '1 day'
    RETURNING 1
  )
  SELECT COUNT(*) INTO v_count FROM deleted;
  RETURN v_count;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.cleanup_rate_limits() FROM PUBLIC, anon, authenticated;

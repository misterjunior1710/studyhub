
-- 1. push_subscriptions: restrict admin SELECT to super admin only
DROP POLICY IF EXISTS "Admins view all push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Super admin views all push subscriptions"
  ON public.push_subscriptions FOR SELECT
  USING (public.is_super_admin());

-- 2. support_requests: restrict admin access to super admin only
DROP POLICY IF EXISTS "Admins can view all support requests" ON public.support_requests;
DROP POLICY IF EXISTS "Authenticated admins can update support requests" ON public.support_requests;
DROP POLICY IF EXISTS "Authenticated admins can delete support requests" ON public.support_requests;

CREATE POLICY "Super admin can view all support requests"
  ON public.support_requests FOR SELECT
  USING (public.is_super_admin());

CREATE POLICY "Super admin can update support requests"
  ON public.support_requests FOR UPDATE
  USING (public.is_super_admin());

CREATE POLICY "Super admin can delete support requests"
  ON public.support_requests FOR DELETE
  USING (public.is_super_admin());

-- 3. daily_goals: add owner write policies (triggers run as SECURITY DEFINER but explicit policies document intent)
CREATE POLICY "Users insert own goals"
  ON public.daily_goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own goals"
  ON public.daily_goals FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own goals"
  ON public.daily_goals FOR DELETE
  USING (auth.uid() = user_id);

-- 4. rate_limits: explicit deny-all to clients (managed only by SECURITY DEFINER functions / service role)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='rate_limits') THEN
    EXECUTE 'ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY';
  END IF;
END $$;
DROP POLICY IF EXISTS "No direct client access to rate_limits" ON public.rate_limits;
CREATE POLICY "No direct client access to rate_limits"
  ON public.rate_limits FOR ALL
  USING (false)
  WITH CHECK (false);

-- 5. Revoke EXECUTE from anon on sensitive SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_pro_user(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_active_subscription(uuid, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_my_subscription() FROM anon;
REVOKE EXECUTE ON FUNCTION public.consume_ai_quota(uuid, text, integer) FROM anon;
REVOKE EXECUTE ON FUNCTION public.trg_audit_ban_appeals() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.trg_audit_user_roles() FROM anon, authenticated, public;

-- 6. Realtime: add subscription:{userId} channel authorization
DROP POLICY IF EXISTS "realtime: authorize channel subscriptions" ON realtime.messages;
CREATE POLICY "realtime: authorize channel subscriptions"
  ON realtime.messages FOR SELECT
  TO authenticated
  USING (
    CASE
      WHEN realtime.topic() ~~ 'conversation:%' THEN public.is_conversation_participant((NULLIF(split_part(realtime.topic(), ':', 2), ''))::uuid, auth.uid())
      WHEN realtime.topic() ~~ 'group:%' THEN public.is_group_member((NULLIF(split_part(realtime.topic(), ':', 2), ''))::uuid, auth.uid())
      WHEN realtime.topic() ~~ 'wallet:%' THEN (NULLIF(split_part(realtime.topic(), ':', 2), ''))::uuid = auth.uid()
      WHEN realtime.topic() ~~ 'whiteboard:%' THEN public.can_view_whiteboard((NULLIF(split_part(realtime.topic(), ':', 2), ''))::uuid, auth.uid())
      WHEN realtime.topic() ~~ 'doc:%' THEN EXISTS (
        SELECT 1 FROM public.collaborative_docs d
        WHERE d.id = (NULLIF(split_part(realtime.topic(), ':', 2), ''))::uuid
          AND public.is_group_member(d.group_id, auth.uid())
      )
      WHEN realtime.topic() ~~ 'goals:%' THEN (NULLIF(split_part(realtime.topic(), ':', 2), ''))::uuid = auth.uid()
      WHEN realtime.topic() ~~ 'subscription:%' THEN (NULLIF(split_part(realtime.topic(), ':', 2), ''))::uuid = auth.uid()
      ELSE false
    END
  );

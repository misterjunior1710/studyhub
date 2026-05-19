
-- 1. Extend subscriptions table for Dodo
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS provider text NOT NULL DEFAULT 'dodo',
  ADD COLUMN IF NOT EXISTS plan text,
  ADD COLUMN IF NOT EXISTS dodo_subscription_id text,
  ADD COLUMN IF NOT EXISTS dodo_payment_id text,
  ADD COLUMN IF NOT EXISTS dodo_customer_id text;

-- Make legacy Stripe columns nullable so Dodo rows can be inserted without them
ALTER TABLE public.subscriptions ALTER COLUMN stripe_subscription_id DROP NOT NULL;
ALTER TABLE public.subscriptions ALTER COLUMN stripe_customer_id DROP NOT NULL;
ALTER TABLE public.subscriptions ALTER COLUMN product_id DROP NOT NULL;
ALTER TABLE public.subscriptions ALTER COLUMN price_id DROP NOT NULL;

-- Drop the legacy unique stripe constraint that would block null Stripe IDs colliding
ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_stripe_subscription_id_key;

-- Unique index for Dodo (prevents duplicates, allows nulls for legacy rows)
CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_dodo_sub_unique
  ON public.subscriptions (provider, dodo_subscription_id)
  WHERE dodo_subscription_id IS NOT NULL;

-- Recreate stripe unique constraint as partial so it ignores Dodo rows
CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_stripe_sub_unique
  ON public.subscriptions (stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status
  ON public.subscriptions (user_id, status);

-- 2. Webhook idempotency log
CREATE TABLE IF NOT EXISTS public.dodo_webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id text NOT NULL UNIQUE,
  event_type text NOT NULL,
  payload jsonb NOT NULL,
  processed_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.dodo_webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages webhook events"
  ON public.dodo_webhook_events
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- 3. Checkout intent audit
CREATE TABLE IF NOT EXISTS public.subscription_intents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider text NOT NULL DEFAULT 'dodo',
  plan text NOT NULL,
  checkout_url text,
  status text NOT NULL DEFAULT 'initiated',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.subscription_intents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own intents"
  ON public.subscription_intents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role manages intents"
  ON public.subscription_intents FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- 4. Helper RPCs
CREATE OR REPLACE FUNCTION public.is_pro_user(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.subscriptions
    WHERE user_id = _user_id
      AND plan IN ('pro_monthly', 'pro_yearly')
      AND (
        (status IN ('active', 'trialing', 'renewed') AND (current_period_end IS NULL OR current_period_end > now()))
        OR (status = 'cancelled' AND current_period_end > now())
        OR (status = 'on_hold' AND current_period_end > now())
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.get_my_subscription()
RETURNS TABLE (
  id uuid,
  plan text,
  status text,
  provider text,
  current_period_end timestamptz,
  cancel_at_period_end boolean,
  is_pro boolean
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    s.id,
    s.plan,
    s.status,
    s.provider,
    s.current_period_end,
    s.cancel_at_period_end,
    (s.plan IN ('pro_monthly','pro_yearly')
      AND (
        (s.status IN ('active','trialing','renewed') AND (s.current_period_end IS NULL OR s.current_period_end > now()))
        OR (s.status IN ('cancelled','on_hold') AND s.current_period_end > now())
      )
    ) AS is_pro
  FROM public.subscriptions s
  WHERE s.user_id = auth.uid()
  ORDER BY s.updated_at DESC NULLS LAST, s.created_at DESC
  LIMIT 1;
$$;

-- 5. Enable realtime
ALTER TABLE public.subscriptions REPLICA IDENTITY FULL;
DO $$
BEGIN
  BEGIN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.subscriptions';
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END$$;

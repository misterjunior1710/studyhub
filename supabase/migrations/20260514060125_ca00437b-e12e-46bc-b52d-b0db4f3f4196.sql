
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  stripe_subscription_id text not null unique,
  stripe_customer_id text not null,
  product_id text not null,
  price_id text not null,
  status text not null default 'active',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  environment text not null default 'sandbox',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_subscriptions_user_id on public.subscriptions(user_id);
create index idx_subscriptions_stripe_id on public.subscriptions(stripe_subscription_id);

alter table public.subscriptions enable row level security;

create policy "Users can view own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

create policy "Service role can manage subscriptions"
  on public.subscriptions for all
  using (auth.role() = 'service_role');

create or replace function public.has_active_subscription(
  user_uuid uuid,
  check_env text default 'sandbox'
)
returns boolean language sql security definer
set search_path = public
as $$
  select exists (
    select 1 from public.subscriptions
    where user_id = user_uuid
    and environment = check_env
    and (
      (status in ('active', 'trialing') and (current_period_end is null or current_period_end > now()))
      or (status = 'canceled' and current_period_end > now())
    )
  );
$$;

-- Internal promo code redemptions (sandbox/test only)
create table public.promo_redemptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  code text not null,
  environment text not null default 'sandbox',
  redeemed_at timestamptz not null default now(),
  unique (user_id, code, environment)
);

alter table public.promo_redemptions enable row level security;

create policy "Users can view own redemptions"
  on public.promo_redemptions for select
  using (auth.uid() = user_id);

create policy "Service role manages redemptions"
  on public.promo_redemptions for all
  using (auth.role() = 'service_role');

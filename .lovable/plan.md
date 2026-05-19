## Goal

Integrate Dodo Payments into `/pricing` and the subscription flow. Webhooks are the source of truth; the UI reflects DB state in realtime.

## Payment Links

- Free → in-app (no Dodo)
- Pro Monthly → `https://dodo.pe/monthproplan`
- Pro Yearly → `https://dodo.pe/yearproplan`
- `https://dodo.pe/freeshplan` is intentionally not wired to checkout (Free CTA stays in-app per spec).

## Architecture (high level)

```text
Pricing CTA ──► edge: dodo-create-checkout ──► returns Dodo URL w/ metadata{user_id, plan}
                                                │
User completes payment on Dodo ─────────────────┘
                │
                ├─► redirect_url → /success/pro  or  /success/pro/yearly
                │       (polls subscription row until webhook lands)
                │
                └─► Dodo webhook ──► edge: dodo-webhook (verify signature, upsert)
                                          │
                                          ▼
                                  public.subscriptions  (realtime)
                                          │
                                          ▼
                              useSubscription() hook in app
```

The frontend never trusts the redirect alone. The success page subscribes to the `subscriptions` table over realtime and shows "Verifying…" until the webhook confirms `active`.

## Backend changes

### Schema migration

Extend `public.subscriptions` to be provider-agnostic and Dodo-ready:

- add `provider text default 'dodo'`
- add `dodo_subscription_id text`, `dodo_payment_id text`, `dodo_customer_id text`
- add `plan text` (`pro_monthly` | `pro_yearly`)
- make legacy `stripe_*` columns nullable (keep for backwards-compat)
- unique index on `(provider, dodo_subscription_id)`
- enable realtime on `public.subscriptions`
- helper RPC `get_my_subscription()` returning active plan + status

RLS already correct (user reads own; service role writes).

### Edge functions (new)

1. `**dodo-create-checkout**` (JWT-verified)
  - Input: `{ plan: 'pro_monthly' | 'pro_yearly' }`
  - Builds redirect URL: `https://dodo.pe/{slug}?metadata_user_id={uid}&metadata_plan={plan}&redirect_url={origin}/success/pro[/yearly]`
  - Returns `{ url }`. Inserts a pending `subscription_intent` audit row.
2. `**dodo-webhook**` (public, no JWT)
  - Verifies `webhook-signature` header using `DODO_WEBHOOK_SECRET` (HMAC).
  - Handles: `payment.succeeded`, `payment.failed`, `subscription.active`, `subscription.cancelled`, `subscription.on_hold`, `subscription.renewed`.
  - Upserts `public.subscriptions` keyed by `dodo_subscription_id`; sets `status`, `current_period_end`, `plan`, `user_id` (from metadata).
  - Idempotent via `event_id` log table.
3. `**dodo-subscription-status**` (JWT-verified, optional)
  - Server-side fetch fallback when webhook is delayed (polled by success page after 10s).

### Secrets to add

- `DODO_API_KEY` (server-side fetch + sub mgmt)
- `DODO_WEBHOOK_SECRET` (signature verify)

User must register the webhook URL `https://qrquegcexsqrbtwtcicq.supabase.co/functions/v1/dodo-webhook` in the Dodo dashboard.

## Frontend changes

### New: `src/hooks/useSubscription.ts`

- Reads `public.subscriptions` for `auth.uid()`, subscribes to realtime changes.
- Exposes `{ isPro, plan, status, periodEnd, loading, refetch }`.
- Invalidates on `AuthContext` user change. 5-min staleTime fits existing caching standards.

### `src/pages/Pricing.tsx`

- Replace `handleSelectPlan` placeholder with:
  - **Free**: logged-out → `/auth`; logged-in → `/feed`.
  - **Pro M/Y**: logged-out → `/auth?next=/pricing`; logged-in → call `dodo-create-checkout`, then `window.location.href = url` (Dodo links are hosted-only).
- Per-card loading spinner, disabled state during request, toast on error with retry.
- If `useSubscription().isPro` and the cycle matches, swap CTA to "Manage subscription" → `/settings#billing`.
- Keep all existing layout, animations, and responsive behavior. USD prices already in place.
- Add Apple Pay / Google Pay badge row under Pro cards (lucide + small SVG), shown only when `import.meta.env.VITE_DODO_WALLET_BADGES === 'true'` so we can flip it on later without redeploying logic.

### `src/pages/SuccessPro.tsx` and `src/pages/SuccessProYearly.tsx`

- On mount: read `?payment_id=` from query (Dodo appends it).
- Show three states:
  1. **Verifying** (default): polite spinner + "Confirming your payment securely…" — relies on realtime + 2s polling fallback for max 60s.
  2. **Confirmed**: existing celebratory layout; trigger `refetchProfile()` + `queryClient.invalidateQueries`.
  3. **Pending / failed**: friendly message + "Retry payment" → back to Dodo link, "Contact support" → `/support`.
- No manual page refresh needed — realtime drives the transition.

### Cancellation / retry UX

- `/settings` billing section: shows current plan, period end, "Manage on Dodo" button (links to Dodo customer portal URL once user provides it; placeholder hidden until env set).
- Graceful cancellation page at `/pricing?canceled=1` shows a toast "Checkout canceled — no charge made."

### Pro feature gating

- Add `src/lib/pro.ts` exporting `useIsPro()` (thin wrapper over `useSubscription`).
- No feature unlock logic is changed in this pass beyond making `isPro` available; existing Pro-gated UI can adopt it next.

### Guards

- `ProfileOnboardingGuard` already exempts `/success`, `/pricing`, `/refund` — no change.

## Security & production posture

- Frontend never sees `DODO_API_KEY` or webhook secret.
- Webhook signature verified with constant-time compare; bad signatures return 401 and are logged.
- All edge functions: zod validation, CORS, rate-limit via existing `check_rate_limit` RPC on create-checkout.
- Subscription writes happen only via service role in `dodo-webhook`. RLS keeps users read-only on their own row.
- Idempotency: webhook stores `dodo_event_id` in a new `dodo_webhook_events` table; duplicates are no-ops.
- Backward compatibility: existing `has_active_subscription` RPC continues to work (status check is provider-agnostic).

## What I need from you before building

1. Confirm the **redirect URL** behavior — Dodo Payment Links typically accept `?redirect_url=` and `?metadata_*=` query params. If your links are locked to a fixed redirect in the Dodo dashboard, I'll set them to `/success/pro` and `/success/pro/yearly` there instead and adapt the edge function to skip URL building.
2. You'll need to add two secrets after I scaffold: `DODO_API_KEY`, `DODO_WEBHOOK_SECRET`. I'll prompt for them.
3. Confirm webhook URL registration in the Dodo dashboard once deployed.

Approve and I'll implement in this order: migration → edge functions → secrets prompt → `useSubscription` hook → Pricing wiring → Success page polling → settings billing block.  
  
User Answer : 

Approved. Proceed with the implementation in the exact order proposed.

For redirect behavior:  
Dodo redirects do support query parameters and redirect_url handling correctly on my side, so proceed with the dynamic redirect URL architecture.

After deployment, I will:

add DODO_API_KEY

add DODO_WEBHOOK_SECRET

register the webhook URL in the Dodo dashboard

Keep the implementation production-ready, secure, optimized, and compatible with all existing RLS/auth/subscription systems.

Also ensure:

no duplicate subscription rows are possible

canceled/expired subscriptions downgrade correctly

realtime listeners are cleaned up properly

subscription cache invalidation is efficient

polling stops immediately after webhook confirmation

mobile redirect flow feels smooth after payment completion

Proceed.
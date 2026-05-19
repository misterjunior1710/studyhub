# Pro / Premium Enforcement Audit + Hardening Plan

## Current state (audit findings)

**What exists today**
- `useSubscription()` / `useIsPro()` hook reads `subscriptions` and listens to realtime.
- DB function `is_pro_user(uuid)` exists and is correct (covers active/trialing/renewed + grace period).
- Dodo checkout + webhook deployed; subscriptions table populated correctly.

**What is missing or weak (vulnerabilities)**
1. **No edge function checks Pro status.** `ai-assistant`, `ai-writing-assist`, `ai-task-assist`, `generate-study-content`, `firecrawl-*` are all open to any authenticated user with only generic rate limits — a free user gets the same daily allowance as Pro.
2. **No per-day caps for free tier** (Nova 3/day, tiny AI tools 2/day) — current limits are 30/5min, 60/5min etc., which is way above the free-tier cap.
3. **No frontend gating** anywhere. `/content-generator`, `/whiteboards`, premium themes, collaborative docs, etc. are reachable by free users via URL or UI.
4. **Premium themes** in `Settings.tsx` (`premiumThemes` array) are selectable by anyone — no Pro gate.
5. **`create_whiteboard` RPC** does not check Pro; collaborative whiteboards/docs are supposed to be Pro.
6. **No Pro badge** rendered on profile cards / posts.
7. **No reusable `RequirePro` route guard** or `ProGate` component — checks would be scattered.
8. **No usage ledger** — even with caps, no visible "X/3 messages used today" UI.

---

## Proposed architecture

### 1. Single source of truth: `useIsPro()` + `RequirePro`
- Keep existing `useSubscription()` hook (already realtime).
- Add `src/components/pro/RequirePro.tsx` — route wrapper that:
  - Shows skeleton while `loading`.
  - If not pro → renders `<UpgradeWall feature="..."/>` (polished CTA → `/pricing`), no crash, no redirect-loop.
- Add `src/components/pro/ProGate.tsx` — inline wrapper for sub-features (e.g. premium theme picker, "create collaborative doc" button). Shows blurred/locked state with upgrade CTA.
- Add `src/components/pro/ProBadge.tsx` — small crown badge shown next to username when `is_pro`.

### 2. Server-side enforcement helper
- New `supabase/functions/_shared/pro.ts`:
  ```ts
  export async function getProAndUsage(admin, userId) { ... }
  // returns { isPro: boolean }
  ```
  Calls `is_pro_user(userId)` RPC with service role.
- Used by every premium edge function before doing AI work.

### 3. Free-tier daily usage caps (DB-backed, tamper-proof)
- New table `ai_usage_daily(user_id, bucket, local_date, count)` with unique `(user_id, bucket, local_date)`.
- New RPC `consume_ai_quota(_bucket, _free_limit)`:
  - If `is_pro_user(auth.uid())` → allow, no increment.
  - Else atomically increment row for today and reject if `count > _free_limit`.
  - Returns `{ allowed, used, limit, is_pro }`.
- Edge functions call this RPC (service role with explicit user id) before running:
  | Function | Bucket | Free limit |
  |---|---|---|
  | `ai-assistant` (Nova) | `nova_chat` | 3 / day |
  | `ai-writing-assist` | `ai_writing` | 2 / day |
  | `ai-task-assist` | `ai_task` | 2 / day |
  | `generate-study-content` | `ai_generate` | 2 / day |
  | `firecrawl-search` / `firecrawl-scrape` | `ai_research` | 2 / day |

### 4. Pro-only edge functions / actions
- `dodo-create-checkout`: no change.
- A new lightweight `get-subscription` is not needed — use existing realtime hook + `get_my_subscription` RPC.
- Any future "premium-only" edge function: gate with `getProAndUsage()` and return 402 `{ error: "pro_required" }` if not pro. Frontend maps 402 → upgrade modal.

### 5. Whiteboards / Collaborative docs (Pro-only)
- Update `create_whiteboard()` RPC: require `is_pro_user(auth.uid())`. Solo whiteboard for free users can be a separate non-persisted local mode, but per pricing copy "collaborative whiteboards & docs" is Pro — so all whiteboard creation moves behind Pro.
- Tighten RLS on `whiteboards` INSERT and `collaborative_docs` (if exists) INSERT to require `is_pro_user(auth.uid())`. SELECT/UPDATE of existing rows unchanged so paid users who downgrade still see their data read-only.
- Frontend: wrap `/whiteboards` and `/collaborative-docs` (if route) in `<RequirePro>`.

### 6. Premium themes
- Mark `premiumThemes` entries with `pro: true`.
- `Settings.tsx` theme picker: non-pro users see them with a lock icon; clicking opens upgrade modal. If a free user already has a premium theme stored, force-revert to default on load.

### 7. Pro badge
- Render `<ProBadge/>` in: `Navbar` profile dropdown, `UserProfile`, `StudyPost` author line, comment author line, leaderboard rows.
- Driven by `is_pro` returned from a small batched lookup (`subscriptions` SELECT public-safe view).
  - Add view `public.user_pro_status (user_id, is_pro)` exposed via SELECT to authenticated users — only flag, no plan/dates.

### 8. UX when blocked
- 402 from any edge function → toast + `<UpgradeDialog feature=…/>` (already-styled, uses existing tokens).
- `RequirePro` wall: feature illustration, "What you get with Pro", CTA → `/pricing?from=<feature>`.
- Never throw / never expose raw "RLS violation"; map to friendly copy in a shared `handlePremiumError(e)` util.

---

## Technical details

**New / changed files**
- `src/components/pro/RequirePro.tsx`, `ProGate.tsx`, `ProBadge.tsx`, `UpgradeDialog.tsx`, `UpgradeWall.tsx`
- `src/lib/proErrors.ts` (maps 402 / pro_required)
- `src/hooks/useProUsage.ts` (optional: returns today's `{used, limit}` for display)
- `src/App.tsx` — wrap `/whiteboards`, `/content-generator` (Pro tier of generations gated inside), Pro-only routes with `RequirePro`
- `src/pages/Settings.tsx` — gate premium themes
- `src/components/Navbar.tsx`, `StudyPost.tsx`, `UserProfile.tsx`, leaderboard rows — add `<ProBadge>`
- `supabase/functions/_shared/pro.ts` — `assertPro()`, `consumeQuota()` helpers
- All AI edge functions (`ai-assistant`, `ai-writing-assist`, `ai-task-assist`, `generate-study-content`, `firecrawl-search`, `firecrawl-scrape`) — call `consumeQuota()` and return 402 on cap hit

**DB migrations**
- Create `ai_usage_daily` table + indexes + RLS (user can SELECT own; only service role can INSERT/UPDATE).
- Create `consume_ai_quota(_bucket text, _free_limit int)` SECURITY DEFINER RPC.
- Update `create_whiteboard()` to check `is_pro_user(auth.uid())`.
- Tighten `whiteboards` INSERT policy (require pro).
- Create `user_pro_status` view (only `user_id, is_pro`).
- No new RLS on `subscriptions` (already protected).

**No changes to**
- Auth flow, Dodo webhook, payment URLs, existing user data.

---

## Rollout

1. Migration (caps table, RPC, whiteboard gate, view).
2. Shared edge helper + update each AI function.
3. Frontend `RequirePro` + gates + badge + theme lock.
4. QA: free-user smoke test (URL bypass, devtools localStorage edits, direct `supabase.functions.invoke`, direct `supabase.from("whiteboards").insert`).
5. Document in `mem://features/pro-enforcement`.

## Audit-report template (delivered after build)
- Protected systems: list
- Vulns found: list above
- Fixes applied: per-file diff summary
- Remaining weak spots: e.g. premium-only push topics, future modules
- Confirmation: free user can no longer (a) call AI past cap, (b) create whiteboard, (c) pick premium theme, (d) get Pro badge.

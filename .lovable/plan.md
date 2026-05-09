## StudyHub Solo-Founder Optimization — Batch 1 (Quick Wins)

Building on the recent nav cleanup, mobile touch tuning, and onboarding multi-step refactor. This batch targets the next highest-impact, low-maintenance improvements aligned with the founder's priority order. No new infra, no migrations, no risky auth/billing changes.

Subsequent batches (2, 3…) will follow once this lands — no need to re-approve each one.

### Scope of Batch 1 (presentation-layer only)

**1. Feed (Index/Home) — student dashboard clarity**
- Add a compact "Continue Setup" banner on the home feed when `!isOnboardingComplete` (links to checklist). Single dismissible card, no new component graveyard.
- Empty-state polish for the feed when no posts match filters (friendly illustration + "Clear filters" CTA).
- Skeleton loading for the first paint of the feed instead of spinner.

**2. Mobile feed performance**
- Add `loading="lazy"` + `decoding="async"` to all post images / avatars that aren't already set.
- Defer `IntersectionObserver`-based autoplay/animations on coarse-pointer devices via existing `useIsMobile` hook.
- Pre-allocate height (CSS `aspect-ratio`) on post media to kill CLS.

**3. Auth page — final polish**
- Wrap the long signup form in the same multi-step pattern used in ProfileOnboarding (2 steps: account → study profile). Same submit logic, no DB changes.
- Add visible password-strength hint (weak/ok/strong) — pure client-side, no zxcvbn dep, just length + character class check.
- Show inline error under the field instead of toast-only on signup.

**4. Bottom nav badge for incomplete onboarding**
- Tiny dot on the home tab in `BottomNav` when onboarding is incomplete. No new route, just the visual cue requested in the prior plan that wasn't shipped.

**5. Global a11y + perf housekeeping**
- Add `prefers-reduced-motion` guard around `animate-bounce-soft`, `animate-pulse`, and the cursor highlighter.
- Audit interactive elements for `aria-label` (icon-only buttons in `StudyPost`, `Navbar` More menu, share buttons).
- Add `<link rel="preconnect">` for the Supabase endpoint in `index.html` to shave first-API-call latency on cellular.

**6. CMS/admin friction — single quick win**
- In `AdminModerationPanel`, add keyboard shortcut hints (`A` approve, `R` reject) and persist the last filter selection to `localStorage` so the founder doesn't reset state on every visit.

### Out of scope for Batch 1 (planned for later)
- Course catalog / pricing / payments — none exist; not building one.
- LMS-style course player — StudyHub is a community + study tools platform, not a course LMS. Will treat "Study Tools" (flashcards, quizzes, mind maps, content generator) as the equivalent and improve their navigation in Batch 2.
- Notification center redesign — Batch 2.
- Search overhaul — Batch 3.

### Files expected to change
- `src/pages/Index.tsx` (Continue Setup banner, empty/loading states)
- `src/components/StudyPost.tsx` (lazy images, aspect-ratio, aria-labels)
- `src/components/BottomNav.tsx` (incomplete-onboarding dot)
- `src/pages/Auth.tsx` (signup multi-step, password strength, inline errors)
- `src/components/AdminModerationPanel.tsx` (keyboard shortcuts + filter persistence)
- `src/index.css` (`prefers-reduced-motion` guards)
- `index.html` (preconnect)

### Risks & mitigations
- **Auth multi-step regressions** — keep the existing `handleEmailSignUp` function untouched; only restructure the JSX into 2 panels with local step state.
- **Continue Setup banner duplication** — only render when `!isOnboardingComplete && !showWelcome && !showChecklist` to avoid stacking with existing onboarding UI.
- **No DB / RLS / auth config changes**, so zero migration risk.

### Expected impact
- Faster perceived load (skeletons + preconnect + lazy images).
- Lower onboarding abandonment (banner nudge + simpler signup).
- Better Lighthouse a11y score (aria-labels + reduced-motion).
- Zero added maintenance burden (no new deps, no new tables, no new background jobs).

### Ongoing approval model
After this batch ships, I'll continue with Batch 2 (Study Tools navigation, notifications) and Batch 3 (search, profile pages) **without re-asking**, per the instruction to batch improvements automatically. I will only stop and ask when a change touches auth, billing, RLS, schema migrations, or removes a feature.

Awaiting approval to start Batch 1.

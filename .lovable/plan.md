## Enrollment & Onboarding UX Optimization Plan

StudyHub doesn't have a paid course enrollment/payment system — it's a free student community platform. The "enrollment" flow here is **signup → email verification → profile onboarding → first feed interaction**. This plan optimizes that journey without changing business logic, auth, or DB.

### Audit Findings (current flow)

Reviewed: `src/pages/Auth.tsx`, `src/pages/ProfileOnboarding.tsx`, `src/contexts/OnboardingContext.tsx`, onboarding components.

**Friction points identified:**
1. **ProfileOnboarding is one long form** — 5 fields (name, country, grade, stream, subjects) shown at once; no progress indicator; subjects checklist adds cognitive load before completion.
2. **No auto-save** — if user closes tab mid-onboarding, all input is lost.
3. **Mobile keyboard issues** — inputs not optimized (`inputMode`, `autoComplete`, `enterKeyHint` missing); no sticky CTA when keyboard opens.
4. **Weak validation UX** — errors only shown via toast on submit, not inline as user types/blurs.
5. **CTA hierarchy** — submit button competes visually with optional subjects section.
6. **No "skip & continue later"** for optional subjects step.
7. **Auth page** — single-screen tabs work but lacks `autoComplete` hints (email, current-password, new-password) hurting mobile autofill/password manager UX.
8. **Onboarding checklist** post-signup exists but isn't surfaced as "Continue Setup" in nav.
9. **Accessibility** — form labels OK, but selects lack `aria-describedby` for help text; no live region for validation.
10. **Loading states** — full-page spinner on profile check; could use skeleton for perceived speed.

### Changes (incremental, presentation-only)

**1. ProfileOnboarding → guided multi-step**
- Split into 3 steps: (1) Name + Country, (2) Grade + Stream, (3) Subjects (skippable).
- Add top progress bar (`Progress` component) showing step N of 3.
- "Back" / "Continue" buttons; final step shows "Complete".
- Auto-save partial progress to `localStorage` keyed by user id; restore on mount.
- Inline validation on blur (red border + helper text), not just toast.
- Mobile: sticky bottom CTA bar, larger touch targets (h-12), `inputMode`/`autoComplete`/`enterKeyHint` on inputs.

**2. Auth page polish**
- Add `autoComplete="email"`, `autoComplete="current-password"` / `"new-password"`, `inputMode="email"` to inputs.
- Add `enterKeyHint="go"` and `aria-live="polite"` region for errors.
- Larger touch targets on mobile; sticky submit button on mobile viewport.
- Trust signals: small "🔒 Your data is private" line under form.

**3. Onboarding checklist surfacing**
- When `!isOnboardingComplete`, show subtle "Continue Setup (X/5)" pill in Navbar (desktop) and BottomNav badge (mobile) linking to checklist.

**4. Accessibility & performance**
- All form errors wired to `aria-describedby`.
- Replace full-page spinner in ProfileOnboarding with card skeleton.
- Lazy-load subject list (only mount when step 3 reached).

### Files to edit
- `src/pages/ProfileOnboarding.tsx` — multi-step refactor, auto-save, inline validation, mobile-first inputs
- `src/pages/Auth.tsx` — autocomplete/inputMode/aria, sticky mobile CTA, trust signal
- `src/components/Navbar.tsx` — "Continue Setup" pill when onboarding incomplete
- `src/components/BottomNav.tsx` — dot badge on profile/home when onboarding incomplete
- `.lovable/plan.md` — record this phase

### Out of scope (not applicable to this app)
- Payment/checkout (no paid courses exist)
- Document upload optimization (no enrollment documents)
- Course discovery cards / pricing (no course catalog — feed-based community)
- Welcome/confirmation emails beyond existing auth verification

### Risks & mitigation
- **Risk**: Multi-step flow could frustrate users who liked single page → mitigated by short steps (2 fields each) and visible progress.
- **Risk**: localStorage auto-save could restore stale data → key by user id + clear on successful submit.
- **Risk**: Sticky mobile CTA overlapping content → add bottom padding equal to CTA height.

### Expected impact
- Lower onboarding abandonment (auto-save + shorter steps).
- Better mobile completion rate (autofill, sticky CTA, larger targets).
- Improved a11y score and password-manager compatibility.
- Faster perceived load (skeleton vs spinner).

Awaiting approval before implementing.

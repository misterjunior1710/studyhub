
# Mobile Responsiveness Audit & Optimization Plan

## Audit Findings

### What's Working Well
- Bottom nav bar (recently added) provides thumb-friendly navigation on mobile
- Feed and Questions pages render cleanly on 375px
- Study Mode timer scales well on mobile
- Typography is generally readable — no tiny text issues
- Cards stack properly in single-column on mobile
- CLS is excellent (0.0008)

### Issues Found

| Issue | Severity | Location |
|-------|----------|----------|
| **BottomNav shows on auth/onboarding pages** — confusing when not logged in on those flows | Medium | BottomNav.tsx |
| **Cookie consent overlaps bottom nav** — both are fixed bottom z-50 | High | CookieConsent.tsx |
| **FCP is 10.7s** (dev server) — 154 script resources loaded eagerly | Medium | Performance |
| **Bottom nav spacer adds 56px to ALL pages** including desktop (hidden but still in DOM flow outside md:hidden wrapper properly) | Low | BottomNav.tsx |
| **Touch targets on vote arrows** — up/down vote buttons may be under 44px | Medium | StudyPost.tsx |
| **No active state feedback on bottom nav tap** — missing haptic/visual press state | Low | BottomNav.tsx |
| **Footer "Study Mode" not updated** to match new "Study Tools" terminology | Low | Footer.tsx |
| **Duplicate nav items** — logged-in/logged-out bottom nav arrays are identical | Low | BottomNav.tsx |
| **No tablet-specific breakpoint** — jumps from mobile (hamburger) to full desktop at md (768px) | Medium | Navbar.tsx |

---

## Optimization Plan (4 focused changes)

### 1. Fix BottomNav Route Exclusions & Cookie Overlap
- Hide BottomNav on `/auth`, `/profile-onboarding` routes
- Raise BottomNav z-index above cookie consent, or bump cookie consent to sit above bottom nav with margin-bottom
- Deduplicate the identical logged-in/logged-out item arrays
- Add `active:scale-95` press feedback on bottom nav buttons

### 2. Improve Touch Targets & Mobile Interactions
- Ensure vote buttons on StudyPost are minimum 44x44px touch targets
- Add `touch-action: manipulation` to interactive elements to eliminate 300ms tap delay
- Improve bottom nav button touch area to full 48px minimum

### 3. Footer & Terminology Consistency
- Update Footer "Study Mode" to "Study Tools"
- Update Footer to include AI Study Tools link
- Ensure footer has adequate bottom padding on mobile (above bottom nav)

### 4. Tablet Breakpoint & Responsive Polish
- Add an intermediate `lg` breakpoint behavior for tablets (768-1024px) showing a condensed desktop nav instead of hamburger
- This means showing primary nav items at `md:` but collapsing "More" into dropdown earlier

---

## What Will NOT Change
- No routes modified
- No backend/auth changes
- No page rebuilds
- No removal of existing features
- No design language changes
- All existing responsive breakpoints preserved

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|-----------|-----------|
| Bottom nav z-index conflicts | Low | Test with cookie consent visible |
| Touch target changes affect layout | Low | Use min-h/min-w, not fixed sizes |
| Tablet nav looks cramped | Low | Test at 768px and 1024px viewports |

## Expected Impact
- Cookie/nav overlap fixed immediately improves mobile first impression
- Touch targets meeting 44px minimum improves accessibility compliance
- Terminology consistency reduces user confusion
- Auth page cleanup makes onboarding flow feel polished

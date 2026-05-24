# Make StudyHub a calmer place to hang out

Goal: keep the indigo identity, marquee, taglines, reviews, and Nova — but reduce visual noise, soften surfaces, and add breathing room so students can stay on the site for hours without fatigue.

## Principles (apply everywhere)
- Same brand color, same motion timings, same fonts — only soften how surfaces look.
- More whitespace, fewer borders, fewer stacked shadows.
- Lower contrast on dividers and muted text; keep contrast on primary content.
- Don't remove features, just remove redundancy.

## 1. Sitewide visual system (`src/index.css`)
- Soften dark mode surfaces: lift `--background` from `224 25% 7%` to `224 22% 9%`, lift `--card` slightly for a less stark feel.
- Soften borders: drop border alpha (e.g. `--border` lightness up a touch in dark, down in light) so cards feel less boxed-in.
- Reduce shadow stack intensity by ~25% across `--shadow-sm/md/lg/xl` (lower alpha only — keep blur).
- Replace heavy `bg-muted/30` band dividers used between sections with hairline `border-border/40` only.
- Keep all gradients, marquee, hover-lift, and Nova motion as-is.

## 2. Landing page declutter (`src/pages/Index.tsx`)
Current: 11 stacked sections (hero, social proof, quick actions, showcase, trust, features, steps, testimonials, about, CTA, second big section, reviews, final CTA). That's the main fatigue source.

Changes (keep all content/copy that matters):
- **Merge** the "final CTA" section (line 573) into the bottom of the reviews section — one closing CTA, not three.
- **Remove** the duplicated mid-page CTA buttons (lines 254–263 and 586–595 are repeats of the hero CTA). Keep just the hero CTA + one closing CTA.
- **Collapse** the standalone "trust" strip (313–321) into the hero as a single quiet line under the rating row.
- **Soften section rhythm**: standardize vertical padding to `py-20` and drop the alternating `bg-muted/30` bands — use whitespace instead of color blocks to separate sections.
- **Tighten hero**: keep headline, subhead, single CTA, rating row. Remove any secondary chips/badges stacked under it.
- Cards inside Features/Steps/Showcase: remove inner borders where a card sits on a muted band; rely on subtle shadow only.

Preserved verbatim: headline/tagline copy, 4.5★ Google Reviews block, Featured-on-ufind marquee, testimonials text, Nova references, About section copy.

## 3. Navigation calm-down (`src/components/Navbar.tsx`, `src/components/Footer.tsx`)
- Navbar: reduce visual weight — thinner bottom border, remove any pill backgrounds on inactive links, keep grouping exactly as memory dictates (Study/AI prioritized, Leaderboard under More).
- Footer: keep marquee + Featured badge. Reduce column header weight, increase row spacing, soften link color to `text-muted-foreground` with hover to `foreground`.

## 4. Cards & surfaces (shared)
- `src/components/ui/card.tsx`: tone down default hover from `-translate-y-0.5 hover:shadow-md` to `hover:shadow-sm` only (keep `interactive` and `elevated` variants livelier). This calms feeds/lists where many cards stack.

## What stays exactly the same
- All colors, gradients, primary indigo, dark default.
- Marquee speed and Featured badge.
- All copy: taglines, names, reviews, ratings, CTAs labels.
- Nova, motion timings (500/600/300ms), easter eggs, sounds.
- Routes, features, auth, data — zero logic changes.

## Out of scope
- Core app pages (Feed/Questions/Study) — user chose landing + visual system only. They'll benefit automatically from the shared token + card softening, but no per-page redesign.

## Files touched
- `src/index.css` — surface/border/shadow token softening
- `src/pages/Index.tsx` — section merge + CTA dedupe
- `src/components/Navbar.tsx` — lighter chrome
- `src/components/Footer.tsx` — softer link/row treatment
- `src/components/ui/card.tsx` — calmer default hover

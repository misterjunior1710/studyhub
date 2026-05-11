# StudyHub Accessibility Guide (WCAG 2.1 AA)

This project targets **WCAG 2.1 Level AA**. This guide documents what's already in place and the standards new code must follow.

## What's wired in globally

| Area | Implementation |
|---|---|
| Skip link | `<a href="#main-content" class="skip-to-main">` at top of `App.tsx` |
| Main landmark | `<main id="main-content" tabIndex={-1}>` wraps all routes |
| Focus ring | Global `*:focus-visible` outline using `--ring` token in `src/index.css` |
| Reduced motion | `@media (prefers-reduced-motion: reduce)` flattens animations/transitions |
| Forced-colors | `@media (forced-colors: active)` ensures focus ring uses `CanvasText` |
| Touch targets | Mobile `touch-action: manipulation`; min 44×44 enforced via Tailwind sizing |
| Tap delay | Eliminated for buttons/links/inputs on coarse pointers |
| Semantic theme | Dark theme tokens in `index.css` meet AA contrast (verify on new colors) |
| Error boundary | App is wrapped in `ErrorBoundary` (no white screens on crashes) |

## Component standards

### Buttons & links
- Every icon-only `<Button>` MUST have `aria-label` (memory rule).
- Use `<Button>` for actions, `<Link>`/`<a>` for navigation. Don't fake one with the other.
- Loading state: add `aria-busy={true}` and disable the button.

### Forms
- Every input has a `<Label htmlFor>` or `aria-label`.
- Validation errors use `aria-invalid` and `aria-describedby` pointing to the error message id.
- Group related fields with `<fieldset><legend>`.
- Don't rely on color alone to indicate errors — include text + icon.

### Modals / Dialogs
- Use shadcn `Dialog` / `AlertDialog` / `Sheet` — they handle focus trap, ESC, and `aria-modal`.
- Always provide `<DialogTitle>` (visually hidden if needed via `sr-only`) and `<DialogDescription>` when content isn't self-explanatory.

### Dropdowns / Menus / Tabs
- Use shadcn `DropdownMenu`, `Tabs`, `Popover`, `Select` — they ship with correct ARIA roles and keyboard handling (arrow keys, Home/End, ESC).
- Don't replace the trigger element with a plain `<div>` — that breaks keyboard support.

### Images
- Decorative images: `alt=""` + `aria-hidden="true"`.
- Educational/content images: descriptive `alt` text. User-uploaded post images should accept an alt-text field where feasible.
- Avatars: `alt={username}` (not "avatar").
- Lucide icons inside labeled buttons: `aria-hidden="true"` (the button label carries semantics).

### Headings
- One `<h1>` per route. Page titles in `SEOHead` + a visible `<h1>` on the page.
- Don't skip levels (h1 → h2 → h3, never h1 → h3).
- Don't pick heading level for size — use Tailwind classes for that.

### Color & contrast
- Body text: ≥ 4.5:1 against background.
- Large text (≥18px / ≥14px bold): ≥ 3:1.
- UI components & focus indicators: ≥ 3:1.
- Never use color alone to convey state (pair with icon/text).
- All colors come from `index.css` HSL tokens — don't hardcode hex.

### Motion & animation
- Respect `prefers-reduced-motion` (already global). Don't override with inline styles.
- Avoid auto-playing carousels. Provide pause controls if you must.
- No flashing > 3 times per second (seizure risk).

### Video / audio
- Provide captions for any tutorial/educational video (use `<track kind="captions">`).
- Provide a transcript link for audio-only content.

## Keyboard navigation checklist

For any new interactive UI:
- [ ] Reachable with `Tab` in logical order
- [ ] Activatable with `Enter` / `Space`
- [ ] `Esc` closes overlays
- [ ] Arrow keys navigate within composite widgets (menus, tabs, lists)
- [ ] Focus is visible at every step
- [ ] No keyboard traps (focus can always leave)
- [ ] After closing a dialog, focus returns to the trigger

## Screen reader testing

Test critical flows (signup, login, post create, comment, DM send) with:
- **VoiceOver** (macOS: ⌘+F5)
- **NVDA** (Windows, free)
- **TalkBack** (Android)

Listen for: missing labels, "button button" duplicates, undescribed state changes, content order that doesn't match visual order.

## Automated auditing

Run on each meaningful change to UI:

```bash
# Lighthouse a11y audit (Chrome DevTools → Lighthouse → Accessibility)
# Target: 95+ score on every public page

# axe DevTools browser extension — zero "serious" or "critical" issues
```

Optional CI add-on (not yet enabled to keep solo-founder maintenance light):
- `vitest-axe` for component-level a11y assertions
- `@axe-core/playwright` for end-to-end a11y in CI

## When in doubt

1. Use a native HTML element before reaching for ARIA.
2. Use a shadcn primitive before building a custom widget.
3. If you must build custom, follow the [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/) pattern for that widget.
4. Test with keyboard only before shipping.

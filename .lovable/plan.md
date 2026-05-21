# Landing page conversion fixes

Tighten the hero, reframe features around student outcomes, add a head-to-head differentiation block, and surface a real FAQ that kills the top objections. All edits are in `src/pages/Index.tsx`.

## 1. Hero rewrite

- **Headline:** "Stop Studying Alone. Ace Everything with Your Squad."
- **Subheadline:** "The free, student-only hub where you ask questions, join study squads, and get unstuck fast — powered by Nova AI and built for every grade, subject, and curriculum."
- **CTA:** Change "Get started" → "Join free in 30 seconds"
- **Friction-reducers under CTA:** small inline row — "Free Access · credit card for premium access · Students 13+"
- Move the existing Chegg/Reddit/chatbot contrast line deeper in the landing page.

## 2. Reframe features around outcomes

Rewrite each of the 8 feature cards so the title is the *student outcome* and the subtitle names the tool. Examples:

- "Stop cramming the night before" → Flashcards, quizzes & Pomodoro in Study Mode
- "Get unstuck in one message" → Nova AI explains the *why*, not just the answer
- "Never miss a deadline again" → Tasks + calendar with smart reminders
- "Find your people, not strangers" → Study Squads by grade, subject, curriculum
- "Actually want to study" → XP, missions, leaderboard
- "Ask without the awkward" → Anonymous questions, verified answers
- "One place for every note" → Saved posts, notes, mind maps
- "Built for your curriculum" → CBSE, IB, IGCSE, A-Levels, AP, more

## 3. New "Why StudyHub over Discord/Reddit/Khan Academy?" section

Insert above the existing Elfsight reviews block. Three-column comparison card:

```text
StudyHub                Discord/Reddit          Khan Academy
Student-only (13+)      Anyone, anywhere        Pre-recorded only
Real students answer    Random strangers        No community
Nova AI built in        No AI                   No personalized AI
XP, missions, squads    Generic chat            No motivation system
```

Keep it visually light — 3 columns with check/x icons, not a heavy table.

## 4. New FAQ section

Insert just above the footer using the existing shadcn `Accordion`. Four items:

- **Is it really free?** Yes — core community, Nova AI basics, study tools, and squads are free forever. Optional Pro unlocks heavier AI usage and advanced tools.
- **Is my data private?** Your posts can be anonymous, profiles are private by default to non-logged-in visitors, and we never sell data. Full details in our Privacy Policy.
- **What grade levels is this for?** Grade 9 through Undergraduate/Postgraduate, plus adult learners. Strict 13+ policy.
- **How is this different from Reddit or Discord?** Students only (verified 13+), answers tied to your actual curriculum (CBSE/IB/IGCSE/AP/A-Levels…), Nova AI for instant help, and XP/missions that make studying stick.

Add corresponding FAQ JSON-LD via the existing `getFAQSchema` helper passed to `StructuredData` for SEO.

## Out of scope

- No backend, routing, or business-logic changes.
- Performance/LCP work (the 8.9s mobile LCP) is a separate effort — call out only, no changes here.
- Elfsight widget, social proof stats, gamification dashboard remain as-is.

## Files touched

- `src/pages/Index.tsx` — hero copy, CTA, feature card rewrite, new comparison section, new FAQ accordion + FAQ schema.
## Transition Life Skills Modules

Build a comprehensive Life Skills hub at `/transitions` with two modules (HS→College, College→Adult), progress tracking, interactive tools, and a resource library.

### Scope

**Phase 1 (this build):**
1. Database schema for modules, lessons, user progress, budgets, savings goals
2. Main `/transitions` hub page with two module cards + progress rings
3. Module detail pages with topic sections, lesson checklists, completion tracking
4. Seeded content for all 8 topic areas across both modules
5. Interactive Budget Calculator (income vs expenses, category breakdown)
6. Savings Goal Tracker (set goal, log contributions, progress bar)
7. Resource Library (searchable, filterable cards: worksheets/templates/guides)
8. Achievement badges on milestones (25/50/100% module completion)
9. Navbar entry under "More" → "Life Skills"
10. Realtime sync via Supabase channels on user_progress

**Phase 2 (future, not built now):**
- AI coaching integration (Nova-powered personalized transition plan)
- Push reminder scheduling for transition tasks
- Downloadable PDF worksheets

### Database

Tables (all RLS-protected, user-owned where applicable):
- `transition_modules` (public read): id, slug, title, phase, description, order_index, icon, color
- `transition_topics` (public read): module_id, slug, title, description, order_index, icon
- `transition_lessons` (public read): topic_id, title, content (markdown), estimated_minutes, order_index, lesson_type ('reading'|'checklist'|'exercise')
- `transition_resources` (public read): title, description, category, resource_type, url/content, tags[]
- `user_lesson_progress` (user-owned): user_id, lesson_id, completed, completed_at, notes
- `user_budgets` (user-owned): user_id, name, period, income, categories (jsonb)
- `user_savings_goals` (user-owned): user_id, title, target_amount, current_amount, deadline, contributions (jsonb)

### File Structure

```
src/pages/Transitions.tsx              — hub page
src/pages/TransitionModule.tsx         — module detail
src/pages/TransitionResources.tsx      — resource library
src/components/transitions/
  ModuleCard.tsx
  TopicAccordion.tsx
  LessonItem.tsx
  ProgressRing.tsx
  BudgetCalculator.tsx
  SavingsGoalTracker.tsx
  ResourceCard.tsx
src/hooks/useTransitions.ts            — load modules/progress
src/lib/transitionsContent.ts          — seed content helpers
```

### Design

- Glassmorphism cards (existing `.glass-card`, `.hover-lift`)
- Two distinct module accents: HS→College = blue/teal, College→Adult = purple/amber
- Progress rings using SVG stroke-dashoffset
- Tab nav inside module page: Overview | Lessons | Tools
- Mobile: stacked cards; desktop: 2-col module grid

### Routes

- `/transitions` (hub)
- `/transitions/:moduleSlug` (module detail w/ tabs)
- `/transitions/resources` (library)

### Seeding

Migration inserts ~2 modules, 8 topics, ~24 lessons, ~20 resources covering all topics from the spec. Content kept concise, student-friendly, motivating.

### Out of Scope

- Stripe/loan calculators with real APR (keep generic)
- Real banking integrations
- Video content (links only in resources)

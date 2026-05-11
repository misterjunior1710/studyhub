
-- Modules
CREATE TABLE public.transition_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  phase text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL DEFAULT 'GraduationCap',
  accent text NOT NULL DEFAULT 'blue',
  order_index int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.transition_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES public.transition_modules(id) ON DELETE CASCADE,
  slug text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL DEFAULT 'BookOpen',
  order_index int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(module_id, slug)
);

CREATE TABLE public.transition_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id uuid NOT NULL REFERENCES public.transition_topics(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  lesson_type text NOT NULL DEFAULT 'reading',
  estimated_minutes int NOT NULL DEFAULT 5,
  order_index int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.transition_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  resource_type text NOT NULL,
  content text,
  url text,
  tags text[] NOT NULL DEFAULT '{}',
  order_index int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.user_lesson_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  lesson_id uuid NOT NULL REFERENCES public.transition_lessons(id) ON DELETE CASCADE,
  completed boolean NOT NULL DEFAULT true,
  completed_at timestamptz NOT NULL DEFAULT now(),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

CREATE TABLE public.user_budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL DEFAULT 'My Budget',
  period text NOT NULL DEFAULT 'monthly',
  income numeric NOT NULL DEFAULT 0,
  categories jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.user_savings_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  target_amount numeric NOT NULL,
  current_amount numeric NOT NULL DEFAULT 0,
  deadline date,
  contributions jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.transition_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transition_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transition_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transition_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_savings_goals ENABLE ROW LEVEL SECURITY;

-- Public read for content tables
CREATE POLICY "Anyone signed in can view modules" ON public.transition_modules FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone signed in can view topics" ON public.transition_topics FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone signed in can view lessons" ON public.transition_lessons FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone signed in can view resources" ON public.transition_resources FOR SELECT TO authenticated USING (true);

-- Admin write for content tables
CREATE POLICY "Admins manage modules" ON public.transition_modules FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins manage topics" ON public.transition_topics FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins manage lessons" ON public.transition_lessons FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins manage resources" ON public.transition_resources FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- User progress
CREATE POLICY "Users view own progress" ON public.user_lesson_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own progress" ON public.user_lesson_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own progress" ON public.user_lesson_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own progress" ON public.user_lesson_progress FOR DELETE USING (auth.uid() = user_id);

-- User budgets
CREATE POLICY "Users view own budgets" ON public.user_budgets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own budgets" ON public.user_budgets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own budgets" ON public.user_budgets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own budgets" ON public.user_budgets FOR DELETE USING (auth.uid() = user_id);

-- User savings goals
CREATE POLICY "Users view own goals" ON public.user_savings_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own goals" ON public.user_savings_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own goals" ON public.user_savings_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own goals" ON public.user_savings_goals FOR DELETE USING (auth.uid() = user_id);

-- Triggers
CREATE TRIGGER trg_user_budgets_updated BEFORE UPDATE ON public.user_budgets FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_now();
CREATE TRIGGER trg_user_savings_goals_updated BEFORE UPDATE ON public.user_savings_goals FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_now();

-- Indexes
CREATE INDEX idx_transition_topics_module ON public.transition_topics(module_id, order_index);
CREATE INDEX idx_transition_lessons_topic ON public.transition_lessons(topic_id, order_index);
CREATE INDEX idx_user_lesson_progress_user ON public.user_lesson_progress(user_id);
CREATE INDEX idx_user_budgets_user ON public.user_budgets(user_id);
CREATE INDEX idx_user_savings_goals_user ON public.user_savings_goals(user_id);

-- ============== SEED CONTENT ==============

-- Modules
INSERT INTO public.transition_modules (id, slug, title, phase, description, icon, accent, order_index) VALUES
  ('11111111-1111-1111-1111-111111111111', 'high-school-to-college', 'High School → College', 'The Independence Phase', 'Become a self-motivated, independent learner. Build the routines, life skills, and confidence to thrive on your own.', 'GraduationCap', 'blue', 1),
  ('22222222-2222-2222-2222-222222222222', 'college-to-adulthood', 'College → Adulthood', 'The Professional Phase', 'Step into careers, independent living, and adulthood with financial confidence, strong networks, and sustainable wellness.', 'Briefcase', 'purple', 2);

-- Topics for Module 1
INSERT INTO public.transition_topics (id, module_id, slug, title, description, icon, order_index) VALUES
  ('a1111111-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'time-management', 'Time Management & Self-Discipline', 'Own your unstructured time and build study routines that actually stick.', 'Clock', 1),
  ('a1111111-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'self-advocacy', 'Self-Advocacy', 'Speak up for yourself, ask for help, and communicate like a pro.', 'MessageCircle', 2),
  ('a1111111-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'domestic-survival', 'Domestic Survival Skills', 'Laundry, cooking, cleaning, roommates — the stuff nobody taught you.', 'Home', 3),
  ('a1111111-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'financial-literacy', 'Financial Literacy', 'Budgets, banking, loans, and saving as a student.', 'Wallet', 4);

-- Topics for Module 2
INSERT INTO public.transition_topics (id, module_id, slug, title, description, icon, order_index) VALUES
  ('a2222222-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'financial-organization', 'Financial Organization', 'Budgeting, taxes, insurance — the financial foundation of adult life.', 'PiggyBank', 1),
  ('a2222222-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'professional-networking', 'Professional Networking', 'Build a network that opens doors long after graduation.', 'Network', 2),
  ('a2222222-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222', 'wellness', 'Mental & Physical Wellness', 'Sustainable habits to keep you sharp, healthy, and grounded.', 'Heart', 3),
  ('a2222222-0000-0000-0000-000000000004', '22222222-2222-2222-2222-222222222222', 'consistent-scheduling', 'Consistent Scheduling', 'Master the rhythm of full-time work and life balance.', 'CalendarDays', 4);

-- Lessons — Module 1
INSERT INTO public.transition_lessons (topic_id, title, content, lesson_type, estimated_minutes, order_index) VALUES
  -- Time management
  ('a1111111-0000-0000-0000-000000000001', 'Map your week, not just your day', 'College time is **unstructured**. Open a weekly calendar, block your classes, then block 2-hour study sessions for each course. Treat them like classes you can''t miss. Aim for **2 hours of study per credit hour per week**.', 'reading', 5, 1),
  ('a1111111-0000-0000-0000-000000000001', 'Beat procrastination with the 5-minute rule', 'Tell yourself you''ll work for **just 5 minutes**. Starting is the hardest part — once you''re moving, you''ll usually keep going. Pair this with the **Pomodoro** technique: 25 minutes focus, 5 minutes break.', 'reading', 4, 2),
  ('a1111111-0000-0000-0000-000000000001', 'Build a morning routine that doesn''t suck', 'Pick **3 anchors**: wake time, first action (water, stretch, walk), and a "launch task" (e.g. open notes for the next class). Consistent anchors make the rest of your day fall into place.', 'checklist', 6, 3),

  -- Self-advocacy
  ('a1111111-0000-0000-0000-000000000002', 'How to email a professor', 'Use a clear subject line, greet them by title, state your course/section, ask one specific question, and sign off with your name. Example:\n\n> Subject: BIO 101 Section 2 — question about Chapter 4 problem set\n>\n> Hi Professor Lee, I''m Alex from your Tuesday lab. I''m stuck on question 3 — could you point me to a concept I should review? Thanks for your time.\n> Alex', 'reading', 5, 1),
  ('a1111111-0000-0000-0000-000000000002', 'Office hours are free tutoring', 'Show up **once in the first two weeks** of every class. Even just to introduce yourself. Professors remember students who show interest, and you''ll feel less intimidated when you actually need help.', 'reading', 4, 2),
  ('a1111111-0000-0000-0000-000000000002', 'Find your campus support map', 'In your first week, locate: **health services, counseling, academic advising, writing center, financial aid office**. Save the numbers in your phone now. You''ll be glad you did.', 'checklist', 5, 3),

  -- Domestic survival
  ('a1111111-0000-0000-0000-000000000003', 'Laundry without ruining your clothes', '1. Sort: whites, darks, delicates.\n2. Read the tag — **cold water** for most things.\n3. Use a small scoop of detergent (more isn''t better).\n4. Air-dry anything stretchy or printed.\n5. Fold within 10 minutes of drying to skip ironing.', 'checklist', 6, 1),
  ('a1111111-0000-0000-0000-000000000003', 'Five meals you can actually cook', '**Master these and you''ll never starve:** scrambled eggs, pasta with jar sauce, stir-fry with frozen veggies + protein, grilled cheese, overnight oats. Each takes <15 min and costs under $3 a serving.', 'reading', 5, 2),
  ('a1111111-0000-0000-0000-000000000003', 'Roommate ground rules talk', 'In the **first week**, agree on: quiet hours, guests, food sharing, cleaning rotation, thermostat. Having the awkward conversation early prevents the explosive one later.', 'exercise', 6, 3),

  -- Financial literacy
  ('a1111111-0000-0000-0000-000000000004', 'The 50/30/20 student budget', '- **50%** Needs (rent, food, books)\n- **30%** Wants (eating out, fun)\n- **20%** Savings + debt payments\n\nIf you can''t hit 20% savings as a student, aim for **5%** — the habit matters more than the number.', 'reading', 5, 1),
  ('a1111111-0000-0000-0000-000000000004', 'Open a real bank account', 'Get a **fee-free student checking + savings account**. Set up direct deposit. Turn on overdraft alerts (not protection — alerts). Avoid credit cards until you understand interest.', 'checklist', 6, 2),
  ('a1111111-0000-0000-0000-000000000004', 'Student loans 101', 'Borrow only what you need. **Federal loans first** — they have better protections than private. Track the total balance every semester. Interest accrues even while you study (on unsubsidized loans).', 'reading', 7, 3);

-- Lessons — Module 2
INSERT INTO public.transition_lessons (topic_id, title, content, lesson_type, estimated_minutes, order_index) VALUES
  -- Financial organization
  ('a2222222-0000-0000-0000-000000000001', 'Track every expense for 30 days', 'Use a free app (Monarch, Copilot, YNAB trial) or a spreadsheet. The point isn''t to judge yourself — it''s to **see the truth**. Most people are shocked by their food + subscriptions.', 'exercise', 6, 1),
  ('a2222222-0000-0000-0000-000000000001', 'Taxes without panic', 'Three things to know: your **W-2** (or 1099), the **standard deduction**, and that filing online with free software (FreeTaxUSA, IRS Free File) takes about an hour. File before April 15.', 'reading', 7, 2),
  ('a2222222-0000-0000-0000-000000000001', 'The 4 insurances you actually need', '**Health, renter''s, auto** (if you drive), and **disability** (often free through work). Skip extended warranties. Compare quotes annually.', 'reading', 6, 3),

  -- Networking
  ('a2222222-0000-0000-0000-000000000002', 'Your LinkedIn in 30 minutes', '1. Real photo, smiling, neutral background.\n2. Headline = role + 1 specialty (e.g. "Junior Developer · React + accessibility").\n3. About: 3 sentences max.\n4. Add 5 connections from school, 5 from past jobs.\n5. Post once a month.', 'checklist', 7, 1),
  ('a2222222-0000-0000-0000-000000000002', 'The "coffee chat" message', '> Hi [Name], I saw your work on [specific thing] and I''m exploring [field]. Would you have 15 minutes for a quick virtual coffee in the next two weeks? No pressure if not — I appreciate you considering.\n\nShort, specific, no ask beyond their time.', 'reading', 5, 2),
  ('a2222222-0000-0000-0000-000000000002', 'Stay in touch without being weird', 'Pick **5 people** you want to stay close to. Reach out once a quarter — share an article, congratulate them on a win, or just say hi. Networks die from neglect, not rejection.', 'reading', 5, 3),

  -- Wellness
  ('a2222222-0000-0000-0000-000000000003', 'The minimum viable workout', 'You don''t need a 90-minute gym session. **20 minutes, 3 times a week** beats nothing. Walk, bodyweight squats/pushups/planks, or a YouTube routine. Consistency > intensity.', 'reading', 4, 1),
  ('a2222222-0000-0000-0000-000000000003', 'Sleep is non-negotiable', 'Adults need **7–9 hours**. Set a bedtime alarm (not just a wake alarm). Phone out of the bedroom. The "I''ll sleep when I''m dead" mindset just makes you dead sooner.', 'reading', 4, 2),
  ('a2222222-0000-0000-0000-000000000003', 'Find a therapist before you need one', 'Use **Psychology Today** or your insurance directory. Try 2–3 before committing — fit matters more than credentials. Many offer sliding scale rates.', 'checklist', 5, 3),

  -- Scheduling
  ('a2222222-0000-0000-0000-000000000004', 'Time-block your work day', 'Mornings = deep work (no meetings, no Slack). Afternoons = meetings + email. Block your **lunch** too — protect it like a meeting.', 'reading', 5, 1),
  ('a2222222-0000-0000-0000-000000000004', 'Protect your weekends', 'Pick one **fully off day** per week — no work email, no laptop. Burnout is faster than you think when work has no boundaries.', 'reading', 4, 2),
  ('a2222222-0000-0000-0000-000000000004', 'Sunday 15-minute reset', 'Every Sunday: review next week''s calendar, plan 1 priority per day, prep clothes/lunches if useful. 15 minutes that saves hours of weekday chaos.', 'checklist', 5, 3);

-- Resources
INSERT INTO public.transition_resources (title, description, category, resource_type, content, tags, order_index) VALUES
  ('Weekly Schedule Template', 'A printable weekly time-block template with study, class, and self-care slots.', 'time-management', 'template', 'Download or copy this template into your favorite calendar app. Block: classes (red), study sessions (blue), meals + sleep (green), free time (yellow).', ARRAY['template','schedule','college'], 1),
  ('Procrastination Self-Audit', 'Identify the why behind your procrastination so you can solve the right problem.', 'time-management', 'worksheet', 'Answer: 1) What task am I avoiding? 2) What feeling does it bring up? 3) What is the smallest 5-minute step? 4) When will I do it?', ARRAY['worksheet','focus'], 2),
  ('Email-a-Professor Template', 'Copy-paste email template that''s polite, clear, and professional.', 'self-advocacy', 'template', 'Subject: [COURSE CODE] — [topic]\n\nHi Professor [Last Name],\n\nI''m [Your Name] from your [section/time] class. [One specific question or request].\n\nThank you for your time,\n[Your Name]', ARRAY['template','communication'], 3),
  ('Office Hours Cheat Sheet', 'What to bring and how to make office hours actually useful.', 'self-advocacy', 'guide', 'Bring: your notes, the specific problem, what you tried, and a question. Goal: leave with one actionable next step.', ARRAY['guide','study'], 4),
  ('First-Apartment Checklist', 'Everything you need before move-in day.', 'domestic-survival', 'checklist', 'Renter''s insurance, security deposit, mattress + bedding, shower curtain, basic kitchen (pan, pot, knife, cutting board, plates x4, utensils), cleaning kit (sponges, all-purpose spray, paper towels, trash bags), toolkit (screwdriver, hammer, tape measure).', ARRAY['checklist','housing'], 5),
  ('Beginner Grocery List', 'A versatile starter shopping list under $50/week.', 'domestic-survival', 'template', 'Eggs, oats, bread, peanut butter, pasta + sauce, chicken or tofu, frozen veg, rice, bananas, yogurt, cheese, salt + pepper + olive oil.', ARRAY['template','cooking','budget'], 6),
  ('Roommate Agreement Template', 'A simple agreement to align on the basics from day one.', 'domestic-survival', 'template', 'Sections: Rent + bills, quiet hours, guests overnight, food sharing, cleaning rotation, conflict process, what we revisit monthly.', ARRAY['template','housing'], 7),
  ('Student Budget Calculator', 'Plug in income and expenses to see your monthly snapshot.', 'financial-literacy', 'tool', 'Use the built-in Budget Calculator on the Tools tab.', ARRAY['tool','budget'], 8),
  ('Loan Repayment Glossary', 'Plain-English definitions: principal, interest, capitalization, deferment, forbearance, IDR.', 'financial-literacy', 'guide', 'Principal = what you borrowed. Interest = the cost of borrowing. Capitalization = unpaid interest added to principal. IDR = Income-Driven Repayment plans cap your payment as a % of income.', ARRAY['guide','loans'], 9),
  ('First Real Budget Worksheet', 'Move from student-budget to adult-budget after your first paycheck.', 'financial-organization', 'worksheet', 'List: take-home pay, fixed costs (rent, insurance, debt min), variable costs (food, transport, fun), savings (emergency fund, retirement). Aim for 20% savings + debt extra.', ARRAY['worksheet','budget'], 10),
  ('Tax Filing Walkthrough', 'Step-by-step for a simple W-2 tax return.', 'financial-organization', 'guide', '1) Gather W-2(s), 1099s, last year''s return. 2) Choose a free filer (FreeTaxUSA, IRS Free File). 3) Enter income. 4) Take the standard deduction. 5) E-file + set up direct deposit refund.', ARRAY['guide','taxes'], 11),
  ('Insurance Comparison Worksheet', 'Compare quotes side-by-side without getting overwhelmed.', 'financial-organization', 'worksheet', 'Columns: Provider, monthly premium, deductible, copay, in-network coverage, notes. Decide based on your real usage, not worst-case fear.', ARRAY['worksheet','insurance'], 12),
  ('LinkedIn Headline Formulas', 'Three battle-tested headline formats that actually get views.', 'professional-networking', 'guide', '1) [Role] · [Specialty] · [Industry]\n2) Helping [audience] [outcome]\n3) [Aspiring role] | [School/Company] | [What you''re building]', ARRAY['guide','linkedin'], 13),
  ('Coffee Chat Outreach Template', 'A short, specific message that gets replies.', 'professional-networking', 'template', 'Hi [Name], I really enjoyed [specific thing they did/wrote]. I''m exploring [field] and would love 15 min of your time in the next two weeks. Totally fine if the timing doesn''t work — appreciate you considering!', ARRAY['template','networking'], 14),
  ('Salary Negotiation Script', 'What to say when they make you an offer.', 'professional-networking', 'guide', '"Thank you so much for the offer — I''m really excited. Based on my research and the value I''ll bring in [specific area], I was hoping we could land at [target]. Is there flexibility there?" Then **stop talking**.', ARRAY['guide','career','salary'], 15),
  ('Habit Stacking Worksheet', 'Attach new habits to existing ones so they actually stick.', 'wellness', 'worksheet', 'Format: After I [existing habit], I will [new tiny habit]. Example: After I pour my morning coffee, I will write 3 priorities for today.', ARRAY['worksheet','habits'], 16),
  ('Mindfulness 5-Minute Reset', 'A breathing exercise for stress spikes during the workday.', 'wellness', 'guide', 'Box breathing: inhale 4s, hold 4s, exhale 4s, hold 4s. Repeat for 5 minutes. Works anywhere — at your desk, before a meeting, in the bathroom.', ARRAY['guide','mindfulness'], 17),
  ('Finding a Therapist Checklist', 'How to actually start, even when you feel stuck.', 'wellness', 'checklist', 'Check insurance directory or Psychology Today. Filter by specialty + sliding scale. Email 3 with a short intro. Try one session each. Pick the one where you felt most heard.', ARRAY['checklist','mental-health'], 18),
  ('Sunday Reset Template', 'A 15-minute weekly review that makes Mondays painless.', 'consistent-scheduling', 'template', 'Review last week (1 win, 1 lesson). Look at next week (events, deadlines). Pick ONE priority per day. Prep one thing physically (clothes, lunch, bag).', ARRAY['template','planning'], 19),
  ('Work-Life Boundaries Guide', 'Practical scripts for protecting your time at a new job.', 'consistent-scheduling', 'guide', 'After-hours email: "Got it — I''ll dig in first thing tomorrow morning." Weekend ask: "Happy to look Monday — anything I can prep before logging off?" You teach people how to treat your time.', ARRAY['guide','career','boundaries'], 20);

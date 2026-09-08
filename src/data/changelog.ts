export type ChangelogCategory = "feature" | "fix" | "update" | "performance" | "refactor";

export interface ChangelogEntry {
  id: string;
  version: string;
  date: string; // ISO date
  category: ChangelogCategory;
  title: string;
  description: string;
  highlights?: string[];
}

/**
 * Hand-written, public-facing changelog.
 *
 * This is intentionally NOT synced from source control — commit messages are
 * internal build noise and must never be shown to students. Add a new entry at
 * the top of this list whenever something user-visible ships.
 */
export const CHANGELOG: ChangelogEntry[] = [
  {
    id: "2026-09-feed-public",
    version: "3.4",
    date: "2026-09-02",
    category: "feature",
    title: "Browse the feed and questions without an account",
    description:
      "Anyone can now read posts, questions and answers before signing up. Posting, commenting and voting still need an account.",
    highlights: [
      "Public reading for the feed, questions and individual posts",
      "Clear sign-in prompts where an account is required",
    ],
  },
  {
    id: "2026-09-pro-labels",
    version: "3.3",
    date: "2026-08-28",
    category: "update",
    title: "Clearer free vs Pro labelling",
    description:
      "Every Pro-only feature now carries a small Pro tag, and the pricing page spells out exactly what the free plan includes.",
    highlights: [
      "Pro tags on premium themes, boards, task views and calendar uploads",
      "Side-by-side free vs Pro comparison on the pricing page",
    ],
  },
  {
    id: "2026-08-onboarding",
    version: "3.2",
    date: "2026-08-19",
    category: "update",
    title: "A friendlier first-steps checklist",
    description:
      "The getting-started card can be dismissed at any time, snoozed for a few hours, and disappears for good once you start using StudyHub properly.",
  },
  {
    id: "2026-08-tags",
    version: "3.1",
    date: "2026-08-11",
    category: "fix",
    title: "Fixed wrong labels on posts",
    description:
      "Posts no longer inherit surprising level or country labels, authors can edit their own tags, and moderators can correct anything that slipped through.",
  },
  {
    id: "2026-07-mobile",
    version: "3.0",
    date: "2026-07-30",
    category: "fix",
    title: "Mobile and app screen fixes",
    description:
      "Buttons no longer hide behind the phone's bottom bar, Nova fits the screen properly, and nothing gets cut off in the installed app.",
  },
  {
    id: "2026-07-calendar-ai",
    version: "2.9",
    date: "2026-07-15",
    category: "feature",
    title: "Import your timetable with AI",
    description:
      "Upload a timetable or exam schedule and StudyHub pulls out the dates for you. You get to review and fix everything before anything lands in your calendar.",
    highlights: [
      "Upload a photo or file of your schedule",
      "Review and edit every detected event before importing",
    ],
  },
  {
    id: "2026-06-study-guides",
    version: "2.8",
    date: "2026-06-24",
    category: "feature",
    title: "Curriculum study guides",
    description:
      "New guides tailored to major curricula, with subject breakdowns and revision tips you can jump into straight from search.",
  },
  {
    id: "2026-06-speed",
    version: "2.7",
    date: "2026-06-10",
    category: "performance",
    title: "Faster pages",
    description:
      "The homepage paints much sooner, long lists scroll more smoothly, and heavier sections only load once you scroll to them.",
  },
  {
    id: "2026-05-nova",
    version: "2.6",
    date: "2026-05-21",
    category: "feature",
    title: "Nova, your study assistant",
    description:
      "Ask Nova to explain a topic, summarise notes or quiz you — from its own page or the floating button on any screen.",
  },
  {
    id: "2026-05-study-mode",
    version: "2.5",
    date: "2026-05-06",
    category: "feature",
    title: "Study Mode toolkit",
    description:
      "Flashcards, quizzes, mind maps and a Pomodoro timer, all in one focused workspace.",
  },
];

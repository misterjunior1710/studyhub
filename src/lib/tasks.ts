import { RRule, type Frequency } from "rrule";
import { addDays, formatDistanceToNowStrict, isPast, isToday, isTomorrow, format } from "date-fns";

export type TaskCategory =
  | "assignment" | "exam" | "study" | "personal" | "transition" | "habit" | "other";

export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TaskStatus = "pending" | "completed" | "archived";

export interface Task {
  id: string;
  user_id: string;
  title: string;
  notes: string | null;
  category: TaskCategory;
  priority: TaskPriority;
  status: TaskStatus;
  tags: string[];
  due_at: string | null;
  reminder_at: string | null;
  last_reminded_at: string | null;
  rrule: string | null;
  order_index: number;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export const CATEGORY_META: Record<TaskCategory, { label: string; emoji: string; color: string }> = {
  assignment:  { label: "Assignment",        emoji: "📝", color: "hsl(217 91% 60%)" },
  exam:        { label: "Exam / Test",       emoji: "📊", color: "hsl(0 84% 60%)" },
  study:       { label: "Study Session",     emoji: "📚", color: "hsl(243 75% 58%)" },
  personal:    { label: "Personal Goal",     emoji: "🎯", color: "hsl(160 64% 45%)" },
  transition:  { label: "Transition / Life", emoji: "🌱", color: "hsl(35 92% 55%)" },
  habit:       { label: "Habit / Routine",   emoji: "🔁", color: "hsl(280 70% 60%)" },
  other:       { label: "Other",             emoji: "✨", color: "hsl(220 9% 60%)" },
};

export const PRIORITY_META: Record<TaskPriority, { label: string; weight: number; className: string }> = {
  low:    { label: "Low",    weight: 1, className: "bg-muted text-muted-foreground" },
  medium: { label: "Medium", weight: 2, className: "bg-blue-500/15 text-blue-500" },
  high:   { label: "High",   weight: 3, className: "bg-orange-500/15 text-orange-500" },
  urgent: { label: "Urgent", weight: 4, className: "bg-red-500/15 text-red-500" },
};

/* -------- Recurrence helpers -------- */

export type RecurrenceFreq = "DAILY" | "WEEKLY" | "MONTHLY" | "NONE";
export interface RecurrenceConfig {
  freq: RecurrenceFreq;
  interval: number;
  byweekday?: number[]; // 0=Mon..6=Sun (rrule convention)
}

export const buildRRule = (cfg: RecurrenceConfig, dtstart: Date): string | null => {
  if (cfg.freq === "NONE") return null;
  const freqMap: Record<Exclude<RecurrenceFreq, "NONE">, Frequency> = {
    DAILY: RRule.DAILY, WEEKLY: RRule.WEEKLY, MONTHLY: RRule.MONTHLY,
  };
  const rule = new RRule({
    freq: freqMap[cfg.freq],
    interval: Math.max(1, cfg.interval),
    dtstart,
    byweekday: cfg.byweekday && cfg.byweekday.length > 0 ? cfg.byweekday : undefined,
  });
  return rule.toString();
};

export const parseRRule = (rruleStr: string | null): RecurrenceConfig => {
  if (!rruleStr) return { freq: "NONE", interval: 1 };
  try {
    const rule = RRule.fromString(rruleStr);
    const freq = rule.options.freq;
    const freqStr: RecurrenceFreq =
      freq === RRule.DAILY ? "DAILY"
      : freq === RRule.WEEKLY ? "WEEKLY"
      : freq === RRule.MONTHLY ? "MONTHLY"
      : "NONE";
    return {
      freq: freqStr,
      interval: rule.options.interval ?? 1,
      byweekday: (rule.options.byweekday as number[] | null) ?? undefined,
    };
  } catch {
    return { freq: "NONE", interval: 1 };
  }
};

export const describeRecurrence = (cfg: RecurrenceConfig): string => {
  if (cfg.freq === "NONE") return "Does not repeat";
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const every = cfg.interval > 1 ? `Every ${cfg.interval} ` : "Every ";
  if (cfg.freq === "DAILY")   return `${every}${cfg.interval > 1 ? "days" : "day"}`;
  if (cfg.freq === "MONTHLY") return `${every}${cfg.interval > 1 ? "months" : "month"}`;
  if (cfg.freq === "WEEKLY") {
    if (cfg.byweekday && cfg.byweekday.length > 0) {
      return `${every}week on ${cfg.byweekday.map((d) => dayNames[d]).join(", ")}`;
    }
    return `${every}${cfg.interval > 1 ? "weeks" : "week"}`;
  }
  return "Repeats";
};

/** Compute the next occurrence after a base date, given the task's RRULE. */
export const nextOccurrence = (rruleStr: string | null, after: Date): Date | null => {
  if (!rruleStr) return null;
  try {
    const rule = RRule.fromString(rruleStr);
    return rule.after(after, true);
  } catch {
    return null;
  }
};

/* -------- Display helpers -------- */

export const formatDue = (iso: string | null): { label: string; tone: "overdue" | "today" | "soon" | "future" | "none" } => {
  if (!iso) return { label: "No due date", tone: "none" };
  const d = new Date(iso);
  if (isPast(d) && !isToday(d))   return { label: `Overdue · ${formatDistanceToNowStrict(d, { addSuffix: true })}`, tone: "overdue" };
  if (isToday(d))                 return { label: `Today · ${format(d, "p")}`, tone: "today" };
  if (isTomorrow(d))              return { label: `Tomorrow · ${format(d, "p")}`, tone: "soon" };
  if (d < addDays(new Date(), 7)) return { label: format(d, "EEE p"), tone: "soon" };
  return { label: format(d, "MMM d, p"), tone: "future" };
};

export const sortTasks = (tasks: Task[]): Task[] =>
  [...tasks].sort((a, b) => {
    // Pending first, then completed, archived last
    const statusOrder = { pending: 0, completed: 1, archived: 2 };
    if (statusOrder[a.status] !== statusOrder[b.status]) return statusOrder[a.status] - statusOrder[b.status];
    // Overdue first, then by due date asc, then by priority desc
    const aDue = a.due_at ? new Date(a.due_at).getTime() : Infinity;
    const bDue = b.due_at ? new Date(b.due_at).getTime() : Infinity;
    if (aDue !== bDue) return aDue - bDue;
    return PRIORITY_META[b.priority].weight - PRIORITY_META[a.priority].weight;
  });

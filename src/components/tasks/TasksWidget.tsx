import { Link } from "react-router-dom";
import { ListChecks, ArrowRight, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useTasks } from "@/hooks/useTasks";
import { formatDue } from "@/lib/tasks";
import { isPast, isToday } from "date-fns";

/**
 * Compact widget for the home page: upcoming + overdue + completion %.
 * Hidden gracefully when the user has zero tasks ever.
 */
export const TasksWidget = () => {
  const { tasks, loading } = useTasks();

  if (loading) return null;
  if (tasks.length === 0) {
    return (
      <Card className="p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-primary/10 p-2.5">
            <ListChecks className="h-5 w-5 text-primary" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">Stay on top of everything</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Track assignments, exams, study sessions and habits in one place.
            </p>
            <Button asChild size="sm" className="mt-3">
              <Link to="/tasks">Plan your week <ArrowRight className="h-4 w-4 ml-1" /></Link>
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  const pending = tasks.filter((t) => t.status === "pending");
  const overdue = pending.filter((t) => t.due_at && isPast(new Date(t.due_at)) && !isToday(new Date(t.due_at)));
  const dueToday = pending.filter((t) => t.due_at && isToday(new Date(t.due_at)));
  const upcoming = pending
    .filter((t) => !overdue.includes(t) && !dueToday.includes(t))
    .slice(0, 3);
  const completed = tasks.filter((t) => t.status === "completed").length;
  const completionPct = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListChecks className="h-5 w-5 text-primary" aria-hidden="true" />
          <h3 className="font-semibold">Your tasks</h3>
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link to="/tasks">View all <ArrowRight className="h-4 w-4 ml-1" /></Link>
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <Stat icon={<AlertCircle className="h-4 w-4 text-red-500" />} value={overdue.length} label="Overdue" />
        <Stat icon={<Clock className="h-4 w-4 text-orange-500" />} value={dueToday.length} label="Today" />
        <Stat icon={<CheckCircle2 className="h-4 w-4 text-green-500" />} value={completed} label="Done" />
      </div>

      <div>
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-muted-foreground">Completion</span>
          <span className="font-medium">{completionPct}%</span>
        </div>
        <Progress value={completionPct} className="h-2" />
      </div>

      {(overdue[0] || dueToday[0] || upcoming[0]) && (
        <div className="space-y-1.5 pt-1">
          <p className="text-xs font-medium text-muted-foreground">Up next</p>
          {[...overdue.slice(0, 1), ...dueToday.slice(0, 2), ...upcoming].slice(0, 3).map((t) => {
            const due = formatDue(t.due_at);
            return (
              <Link
                key={t.id}
                to="/tasks"
                className="flex items-center justify-between gap-2 rounded-md p-2 hover:bg-muted text-sm"
              >
                <span className="truncate">{t.title}</span>
                <span className={`text-xs shrink-0 ${due.tone === "overdue" ? "text-red-500" : due.tone === "today" ? "text-orange-500" : "text-muted-foreground"}`}>
                  {due.label}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </Card>
  );
};

const Stat = ({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) => (
  <div className="rounded-lg bg-muted/40 p-2.5">
    <div className="flex justify-center mb-0.5" aria-hidden="true">{icon}</div>
    <div className="text-lg font-bold leading-none">{value}</div>
    <div className="text-xs text-muted-foreground mt-1">{label}</div>
  </div>
);

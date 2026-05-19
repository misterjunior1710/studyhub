import { useState } from "react";
import { Sparkles, Loader2, ListChecks, Calendar as CalIcon } from "lucide-react";
import { callEdgeFunction } from "@/lib/callEdgeFunction";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { Task } from "@/lib/tasks";

interface ScheduleResult {
  blocks?: { day: string; start_time: string; duration_minutes: number; task_title: string; why: string }[];
  warnings?: string[];
  summary?: string;
}
interface PrioritizeResult {
  order?: { id: string; reason: string }[];
  insight?: string;
}

interface Props {
  tasks: Task[];
}

export const AiAssistantSheet = ({ tasks }: Props) => {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"schedule" | "prioritize" | null>(null);
  const [loading, setLoading] = useState(false);
  const [schedule, setSchedule] = useState<ScheduleResult | null>(null);
  const [prio, setPrio] = useState<PrioritizeResult | null>(null);

  const pending = tasks.filter((t) => t.status === "pending");
  const taskMap = new Map(tasks.map((t) => [t.id, t]));

  const run = async (action: "schedule" | "prioritize") => {
    if (pending.length === 0) {
      toast.info("Add some tasks first so the AI has something to work with.");
      return;
    }
    setMode(action);
    setLoading(true);
    setSchedule(null);
    setPrio(null);
    try {
      const payload = {
        action,
        tasks: pending.slice(0, 30).map((t) => ({
          id: t.id, title: t.title, priority: t.priority,
          category: t.category, due_at: t.due_at,
        })),
      };
      const data = await callEdgeFunction<ScheduleResult | PrioritizeResult>("ai-task-assist", payload);
      if (action === "schedule") setSchedule(data as ScheduleResult);
      else setPrio(data as PrioritizeResult);
    } catch (e: any) {
      console.error("[ai-task-assist]", e);
      const { handlePremiumError } = await import("@/lib/proErrors");
      const handled = await handlePremiumError(e, { feature: "AI Task Assistant" });
      if (!handled) {
        const detail = e?.context?.error || e?.context?.message || e?.message || "AI assistant failed";
        toast.error("AI assistant unavailable", { description: detail });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Sparkles className="h-4 w-4 text-primary" /> AI Assistant
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" /> Productivity AI
          </SheetTitle>
          <SheetDescription>
            Get a suggested schedule or have your tasks reprioritized by urgency × impact.
          </SheetDescription>
        </SheetHeader>

        <div className="grid grid-cols-2 gap-2 my-4">
          <Button onClick={() => run("schedule")} disabled={loading} variant="secondary" className="gap-1.5">
            <CalIcon className="h-4 w-4" /> Suggest schedule
          </Button>
          <Button onClick={() => run("prioritize")} disabled={loading} variant="secondary" className="gap-1.5">
            <ListChecks className="h-4 w-4" /> Prioritize
          </Button>
        </div>

        {loading && (
          <div className="space-y-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        )}

        {!loading && mode === "schedule" && schedule && (
          <div className="space-y-3">
            {schedule.summary && <p className="text-sm text-muted-foreground">{schedule.summary}</p>}
            {schedule.warnings?.map((w, i) => (
              <div key={i} className="rounded-md border border-orange-500/40 bg-orange-500/10 p-2 text-sm">
                ⚠ {w}
              </div>
            ))}
            {schedule.blocks?.map((b, i) => (
              <Card key={i} className="p-3">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <Badge variant="outline">{b.day} · {b.start_time}</Badge>
                  <span className="text-xs text-muted-foreground">{b.duration_minutes} min</span>
                </div>
                <div className="font-medium text-sm">{b.task_title}</div>
                <div className="text-xs text-muted-foreground mt-1">{b.why}</div>
              </Card>
            ))}
            {(!schedule.blocks || schedule.blocks.length === 0) && (
              <p className="text-sm text-muted-foreground">No suggestions returned.</p>
            )}
          </div>
        )}

        {!loading && mode === "prioritize" && prio && (
          <div className="space-y-3">
            {prio.insight && <p className="text-sm text-muted-foreground">{prio.insight}</p>}
            {prio.order?.map((o, i) => {
              const t = taskMap.get(o.id);
              return (
                <Card key={o.id + i} className="p-3">
                  <div className="flex items-start gap-2">
                    <span className="text-xs font-bold text-primary mt-0.5">#{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{t?.title ?? "(unknown task)"}</div>
                      <div className="text-xs text-muted-foreground mt-1">{o.reason}</div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {!loading && !schedule && !prio && (
          <p className="text-sm text-muted-foreground text-center py-8">
            Pick an action above to get started.
          </p>
        )}
      </SheetContent>
    </Sheet>
  );
};

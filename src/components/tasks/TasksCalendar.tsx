import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths,
  format, isSameDay, isSameMonth, isToday,
} from "date-fns";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CATEGORY_META, type Task } from "@/lib/tasks";
import { cn } from "@/lib/utils";

interface Props {
  tasks: Task[];
  onEdit: (t: Task) => void;
}

export const TasksCalendar = ({ tasks, onEdit }: Props) => {
  const [cursor, setCursor] = useState(new Date());

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 });
    const out: Date[] = [];
    for (let d = start; d <= end; d = addDays(d, 1)) out.push(d);
    return out;
  }, [cursor]);

  const tasksByDay = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const t of tasks) {
      if (!t.due_at || t.status === "archived") continue;
      const key = format(new Date(t.due_at), "yyyy-MM-dd");
      const arr = map.get(key) ?? [];
      arr.push(t);
      map.set(key, arr);
    }
    return map;
  }, [tasks]);

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <Card className="p-3">
      <div className="flex items-center justify-between mb-3">
        <Button variant="ghost" size="icon" onClick={() => setCursor(addMonths(cursor, -1))} aria-label="Previous month">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="font-semibold">{format(cursor, "MMMM yyyy")}</h3>
        <Button variant="ghost" size="icon" onClick={() => setCursor(addMonths(cursor, 1))} aria-label="Next month">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-xs text-muted-foreground mb-1">
        {weekDays.map((d) => <div key={d} className="text-center font-medium py-1">{d}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((d) => {
          const key = format(d, "yyyy-MM-dd");
          const dayTasks = tasksByDay.get(key) ?? [];
          const muted = !isSameMonth(d, cursor);
          const today = isToday(d);
          return (
            <div
              key={key}
              className={cn(
                "min-h-[88px] rounded border p-1 text-xs flex flex-col gap-0.5",
                muted ? "bg-muted/20 text-muted-foreground" : "bg-card",
                today && "border-primary ring-1 ring-primary/30"
              )}
            >
              <div className="flex justify-between items-center">
                <span className={cn("font-medium", today && "text-primary")}>{format(d, "d")}</span>
                {dayTasks.length > 0 && (
                  <Badge variant="secondary" className="h-4 text-[10px] px-1">{dayTasks.length}</Badge>
                )}
              </div>
              <div className="space-y-0.5 overflow-hidden">
                {dayTasks.slice(0, 3).map((t) => {
                  const cat = CATEGORY_META[t.category];
                  return (
                    <button
                      key={t.id}
                      onClick={() => onEdit(t)}
                      className={cn(
                        "w-full text-left truncate rounded px-1 py-0.5 hover:bg-primary/10 transition-colors",
                        t.status === "completed" && "line-through opacity-60"
                      )}
                      title={t.title}
                    >
                      <span aria-hidden="true">{cat.emoji}</span> {t.title}
                    </button>
                  );
                })}
                {dayTasks.length > 3 && (
                  <span className="text-[10px] text-muted-foreground px-1">+{dayTasks.length - 3} more</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

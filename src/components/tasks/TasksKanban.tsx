import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CATEGORY_META, formatDue, type Task, type TaskStatus } from "@/lib/tasks";
import { isPast, isToday } from "date-fns";
import { cn } from "@/lib/utils";

interface Props {
  tasks: Task[];
  onEdit: (t: Task) => void;
  onUpdateStatus: (id: string, status: TaskStatus) => void;
}

type Column = { key: "todo" | "today" | "in_progress" | "done"; label: string; tone: string };

const COLUMNS: Column[] = [
  { key: "todo",        label: "Backlog",     tone: "border-border" },
  { key: "today",       label: "Due today",   tone: "border-orange-500/40" },
  { key: "in_progress", label: "Overdue",     tone: "border-red-500/40" },
  { key: "done",        label: "Completed",   tone: "border-green-500/40" },
];

export const TasksKanban = ({ tasks, onEdit, onUpdateStatus }: Props) => {
  const grouped = useMemo(() => {
    const map: Record<Column["key"], Task[]> = { todo: [], today: [], in_progress: [], done: [] };
    for (const t of tasks) {
      if (t.status === "completed") { map.done.push(t); continue; }
      if (t.status === "archived") continue;
      if (!t.due_at) { map.todo.push(t); continue; }
      const d = new Date(t.due_at);
      if (isPast(d) && !isToday(d)) map.in_progress.push(t);
      else if (isToday(d)) map.today.push(t);
      else map.todo.push(t);
    }
    return map;
  }, [tasks]);

  const onDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/task-id", id);
    e.dataTransfer.effectAllowed = "move";
  };
  const onDrop = (e: React.DragEvent, col: Column["key"]) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/task-id");
    if (!id) return;
    if (col === "done") onUpdateStatus(id, "completed");
    else onUpdateStatus(id, "pending");
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {COLUMNS.map((col) => (
        <div
          key={col.key}
          className={cn("rounded-lg border-2 border-dashed p-2 min-h-[200px] bg-muted/20", col.tone)}
          onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; }}
          onDrop={(e) => onDrop(e, col.key)}
          aria-label={`${col.label} column`}
        >
          <div className="flex items-center justify-between mb-2 px-1">
            <h3 className="text-sm font-semibold">{col.label}</h3>
            <Badge variant="secondary" className="text-xs">{grouped[col.key].length}</Badge>
          </div>
          <div className="space-y-2">
            {grouped[col.key].map((t) => {
              const cat = CATEGORY_META[t.category];
              const due = formatDue(t.due_at);
              return (
                <Card
                  key={t.id}
                  draggable
                  onDragStart={(e) => onDragStart(e, t.id)}
                  onClick={() => onEdit(t)}
                  className="p-2.5 cursor-grab active:cursor-grabbing hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <span aria-hidden="true">{cat.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className={cn("text-sm font-medium leading-snug", t.status === "completed" && "line-through opacity-60")}>
                        {t.title}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">{due.label}</div>
                    </div>
                  </div>
                </Card>
              );
            })}
            {grouped[col.key].length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-6">Drop tasks here</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

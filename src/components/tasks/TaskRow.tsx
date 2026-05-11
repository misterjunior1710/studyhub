import { Check, MoreVertical, Pencil, Archive, Trash2, Repeat, Bell, Undo2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { CATEGORY_META, PRIORITY_META, formatDue, type Task } from "@/lib/tasks";

interface Props {
  task: Task;
  onComplete: (task: Task) => void;
  onReopen: (id: string) => void;
  onEdit: (task: Task) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
}

const TONE_CLASS: Record<string, string> = {
  overdue: "text-red-500 font-medium",
  today:   "text-orange-500 font-medium",
  soon:    "text-blue-500",
  future:  "text-muted-foreground",
  none:    "text-muted-foreground",
};

export const TaskRow = ({ task, onComplete, onReopen, onEdit, onArchive, onDelete }: Props) => {
  const cat = CATEGORY_META[task.category];
  const pri = PRIORITY_META[task.priority];
  const due = formatDue(task.due_at);
  const isDone = task.status === "completed";

  return (
    <div className={cn(
      "group flex items-start gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:border-primary/40",
      isDone && "opacity-60"
    )}>
      <Checkbox
        checked={isDone}
        onCheckedChange={() => isDone ? onReopen(task.id) : onComplete(task)}
        className="mt-1"
        aria-label={isDone ? "Reopen task" : "Complete task"}
      />
      <button
        type="button"
        onClick={() => onEdit(task)}
        className="flex-1 min-w-0 text-left"
      >
        <div className="flex items-start gap-2 flex-wrap">
          <span className={cn("font-medium leading-snug", isDone && "line-through")}>
            <span aria-hidden="true">{cat.emoji}</span> {task.title}
          </span>
          {task.priority !== "low" && (
            <Badge variant="outline" className={cn("text-xs", pri.className)}>{pri.label}</Badge>
          )}
          {task.rrule && (
            <Badge variant="outline" className="text-xs gap-1">
              <Repeat className="h-3 w-3" aria-hidden="true" /> Recurring
            </Badge>
          )}
          {task.reminder_at && (
            <Badge variant="outline" className="text-xs gap-1">
              <Bell className="h-3 w-3" aria-hidden="true" /> Reminder
            </Badge>
          )}
        </div>
        <div className="mt-1 flex items-center gap-2 text-xs flex-wrap">
          <span className="text-muted-foreground">{cat.label}</span>
          <span className="text-muted-foreground">·</span>
          <span className={TONE_CLASS[due.tone]}>{due.label}</span>
          {task.tags.slice(0, 3).map((t) => (
            <span key={t} className="text-muted-foreground">#{t}</span>
          ))}
        </div>
        {task.notes && (
          <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">{task.notes}</p>
        )}
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" aria-label="Task actions">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {isDone ? (
            <DropdownMenuItem onClick={() => onReopen(task.id)}>
              <Undo2 className="h-4 w-4 mr-2" /> Reopen
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => onComplete(task)}>
              <Check className="h-4 w-4 mr-2" /> Mark complete
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => onEdit(task)}>
            <Pencil className="h-4 w-4 mr-2" /> Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onArchive(task.id)}>
            <Archive className="h-4 w-4 mr-2" /> Archive
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onDelete(task.id)} className="text-destructive">
            <Trash2 className="h-4 w-4 mr-2" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

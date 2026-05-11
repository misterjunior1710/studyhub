import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, Clock, BookOpen, ListChecks, Lightbulb } from "lucide-react";
import { renderAssistantMarkdown } from "@/lib/assistantMarkdown";
import type { TransitionLesson } from "@/hooks/useTransitions";

interface Props {
  lesson: TransitionLesson;
  done: boolean;
  onToggle: () => void;
}

const TYPE_META: Record<string, { label: string; Icon: typeof BookOpen }> = {
  reading: { label: "Read", Icon: BookOpen },
  checklist: { label: "Checklist", Icon: ListChecks },
  exercise: { label: "Exercise", Icon: Lightbulb },
};

const LessonItem = ({ lesson, done, onToggle }: Props) => {
  const [open, setOpen] = useState(false);
  const meta = TYPE_META[lesson.lesson_type] ?? TYPE_META.reading;
  const Icon = meta.Icon;

  return (
    <Card className={`glass-card hover-lift overflow-hidden transition-all ${done ? "opacity-80" : ""}`}>
      <div className="flex items-start gap-3 p-4">
        <Checkbox
          checked={done}
          onCheckedChange={onToggle}
          aria-label={done ? `Mark "${lesson.title}" as not done` : `Mark "${lesson.title}" as done`}
          className="mt-0.5"
        />
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex-1 text-left min-w-0"
          aria-expanded={open}
        >
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className={`font-medium ${done ? "line-through text-muted-foreground" : ""}`}>{lesson.title}</h4>
          </div>
          <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1"><Icon className="h-3 w-3" aria-hidden="true" />{meta.label}</span>
            <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" aria-hidden="true" />{lesson.estimated_minutes} min</span>
          </div>
        </button>
        <Button
          variant="ghost"
          size="icon"
          aria-label={open ? "Collapse lesson" : "Expand lesson"}
          onClick={() => setOpen((o) => !o)}
          className="h-8 w-8"
        >
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </Button>
      </div>
      {open && (
        <div
          className="px-4 pb-4 text-sm text-foreground/90 prose prose-sm dark:prose-invert max-w-none animate-fade-in"
          dangerouslySetInnerHTML={{ __html: renderAssistantMarkdown(lesson.content) }}
        />
      )}
    </Card>
  );
};

export default LessonItem;

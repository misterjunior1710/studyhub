import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon, X, Sparkles, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { callEdgeFunction } from "@/lib/callEdgeFunction";
import { toast } from "sonner";
import {
  CATEGORY_META, PRIORITY_META,
  type Task, type TaskCategory, type TaskPriority,
  buildRRule, parseRRule, describeRecurrence, type RecurrenceFreq,
} from "@/lib/tasks";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: Task | null;
  onSave: (input: Partial<Task> & { title: string }) => Promise<void> | void;
}

const WEEKDAYS = [
  { val: 0, label: "M" }, { val: 1, label: "T" }, { val: 2, label: "W" },
  { val: 3, label: "T" }, { val: 4, label: "F" }, { val: 5, label: "S" }, { val: 6, label: "S" },
];

export const TaskEditorDialog = ({ open, onOpenChange, initial, onSave }: Props) => {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [category, setCategory] = useState<TaskCategory>("personal");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [dueTime, setDueTime] = useState("");
  const [reminderOffset, setReminderOffset] = useState<string>("none"); // minutes before
  const [recFreq, setRecFreq] = useState<RecurrenceFreq>("NONE");
  const [recInterval, setRecInterval] = useState(1);
  const [recDays, setRecDays] = useState<number[]>([]);
  const [tagsInput, setTagsInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [breakingDown, setBreakingDown] = useState(false);

  const handleAiBreakdown = async () => {
    if (!title.trim()) {
      toast.info("Add a title first so the AI knows what to break down.");
      return;
    }
    setBreakingDown(true);
    try {
      const data = await callEdgeFunction<{ subtasks?: { title: string; estimated_minutes: number }[]; tip?: string }>("ai-task-assist", {
        action: "breakdown",
        title: title.trim(),
        notes: notes.trim(),
        due_at: dueDate ? dueDate.toISOString() : null,
      });
      const subs = (data?.subtasks ?? []) as { title: string; estimated_minutes: number }[];
      if (subs.length === 0) {
        toast.info("No subtasks suggested. Try refining the title.");
        return;
      }
      const block = [
        notes.trim(),
        notes.trim() ? "" : null,
        "── AI breakdown ──",
        ...subs.map((s) => `• ${s.title}  (${s.estimated_minutes} min)`),
        data?.tip ? `\n💡 ${data.tip}` : null,
      ].filter((x) => x !== null).join("\n");
      setNotes(block);
      toast.success(`Added ${subs.length} subtasks to notes`);
    } catch (e: any) {
      console.error("[ai-breakdown]", e);
      const detail = e?.context?.error || e?.context?.message || e?.message || "AI breakdown failed";
      toast.error("AI breakdown unavailable", { description: detail });
    } finally {
      setBreakingDown(false);
    }
  };

  useEffect(() => {
    if (open) {
      setTitle(initial?.title ?? "");
      setNotes(initial?.notes ?? "");
      setCategory(initial?.category ?? "personal");
      setPriority(initial?.priority ?? "medium");
      setTags(initial?.tags ?? []);
      setTagsInput("");
      const due = initial?.due_at ? new Date(initial.due_at) : undefined;
      setDueDate(due);
      setDueTime(due ? format(due, "HH:mm") : "");
      // Reminder offset
      if (initial?.reminder_at && initial?.due_at) {
        const diffMin = Math.round((new Date(initial.due_at).getTime() - new Date(initial.reminder_at).getTime()) / 60000);
        setReminderOffset([10, 30, 60, 120, 1440].includes(diffMin) ? String(diffMin) : "none");
      } else {
        setReminderOffset("none");
      }
      const cfg = parseRRule(initial?.rrule ?? null);
      setRecFreq(cfg.freq);
      setRecInterval(cfg.interval);
      setRecDays(cfg.byweekday ?? []);
    }
  }, [open, initial]);

  const addTag = () => {
    const t = tagsInput.trim().toLowerCase().replace(/^#/, "");
    if (t && !tags.includes(t) && tags.length < 8) setTags([...tags, t]);
    setTagsInput("");
  };

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    let dueAt: string | null = null;
    let reminderAt: string | null = null;
    if (dueDate) {
      const [h, m] = (dueTime || "23:59").split(":").map(Number);
      const d = new Date(dueDate); d.setHours(h, m, 0, 0);
      dueAt = d.toISOString();
      if (reminderOffset !== "none") {
        reminderAt = new Date(d.getTime() - Number(reminderOffset) * 60000).toISOString();
      }
    }
    const rrule = dueDate ? buildRRule({ freq: recFreq, interval: recInterval, byweekday: recDays }, dueDate) : null;

    await onSave({
      title: title.trim(),
      notes: notes.trim() || null,
      category, priority, tags,
      due_at: dueAt,
      reminder_at: reminderAt,
      rrule,
    });
    setSaving(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit task" : "New task"}</DialogTitle>
          <DialogDescription>Plan it, schedule it, ship it.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="task-title">Title</Label>
            <Input id="task-title" autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What do you need to get done?" maxLength={200} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as TaskCategory)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORY_META).map(([key, meta]) => (
                    <SelectItem key={key} value={key}>{meta.emoji} {meta.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(PRIORITY_META).map(([key, meta]) => (
                    <SelectItem key={key} value={key}>{meta.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Due date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start font-normal", !dueDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                    {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="due-time">Time</Label>
              <Input id="due-time" type="time" value={dueTime} onChange={(e) => setDueTime(e.target.value)} disabled={!dueDate} />
            </div>
          </div>

          {dueDate && (
            <div className="space-y-2">
              <Label>Remind me</Label>
              <Select value={reminderOffset} onValueChange={setReminderOffset}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No reminder</SelectItem>
                  <SelectItem value="10">10 minutes before</SelectItem>
                  <SelectItem value="30">30 minutes before</SelectItem>
                  <SelectItem value="60">1 hour before</SelectItem>
                  <SelectItem value="120">2 hours before</SelectItem>
                  <SelectItem value="1440">1 day before</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {dueDate && (
            <div className="space-y-2 rounded-lg border border-border p-3">
              <Label>Repeat</Label>
              <div className="grid grid-cols-2 gap-2">
                <Select value={recFreq} onValueChange={(v) => setRecFreq(v as RecurrenceFreq)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">Does not repeat</SelectItem>
                    <SelectItem value="DAILY">Daily</SelectItem>
                    <SelectItem value="WEEKLY">Weekly</SelectItem>
                    <SelectItem value="MONTHLY">Monthly</SelectItem>
                  </SelectContent>
                </Select>
                {recFreq !== "NONE" && (
                  <div className="flex items-center gap-2">
                    <Label htmlFor="interval" className="text-xs whitespace-nowrap">Every</Label>
                    <Input id="interval" type="number" min={1} max={99} value={recInterval} onChange={(e) => setRecInterval(Math.max(1, Number(e.target.value) || 1))} className="w-20" />
                    <span className="text-sm text-muted-foreground">
                      {recFreq === "DAILY" ? "day(s)" : recFreq === "WEEKLY" ? "week(s)" : "month(s)"}
                    </span>
                  </div>
                )}
              </div>
              {recFreq === "WEEKLY" && (
                <div className="flex gap-1.5">
                  {WEEKDAYS.map((d) => (
                    <Button
                      key={d.val}
                      type="button"
                      variant={recDays.includes(d.val) ? "default" : "outline"}
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setRecDays(recDays.includes(d.val) ? recDays.filter((x) => x !== d.val) : [...recDays, d.val])}
                      aria-label={`Toggle ${d.label}`}
                              aria-pressed={recDays.includes(d.val)}
                    >{d.label}</Button>
                  ))}
                </div>
              )}
              {recFreq !== "NONE" && (
                <p className="text-xs text-muted-foreground">{describeRecurrence({ freq: recFreq, interval: recInterval, byweekday: recDays })}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                placeholder="Add a tag and press Enter" />
              <Button type="button" variant="outline" onClick={addTag}>Add</Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((t) => (
                  <Badge key={t} variant="secondary" className="gap-1">
                    #{t}
                    <button onClick={() => setTags(tags.filter((x) => x !== t))} aria-label={`Remove tag ${t}`} className="hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="task-notes">Notes</Label>
              <Button type="button" variant="ghost" size="sm" onClick={handleAiBreakdown} disabled={breakingDown || !title.trim()} className="gap-1.5 h-7 text-xs">
                {breakingDown ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3 text-primary" />}
                AI breakdown
              </Button>
            </div>
            <Textarea id="task-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} placeholder="Optional details, links, resources…" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!title.trim() || saving}>
            {saving ? "Saving…" : initial ? "Save changes" : "Create task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

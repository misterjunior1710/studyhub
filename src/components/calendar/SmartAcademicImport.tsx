import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Upload, FileText, Loader2, Sparkles, Trash2, Plus, Check, X,
  Calendar as CalendarIcon, BookOpen, ClipboardList, GraduationCap, History,
  AlertTriangle, Crown,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useSubscription } from "@/hooks/useSubscription";

type EventType = "class" | "exam" | "assignment" | "event";

interface ExtractedEvent {
  title: string;
  type: EventType;
  date: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  description?: string;
}

interface ImportRow {
  id: string;
  file_name: string;
  status: string;
  event_count: number;
  created_at: string;
  error: string | null;
}

const ACCEPTED_PRO = ".pdf,.png,.jpg,.jpeg,.webp";
const ACCEPTED_FREE = ".pdf";
const MAX_BYTES = 15 * 1024 * 1024;
const IMAGE_RE = /\.(png|jpe?g|webp)$/i;
const PDF_RE = /\.pdf$/i;

type EventIssue = { level: "error" | "warning"; message: string };

const validateEvent = (e: ExtractedEvent): EventIssue[] => {
  const issues: EventIssue[] = [];
  if (!e.title?.trim()) issues.push({ level: "error", message: "Title is required" });
  if (!e.date) issues.push({ level: "error", message: "Date is required" });
  else if (isNaN(new Date(e.date).getTime())) issues.push({ level: "error", message: "Invalid date" });
  if (e.start_time && !/^\d{2}:\d{2}$/.test(e.start_time)) issues.push({ level: "error", message: "Start time must be HH:MM" });
  if (e.end_time && !/^\d{2}:\d{2}$/.test(e.end_time)) issues.push({ level: "error", message: "End time must be HH:MM" });
  if (e.start_time && e.end_time && e.end_time <= e.start_time) {
    issues.push({ level: "error", message: "End time must be after start" });
  }
  if (e.date && !isNaN(new Date(e.date).getTime())) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const d = new Date(e.date);
    if (d < today) issues.push({ level: "warning", message: "Date is in the past" });
  }
  if ((e.type === "class" || e.type === "event") && !e.start_time) {
    issues.push({ level: "warning", message: "No start time set — will default to 09:00" });
  }
  return issues;
};

const TYPE_META: Record<EventType, { label: string; icon: any; color: string }> = {
  class:      { label: "Class",      icon: BookOpen,       color: "bg-blue-500/15 text-blue-500" },
  exam:       { label: "Exam",       icon: GraduationCap,  color: "bg-red-500/15 text-red-500" },
  assignment: { label: "Assignment", icon: ClipboardList,  color: "bg-orange-500/15 text-orange-500" },
  event:      { label: "Event",      icon: CalendarIcon,   color: "bg-violet-500/15 text-violet-500" },
};

interface Props {
  userId: string;
  onImported?: () => void;
}

const SmartAcademicImport = ({ userId, onImported }: Props) => {
  const { isPro } = useSubscription();
  const [dragging, setDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [phase, setPhase] = useState<"idle" | "uploading" | "processing">("idle");
  const [currentImportId, setCurrentImportId] = useState<string | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [events, setEvents] = useState<ExtractedEvent[]>([]);
  const [importing, setImporting] = useState(false);
  const [history, setHistory] = useState<ImportRow[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const accepted = isPro ? ACCEPTED_PRO : ACCEPTED_FREE;

  const loadHistory = useCallback(async () => {
    setLoadingHistory(true);
    const { data } = await supabase
      .from("academic_imports")
      .select("id,file_name,status,event_count,created_at,error")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);
    setHistory((data as ImportRow[]) ?? []);
    setLoadingHistory(false);
  }, [userId]);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  const handleFiles = async (files: FileList | File[]) => {
    const file = Array.from(files)[0];
    if (!file) return;
    if (file.size > MAX_BYTES) { toast.error("File exceeds 15MB"); return; }
    const isImage = IMAGE_RE.test(file.name);
    const isPdf = PDF_RE.test(file.name);
    if (!isImage && !isPdf) { toast.error("Only PDF, PNG, JPG, JPEG, WEBP are supported"); return; }
    if (isImage && !isPro) {
      toast.error("Image uploads are a Pro feature — upload a PDF or upgrade to Pro.");
      return;
    }

    setPhase("uploading");
    setUploadProgress(10);
    const path = `${userId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;

    const { error: upErr } = await supabase.storage
      .from("academic-imports").upload(path, file, { contentType: file.type, upsert: false });

    if (upErr) {
      setPhase("idle"); setUploadProgress(0);
      toast.error(upErr.message || "Upload failed");
      return;
    }
    setUploadProgress(60);

    const { data: imp, error: dbErr } = await supabase.from("academic_imports").insert({
      user_id: userId,
      file_name: file.name,
      file_path: path,
      mime_type: file.type,
      status: "uploaded",
    }).select().single();

    if (dbErr || !imp) {
      setPhase("idle"); setUploadProgress(0);
      toast.error("Could not save import record");
      return;
    }
    setUploadProgress(100);
    setCurrentImportId(imp.id);
    setPhase("processing");
    await loadHistory();

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const baseUrl = import.meta.env.VITE_SUPABASE_URL;
      const apiKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const res = await fetch(`${baseUrl}/functions/v1/extract-academic-events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
          apikey: apiKey,
        },
        body: JSON.stringify({ filePath: path, importId: imp.id }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error || "Extraction failed");

      const extracted: ExtractedEvent[] = (body.events ?? []).map((e: any) => ({
        title: e.title ?? "",
        type: (["class", "exam", "assignment", "event"].includes(e.type) ? e.type : "event") as EventType,
        date: e.date ?? "",
        start_time: e.start_time ?? "",
        end_time: e.end_time ?? "",
        location: e.location ?? "",
        description: e.description ?? "",
      }));
      setEvents(extracted);
      setReviewOpen(true);
      if (extracted.length === 0) toast.info("No events found in this file");
      else toast.success(`Found ${extracted.length} events — review before importing`);
    } catch (e: any) {
      toast.error(e.message || "Could not extract events");
    } finally {
      setPhase("idle"); setUploadProgress(0);
      loadHistory();
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
  };

  const updateEvent = (i: number, patch: Partial<ExtractedEvent>) =>
    setEvents((prev) => prev.map((ev, idx) => (idx === i ? { ...ev, ...patch } : ev)));
  const removeEvent = (i: number) => setEvents((prev) => prev.filter((_, idx) => idx !== i));
  const addEvent = () => setEvents((prev) => [...prev, {
    title: "", type: "class", date: format(new Date(), "yyyy-MM-dd"),
    start_time: "", end_time: "", location: "", description: "",
  }]);

  const validations = useMemo(() => events.map(validateEvent), [events]);
  const dupIndexes = useMemo(() => {
    const seen = new Map<string, number>();
    const dups = new Set<number>();
    events.forEach((e, i) => {
      const key = `${e.title.trim().toLowerCase()}|${e.date}|${e.start_time || ""}`;
      if (!e.title.trim() || !e.date) return;
      if (seen.has(key)) { dups.add(i); dups.add(seen.get(key)!); }
      else seen.set(key, i);
    });
    return dups;
  }, [events]);
  const errorCount = validations.filter((v) => v.some((i) => i.level === "error")).length;
  const warningCount = validations.filter((v) => v.some((i) => i.level === "warning")).length + dupIndexes.size;

  const counts = {
    class: events.filter((e) => e.type === "class").length,
    exam: events.filter((e) => e.type === "exam").length,
    assignment: events.filter((e) => e.type === "assignment").length,
    event: events.filter((e) => e.type === "event").length,
  };

  const confirmImport = async () => {
    const valid = events.filter((e) => e.title.trim() && e.date);
    if (valid.length === 0) { toast.error("Add at least one event with a title and date"); return; }
    setImporting(true);
    try {
      const studyEventRows: any[] = [];
      const taskRows: any[] = [];

      for (const e of valid) {
        const startISO = new Date(`${e.date}T${e.start_time || "09:00"}:00`).toISOString();
        const endISO = new Date(`${e.date}T${e.end_time || e.start_time || "10:00"}:00`).toISOString();

        if (e.type === "class" || e.type === "event" || e.type === "exam") {
          studyEventRows.push({
            title: e.title.trim(),
            description: e.description || null,
            start_time: startISO,
            end_time: endISO,
            location: e.location || null,
            is_virtual: false,
            created_by: userId,
            is_public: false,
          });
        }
        if (e.type === "exam" || e.type === "assignment") {
          const dueISO = new Date(`${e.date}T${e.end_time || e.start_time || "23:59"}:00`).toISOString();
          const reminderISO = new Date(new Date(dueISO).getTime() - 24 * 60 * 60 * 1000).toISOString();
          taskRows.push({
            user_id: userId,
            title: e.title.trim(),
            notes: [e.location && `Location: ${e.location}`, e.description].filter(Boolean).join("\n") || null,
            category: e.type === "exam" ? "exam" : "assignment",
            priority: e.type === "exam" ? "high" : "medium",
            status: "pending",
            tags: ["imported"],
            due_at: dueISO,
            reminder_at: reminderISO,
          });
        }
      }

      let imported = 0;
      if (studyEventRows.length) {
        const { error } = await supabase.from("study_events").insert(studyEventRows);
        if (error) throw error;
        imported += studyEventRows.length;
      }
      if (taskRows.length) {
        const { error } = await supabase.from("tasks").insert(taskRows);
        if (error) throw error;
        imported += taskRows.length;
      }

      if (currentImportId) {
        await supabase.from("academic_imports")
          .update({ status: "imported", event_count: valid.length })
          .eq("id", currentImportId);
      }

      toast.success(`Imported ${imported} items to your calendar and planner`);
      setReviewOpen(false);
      setEvents([]);
      setCurrentImportId(null);
      onImported?.();
      loadHistory();
    } catch (e: any) {
      toast.error(e.message || "Import failed");
    } finally {
      setImporting(false);
    }
  };

  const busy = phase !== "idle";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
          <CardTitle className="text-lg sm:text-xl">Smart Academic Import</CardTitle>
        </div>
        <CardDescription>
          Upload a timetable, exam schedule, or event poster — Nova reads it and builds your calendar and reminders.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => !busy && inputRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-label="Upload a schedule file"
          onKeyDown={(e) => { if ((e.key === "Enter" || e.key === " ") && !busy) inputRef.current?.click(); }}
          className={cn(
            "rounded-lg border-2 border-dashed p-6 sm:p-8 text-center cursor-pointer transition-colors",
            dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-accent/30",
            busy && "pointer-events-none opacity-70",
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accepted}
            className="hidden"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
          />
          {phase === "uploading" ? (
            <div className="space-y-3">
              <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" aria-hidden="true" />
              <p className="text-sm font-medium">Uploading…</p>
              <Progress value={uploadProgress} className="max-w-xs mx-auto h-2" />
            </div>
          ) : phase === "processing" ? (
            <div className="space-y-2">
              <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" aria-hidden="true" />
              <p className="text-sm font-medium">Reading your schedule with AI…</p>
              <p className="text-xs text-muted-foreground">This usually takes 10–30 seconds.</p>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="h-8 w-8 mx-auto text-muted-foreground" aria-hidden="true" />
              <p className="text-sm font-medium">Drop a file here, or click to browse</p>
              <p className="text-xs text-muted-foreground">
                {isPro ? "PDF, PNG, JPG, JPEG, WEBP · up to 15MB" : "PDF · up to 15MB"}
              </p>
            </div>
          )}
        </div>

        {!isPro && (
          <div className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs">
            <Crown className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="flex-1">
              <p className="font-medium">Image uploads are a Pro feature</p>
              <p className="text-muted-foreground">
                Free accounts can import PDFs. Upgrade to scan photos of timetables, posters, and screenshots.
              </p>
            </div>
            <Button asChild size="sm" variant="outline" className="shrink-0">
              <Link to="/pricing">Upgrade</Link>
            </Button>
          </div>
        )}

        <div className="pt-2">
          <div className="flex items-center gap-2 mb-2">
            <History className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <h3 className="text-sm font-semibold">Import history</h3>
          </div>
          {loadingHistory ? (
            <p className="text-xs text-muted-foreground py-2">Loading…</p>
          ) : history.length === 0 ? (
            <p className="text-xs text-muted-foreground py-2">No imports yet. Upload a file to get started.</p>
          ) : (
            <ul className="space-y-2">
              {history.map((row) => (
                <li key={row.id} className="flex items-center justify-between gap-2 rounded-md border bg-card px-3 py-2 text-sm">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
                    <div className="min-w-0">
                      <p className="truncate font-medium">{row.file_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(row.created_at), "MMM d, yyyy · h:mm a")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="secondary" className="text-xs capitalize">{row.status}</Badge>
                    {row.event_count > 0 && (
                      <span className="text-xs text-muted-foreground">{row.event_count} events</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>

      <Dialog open={reviewOpen} onOpenChange={(o) => !importing && setReviewOpen(o)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Review extracted events</DialogTitle>
            <DialogDescription>
              Edit, remove, or add entries before importing into your calendar and planner.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(Object.keys(TYPE_META) as EventType[]).map((t) => {
              const Icon = TYPE_META[t].icon;
              return (
                <div key={t} className={cn("rounded-md border px-3 py-2 flex items-center gap-2", TYPE_META[t].color)}>
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  <div className="text-xs">
                    <div className="font-medium">{TYPE_META[t].label}s</div>
                    <div className="text-base font-bold">{counts[t]}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {events.length > 0 && (errorCount > 0 || warningCount > 0) && (
            <div className={cn(
              "flex items-start gap-2 rounded-md border px-3 py-2 text-xs",
              errorCount > 0
                ? "border-destructive/40 bg-destructive/10 text-destructive"
                : "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400",
            )}>
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="font-medium">
                  {errorCount > 0
                    ? `${errorCount} event${errorCount > 1 ? "s" : ""} need${errorCount === 1 ? "s" : ""} attention`
                    : `${warningCount} warning${warningCount > 1 ? "s" : ""}`}
                </p>
                <p className="opacity-80">
                  {errorCount > 0
                    ? "Fix the highlighted issues below before importing."
                    : "You can import, but please review the highlighted entries."}
                </p>
              </div>
            </div>
          )}

          <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">

            {events.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No events. Add one manually or close and try a clearer file.
              </p>
            ) : (
              events.map((ev, i) => {
                const issues = validations[i] || [];
                const isDup = dupIndexes.has(i);
                const hasError = issues.some((x) => x.level === "error");
                return (
                <div key={i} className={cn(
                  "rounded-md border p-3 space-y-2 bg-card",
                  hasError && "border-destructive/60",
                  !hasError && (issues.length > 0 || isDup) && "border-amber-500/60",
                )}>
                  <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2">
                    <Input
                      value={ev.title}
                      onChange={(e) => updateEvent(i, { title: e.target.value })}
                      placeholder="Event title"
                      aria-label={`Event ${i + 1} title`}
                    />
                    <div className="flex gap-2">
                      <Select value={ev.type} onValueChange={(v) => updateEvent(i, { type: v as EventType })}>
                        <SelectTrigger className="w-[140px]" aria-label={`Event ${i + 1} type`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(Object.keys(TYPE_META) as EventType[]).map((t) => (
                            <SelectItem key={t} value={t}>{TYPE_META[t].label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button variant="ghost" size="icon" onClick={() => removeEvent(i)} aria-label={`Remove event ${i + 1}`}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <Label className="text-xs">Date</Label>
                      <Input type="date" value={ev.date} onChange={(e) => updateEvent(i, { date: e.target.value })} />
                    </div>
                    <div>
                      <Label className="text-xs">Start</Label>
                      <Input type="time" value={ev.start_time} onChange={(e) => updateEvent(i, { start_time: e.target.value })} />
                    </div>
                    <div>
                      <Label className="text-xs">End</Label>
                      <Input type="time" value={ev.end_time} onChange={(e) => updateEvent(i, { end_time: e.target.value })} />
                    </div>
                    <div>
                      <Label className="text-xs">Location</Label>
                      <Input value={ev.location} onChange={(e) => updateEvent(i, { location: e.target.value })} placeholder="Room / link" />
                    </div>
                  </div>
                  <Input
                    value={ev.description}
                    onChange={(e) => updateEvent(i, { description: e.target.value })}
                    placeholder="Notes (optional)"
                  />
                  {(issues.length > 0 || isDup) && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {isDup && (
                        <Badge variant="outline" className="text-[10px] gap-1 border-amber-500/50 text-amber-600 dark:text-amber-400">
                          <AlertTriangle className="h-3 w-3" /> Possible duplicate
                        </Badge>
                      )}
                      {issues.map((iss, k) => (
                        <Badge
                          key={k}
                          variant="outline"
                          className={cn(
                            "text-[10px] gap-1",
                            iss.level === "error"
                              ? "border-destructive/60 text-destructive"
                              : "border-amber-500/50 text-amber-600 dark:text-amber-400",
                          )}
                        >
                          <AlertTriangle className="h-3 w-3" /> {iss.message}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                );
              })
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={addEvent} disabled={importing}>
              <Plus className="h-4 w-4 mr-1" /> Add event
            </Button>
            <div className="flex gap-2 sm:ml-auto">
              <Button variant="ghost" onClick={() => setReviewOpen(false)} disabled={importing}>
                <X className="h-4 w-4 mr-1" /> Cancel
              </Button>
              <Button onClick={confirmImport} disabled={importing || events.length === 0}>
                {importing ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Check className="h-4 w-4 mr-1" />}
                Import {events.length || ""}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default SmartAcademicImport;

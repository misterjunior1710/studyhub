import { useState, useMemo } from "react";
import { Plus, Search, ListChecks, AlertCircle, CheckCircle2, Clock, TrendingUp, Lock, Crown, Eye, EyeOff, GripVertical, X, Info } from "lucide-react";
import { isPast, isToday } from "date-fns";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useTasks, FREE_TASK_LIMIT } from "@/hooks/useTasks";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { TaskRow } from "@/components/tasks/TaskRow";
import { TaskEditorDialog } from "@/components/tasks/TaskEditorDialog";
import { TasksKanban } from "@/components/tasks/TasksKanban";
import { TasksCalendar } from "@/components/tasks/TasksCalendar";
import { AiAssistantSheet } from "@/components/tasks/AiAssistantSheet";
import { CATEGORY_META, type Task, type TaskCategory, type TaskStatus } from "@/lib/tasks";
import { Link } from "react-router-dom";
import PremiumPromoBanner from "@/components/pro/PremiumPromoBanner";

const Tasks = () => {
  const { user } = useAuth();
  const { isPro } = useSubscription();
  const { tasks, loading, createTask, updateTask, completeTask, reopenTask, archiveTask, deleteTask } = useTasks();
  const activeCount = tasks.filter((t) => t.status !== "completed" && t.status !== "archived").length;
  const overFreeLimit = !isPro && activeCount >= FREE_TASK_LIMIT;

  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<TaskCategory | "all">("all");
  const [hideCompleted, setHideCompleted] = useState<boolean>(() => {
    try { return localStorage.getItem("studyhub_tasks_hide_completed") === "1"; } catch { return false; }
  });
  const [tab, setTab] = useState<"today" | "upcoming" | "all" | "completed" | "kanban" | "calendar">("today");
  const [kanbanTipDismissed, setKanbanTipDismissed] = useState<boolean>(() => {
    try { return localStorage.getItem("studyhub_kanban_tip_dismissed") === "1"; } catch { return false; }
  });

  const dismissKanbanTip = () => {
    setKanbanTipDismissed(true);
    try { localStorage.setItem("studyhub_kanban_tip_dismissed", "1"); } catch {}
  };

  const toggleHideCompleted = () => {
    setHideCompleted((prev) => {
      const next = !prev;
      try { localStorage.setItem("studyhub_tasks_hide_completed", next ? "1" : "0"); } catch {}
      return next;
    });
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tasks.filter((t) => {
      if (hideCompleted && t.status === "completed") return false;
      if (categoryFilter !== "all" && t.category !== categoryFilter) return false;
      if (q && !t.title.toLowerCase().includes(q) && !(t.notes ?? "").toLowerCase().includes(q)
        && !t.tags.some((tag) => tag.includes(q))) return false;
      return true;
    });
  }, [tasks, search, categoryFilter, hideCompleted]);

  const buckets = useMemo(() => {
    const overdue: Task[] = [], today: Task[] = [], upcoming: Task[] = [], noDate: Task[] = [], done: Task[] = [];
    for (const t of filtered) {
      if (t.status === "completed") { done.push(t); continue; }
      if (!t.due_at) { noDate.push(t); continue; }
      const d = new Date(t.due_at);
      if (isPast(d) && !isToday(d)) overdue.push(t);
      else if (isToday(d)) today.push(t);
      else upcoming.push(t);
    }
    return { overdue, today, upcoming, noDate, done };
  }, [filtered]);

  const completionPct = tasks.length > 0
    ? Math.round((tasks.filter((t) => t.status === "completed").length / tasks.length) * 100)
    : 0;

  const handleSave = async (input: Partial<Task> & { title: string }) => {
    if (editing) await updateTask(editing.id, input);
    else await createTask(input);
    setEditing(null);
  };

  const openEdit = (task: Task) => { setEditing(task); setEditorOpen(true); };
  const openCreate = () => { setEditing(null); setEditorOpen(true); };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-12 max-w-2xl text-center">
          <ListChecks className="h-12 w-12 mx-auto text-muted-foreground mb-4" aria-hidden="true" />
          <h1 className="text-2xl font-bold mb-2">Sign in to plan your week</h1>
          <p className="text-muted-foreground mb-6">Track assignments, exams, study sessions and habits in one place.</p>
          <Button asChild><Link to="/auth">Sign in</Link></Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead title="Tasks · StudyHub" description="Plan assignments, exams, study sessions, and habits in one productivity workspace." />
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-6 max-w-4xl">
        {/* Primary actions — at the top for easy access */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
          <Button onClick={openCreate} className="sm:order-2 sm:ml-auto">
            <Plus className="h-4 w-4 mr-1" /> New task
          </Button>
          <AiAssistantSheet tasks={tasks} />
        </div>

        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">Productivity</h1>
          <p className="text-sm text-muted-foreground mt-1">Plan it, schedule it, ship it.</p>
        </div>

        {/* Dashboard cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <DashCard icon={<AlertCircle className="h-4 w-4 text-red-500" />} value={buckets.overdue.length} label="Overdue" />
          <DashCard icon={<Clock className="h-4 w-4 text-orange-500" />} value={buckets.today.length} label="Due today" />
          <DashCard icon={<TrendingUp className="h-4 w-4 text-blue-500" />} value={buckets.upcoming.length} label="Upcoming" />
          <DashCard icon={<CheckCircle2 className="h-4 w-4 text-green-500" />} value={buckets.done.length} label="Completed" />
        </div>

        <Card className="p-4 mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">Overall completion</span>
            <span className="text-muted-foreground">{completionPct}% · {tasks.filter((t) => t.status === "completed").length} of {tasks.length}</span>
          </div>
          <Progress value={completionPct} className="h-2" />
        </Card>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tasks, notes, tags…" className="pl-9" />
          </div>
          <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as typeof categoryFilter)}>
            <SelectTrigger className="sm:w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {Object.entries(CATEGORY_META).map(([key, meta]) => (
                <SelectItem key={key} value={key}>{meta.emoji} {meta.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant={hideCompleted ? "secondary" : "outline"}
            onClick={toggleHideCompleted}
            aria-pressed={hideCompleted}
            className="sm:w-auto"
          >
            {hideCompleted ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
            {hideCompleted ? "Completed hidden" : "Hide completed"}
          </Button>
        </div>

        {/* Tabs */}
        {!isPro && (
          <Card className="p-3 mb-4 border-primary/30 bg-primary/5 flex items-center justify-between gap-3 flex-wrap">
            <p className="text-sm">
              <Crown className="inline h-4 w-4 text-primary mr-1 -mt-0.5" />
              Free plan: <strong>{activeCount}/{FREE_TASK_LIMIT}</strong> active tasks. Pro unlocks unlimited tasks + Kanban & Calendar views.
            </p>
            <Button asChild size="sm" variant="default"><Link to="/pricing">Upgrade to Pro</Link></Button>
          </Card>
        )}

        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList className="grid grid-cols-3 sm:grid-cols-6 w-full sm:w-auto">
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="kanban" className="gap-1">Kanban{!isPro && <Lock className="h-3 w-3" aria-label="Pro feature" />}</TabsTrigger>
            <TabsTrigger value="calendar" className="gap-1">Calendar{!isPro && <Lock className="h-3 w-3" aria-label="Pro feature" />}</TabsTrigger>
            <TabsTrigger value="completed">Done</TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="mt-4 space-y-4">
            {loading ? <ListSkeleton /> : (
              <>
                <Section title="Overdue" tasks={buckets.overdue} {...{ openEdit, completeTask, reopenTask, archiveTask, deleteTask }} />
                <Section title="Today" tasks={buckets.today} {...{ openEdit, completeTask, reopenTask, archiveTask, deleteTask }} />
                {buckets.overdue.length === 0 && buckets.today.length === 0 && (
                  <EmptyState message="Nothing due today. You're free — go learn something!" onAction={openCreate} />
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="mt-4 space-y-4">
            {loading ? <ListSkeleton /> : (
              <>
                <Section title="Upcoming" tasks={buckets.upcoming} {...{ openEdit, completeTask, reopenTask, archiveTask, deleteTask }} />
                <Section title="No date" tasks={buckets.noDate} {...{ openEdit, completeTask, reopenTask, archiveTask, deleteTask }} />
                {buckets.upcoming.length === 0 && buckets.noDate.length === 0 && (
                  <EmptyState message="No upcoming tasks. Plan ahead?" onAction={openCreate} />
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="all" className="mt-4 space-y-2">
            {loading ? <ListSkeleton /> : filtered.length === 0
              ? <EmptyState message="No tasks match these filters." onAction={openCreate} />
              : filtered.map((t) => (
                  <TaskRow key={t.id} task={t} onComplete={completeTask} onReopen={reopenTask} onEdit={openEdit} onArchive={archiveTask} onDelete={deleteTask} />
                ))}
          </TabsContent>

          <TabsContent value="kanban" className="mt-4 space-y-3">
            {!isPro ? <ProTabLock label="Kanban board" /> : loading ? <ListSkeleton /> : (
              <>
                {!kanbanTipDismissed && (
                  <Card className="p-4 border-primary/20 bg-primary/5 relative">
                    <button
                      onClick={dismissKanbanTip}
                      className="absolute top-2 right-2 p-1 rounded-md hover:bg-muted transition-colors"
                      aria-label="Dismiss Kanban tip"
                    >
                      <X className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                      <div>
                        <h4 className="text-sm font-semibold mb-1">What is Kanban?</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Kanban is a simple visual system to manage your work. Each card is a task, and each column is a stage.
                          Drag tasks from <strong>Backlog</strong> → <strong>Due today</strong> → <strong>Completed</strong> as you work through them.
                          It helps you see exactly what needs attention at a glance — no more juggling mental to-do lists!
                        </p>
                      </div>
                    </div>
                  </Card>
                )}
                <TasksKanban
                  tasks={filtered}
                  onEdit={openEdit}
                  onUpdateStatus={(id, status: TaskStatus) => {
                    if (status === "completed") {
                      const t = tasks.find((x) => x.id === id);
                      if (t) completeTask(t);
                    } else {
                      reopenTask(id);
                    }
                  }}
                />
              </>
            )}
          </TabsContent>

          <TabsContent value="calendar" className="mt-4">
            {!isPro ? <ProTabLock label="Calendar view" /> : loading ? <ListSkeleton /> : <TasksCalendar tasks={filtered} onEdit={openEdit} />}
          </TabsContent>

          <TabsContent value="completed" className="mt-4 space-y-2">
            {loading ? <ListSkeleton /> : buckets.done.length === 0
              ? <EmptyState message="Nothing completed yet. Go knock something out!" onAction={openCreate} />
              : buckets.done.map((t) => (
                  <TaskRow key={t.id} task={t} onComplete={completeTask} onReopen={reopenTask} onEdit={openEdit} onArchive={archiveTask} onDelete={deleteTask} />
                ))}
          </TabsContent>
        </Tabs>

        <TaskEditorDialog open={editorOpen} onOpenChange={setEditorOpen} initial={editing} onSave={handleSave} />
      </main>
      <Footer />
    </div>
  );
};

const DashCard = ({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) => (
  <Card className="p-3">
    <div className="flex items-center gap-2 mb-1" aria-hidden="true">{icon}<span className="text-xs text-muted-foreground">{label}</span></div>
    <div className="text-2xl font-bold leading-none">{value}</div>
  </Card>
);

const Section = ({ title, tasks, openEdit, completeTask, reopenTask, archiveTask, deleteTask }: {
  title: string; tasks: Task[];
  openEdit: (t: Task) => void;
  completeTask: (t: Task) => void;
  reopenTask: (id: string) => void;
  archiveTask: (id: string) => void;
  deleteTask: (id: string) => void;
}) => {
  if (tasks.length === 0) return null;
  return (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold text-muted-foreground px-1">{title} · {tasks.length}</h2>
      {tasks.map((t) => (
        <TaskRow key={t.id} task={t} onComplete={completeTask} onReopen={reopenTask} onEdit={openEdit} onArchive={archiveTask} onDelete={deleteTask} />
      ))}
    </div>
  );
};

const EmptyState = ({ message, onAction }: { message: string; onAction: () => void }) => (
  <div className="text-center py-12 px-4">
    <ListChecks className="h-10 w-10 mx-auto text-muted-foreground mb-3" aria-hidden="true" />
    <p className="text-muted-foreground mb-4">{message}</p>
    <Button onClick={onAction} variant="outline"><Plus className="h-4 w-4 mr-1" /> Add a task</Button>
  </div>
);

const ListSkeleton = () => (
  <div className="space-y-2">
    {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
  </div>
);

const ProTabLock = ({ label }: { label: string }) => (
  <Card className="p-8 text-center">
    <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary mb-3">
      <Crown className="h-6 w-6" />
    </div>
    <h3 className="text-lg font-semibold mb-1">{label} is a Pro feature</h3>
    <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
      Unlock {label.toLowerCase()}, unlimited tasks, premium themes, an ad-free study mode and more.
    </p>
    <Button asChild><Link to="/pricing"><Crown className="h-4 w-4 mr-1" /> Upgrade to Pro</Link></Button>
  </Card>
);

export default Tasks;

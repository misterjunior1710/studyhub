import { useMemo } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import * as LucideIcons from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Award } from "lucide-react";
import ProgressRing from "@/components/transitions/ProgressRing";
import LessonItem from "@/components/transitions/LessonItem";
import BudgetCalculator from "@/components/transitions/BudgetCalculator";
import SavingsGoalTracker from "@/components/transitions/SavingsGoalTracker";
import { useTransitionsContent, useLessonProgress } from "@/hooks/useTransitions";

const MILESTONES = [
  { pct: 25, label: "Getting started", emoji: "🌱" },
  { pct: 50, label: "Halfway there", emoji: "⚡" },
  { pct: 75, label: "Almost done", emoji: "🚀" },
  { pct: 100, label: "Module complete", emoji: "🏆" },
];

const TransitionModule = () => {
  const { moduleSlug } = useParams<{ moduleSlug: string }>();
  const { modules, topics, lessons, loading } = useTransitionsContent();
  const { completed, toggleLesson } = useLessonProgress();

  const module = useMemo(() => modules.find((m) => m.slug === moduleSlug), [modules, moduleSlug]);

  const moduleTopics = useMemo(
    () => (module ? topics.filter((t) => t.module_id === module.id) : []),
    [topics, module],
  );
  const moduleLessons = useMemo(
    () => (module ? lessons.filter((l) => moduleTopics.some((t) => t.id === l.topic_id)) : []),
    [lessons, moduleTopics, module],
  );

  const total = moduleLessons.length;
  const done = moduleLessons.filter((l) => completed.has(l.id)).length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  if (!loading && !module) return <Navigate to="/transitions" replace />;

  const Icon = module ? (LucideIcons as any)[module.icon] ?? LucideIcons.GraduationCap : LucideIcons.GraduationCap;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEOHead
        title={module ? `${module.title} | Life Skills | StudyHub` : "Life Skills | StudyHub"}
        description={module?.description ?? "StudyHub Life Skills module."}
      />
      <Navbar />
      <main id="main-content" tabIndex={-1} className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 space-y-6">
        <Link to="/transitions" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-4 w-4 mr-1" /> All modules
        </Link>

        {loading || !module ? (
          <Skeleton className="h-32 rounded-xl" />
        ) : (
          <Card className="glass-panel p-6">
            <div className="flex items-start gap-4 flex-wrap">
              <div className="rounded-xl bg-background/60 p-3 ring-1 ring-border/40">
                <Icon className="h-7 w-7 text-primary" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-[240px]">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{module.phase}</p>
                <h1 className="text-2xl font-bold">{module.title}</h1>
                <p className="text-sm text-muted-foreground mt-2 max-w-2xl">{module.description}</p>
              </div>
              <ProgressRing pct={pct} size={80} label={`${done}/${total}`} />
            </div>
            <div className="mt-4 flex gap-2 flex-wrap">
              {MILESTONES.map((m) => {
                const reached = pct >= m.pct;
                return (
                  <Badge
                    key={m.pct}
                    variant={reached ? "default" : "outline"}
                    className={reached ? "" : "opacity-60"}
                    aria-label={`${m.label}${reached ? " — earned" : " — locked"}`}
                  >
                    <span className="mr-1">{m.emoji}</span>
                    {m.label}
                  </Badge>
                );
              })}
            </div>
          </Card>
        )}

        <Tabs defaultValue="lessons" className="space-y-4">
          <TabsList>
            <TabsTrigger value="lessons">Lessons</TabsTrigger>
            <TabsTrigger value="tools">Tools</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          <TabsContent value="lessons" className="space-y-6">
            {loading
              ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)
              : moduleTopics.map((topic) => {
                  const TopicIcon = (LucideIcons as any)[topic.icon] ?? LucideIcons.BookOpen;
                  const tLessons = moduleLessons.filter((l) => l.topic_id === topic.id);
                  const tDone = tLessons.filter((l) => completed.has(l.id)).length;
                  return (
                    <section key={topic.id} className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-background/60 p-2 ring-1 ring-border/40">
                          <TopicIcon className="h-4 w-4 text-primary" aria-hidden="true" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h2 className="font-semibold">{topic.title}</h2>
                          <p className="text-sm text-muted-foreground">{topic.description}</p>
                        </div>
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {tDone}/{tLessons.length}
                        </span>
                      </div>
                      <div className="space-y-2 pl-1">
                        {tLessons.map((lesson) => (
                          <LessonItem
                            key={lesson.id}
                            lesson={lesson}
                            done={completed.has(lesson.id)}
                            onToggle={() => toggleLesson(lesson.id)}
                          />
                        ))}
                      </div>
                    </section>
                  );
                })}
          </TabsContent>

          <TabsContent value="tools" className="grid md:grid-cols-2 gap-4">
            <BudgetCalculator />
            <SavingsGoalTracker />
          </TabsContent>

          <TabsContent value="achievements">
            <Card className="glass-card p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" aria-hidden="true" />
                <h2 className="font-semibold">Module milestones</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Complete lessons to unlock milestones. Each one is a real step forward — celebrate it.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {MILESTONES.map((m) => {
                  const reached = pct >= m.pct;
                  return (
                    <div
                      key={m.pct}
                      className={`rounded-xl border p-4 text-center ${
                        reached ? "border-primary/40 bg-primary/5" : "border-border/40 opacity-60"
                      }`}
                    >
                      <div className="text-3xl">{m.emoji}</div>
                      <p className="font-medium mt-1">{m.label}</p>
                      <p className="text-xs text-muted-foreground">{m.pct}%</p>
                    </div>
                  );
                })}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default TransitionModule;

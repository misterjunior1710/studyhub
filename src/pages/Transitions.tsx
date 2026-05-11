import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, Library } from "lucide-react";
import ModuleCard from "@/components/transitions/ModuleCard";
import { useTransitionsContent, useLessonProgress, computeModuleProgress } from "@/hooks/useTransitions";

const Transitions = () => {
  const { modules, topics, lessons, loading } = useTransitionsContent();
  const { completed } = useLessonProgress();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEOHead
        title="Life Skills | StudyHub"
        description="Transition Life Skills modules to help you go from high school to college, and college to adulthood — with confidence."
      />
      <Navbar />
      <main id="main-content" tabIndex={-1} className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 space-y-8">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-wider text-primary">Life Skills</p>
          <h1 className="text-3xl font-bold">Transition Life Skills</h1>
          <p className="text-muted-foreground max-w-2xl">
            The stuff school doesn't teach you. Two guided modules to help you grow from high schooler
            to independent college student — and from college student to confident adult.
          </p>
        </header>

        <Card className="glass-panel p-5 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <Library className="h-5 w-5 text-primary shrink-0" aria-hidden="true" />
            <div className="min-w-0">
              <p className="font-medium">Resource Library</p>
              <p className="text-sm text-muted-foreground">Worksheets, templates, guides — searchable & ready to use.</p>
            </div>
          </div>
          <Button asChild variant="outline">
            <Link to="/transitions/resources">Browse resources</Link>
          </Button>
        </Card>

        <section className="grid md:grid-cols-2 gap-4">
          {loading
            ? Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-44 rounded-xl" />)
            : modules.map((m) => {
                const { done, total, pct } = computeModuleProgress(m.id, topics, lessons, completed);
                return <ModuleCard key={m.id} module={m} done={done} total={total} pct={pct} />;
              })}
        </section>

        <Card className="glass-card p-5 flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="font-medium">Need a personalized plan?</p>
            <p className="text-sm text-muted-foreground">
              Ask Nova in the assistant — describe where you are and what's coming up, and Nova will pull the right lessons
              and tools from these modules for you.
            </p>
          </div>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Transitions;

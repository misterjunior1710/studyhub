import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, Search, FileText, ListChecks, BookOpen, Wrench } from "lucide-react";
import { toast } from "sonner";

interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  resource_type: string;
  content: string | null;
  url: string | null;
  tags: string[];
}

const TYPE_ICON: Record<string, typeof FileText> = {
  worksheet: FileText,
  template: FileText,
  guide: BookOpen,
  checklist: ListChecks,
  tool: Wrench,
};

const TransitionResources = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [activeType, setActiveType] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("transition_resources" as any)
        .select("*")
        .order("order_index");
      if (error) toast.error("Couldn't load resources");
      else setResources((data ?? []) as any);
      setLoading(false);
    })();
  }, []);

  const types = useMemo(() => {
    const set = new Set<string>();
    resources.forEach((r) => set.add(r.resource_type));
    return ["all", ...Array.from(set).sort()];
  }, [resources]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return resources.filter((r) => {
      if (activeType !== "all" && r.resource_type !== activeType) return false;
      if (!needle) return true;
      return (
        r.title.toLowerCase().includes(needle) ||
        r.description.toLowerCase().includes(needle) ||
        r.tags.some((t) => t.toLowerCase().includes(needle)) ||
        r.category.toLowerCase().includes(needle)
      );
    });
  }, [resources, q, activeType]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEOHead
        title="Resource Library | Life Skills | StudyHub"
        description="Searchable library of worksheets, templates, checklists, and guides for student life transitions."
      />
      <Navbar />
      <main id="main-content" tabIndex={-1} className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 space-y-6">
        <Link to="/transitions" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-4 w-4 mr-1" /> Life Skills
        </Link>

        <header className="space-y-2">
          <h1 className="text-2xl font-bold">Resource Library</h1>
          <p className="text-muted-foreground">Pick-and-mix worksheets, templates, guides, and checklists.</p>
        </header>

        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" aria-hidden="true" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by topic, tag, or keyword…"
              className="pl-9"
              aria-label="Search resources"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {types.map((t) => (
              <Button
                key={t}
                variant={activeType === t ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveType(t)}
                className="capitalize"
              >
                {t === "all" ? "All" : t}
              </Button>
            ))}
          </div>
        </div>

        <section className="grid md:grid-cols-2 gap-4">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-xl" />)
            : filtered.length === 0
              ? (
                <Card className="glass-card p-6 text-center text-muted-foreground md:col-span-2">
                  No resources match your search.
                </Card>
              )
              : filtered.map((r) => {
                  const Icon = TYPE_ICON[r.resource_type] ?? FileText;
                  const expanded = expandedId === r.id;
                  return (
                    <Card key={r.id} className="glass-card hover-lift p-5">
                      <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-background/60 p-2 ring-1 ring-border/40">
                          <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold">{r.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{r.description}</p>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            <Badge variant="secondary" className="capitalize">{r.resource_type}</Badge>
                            {r.tags.slice(0, 3).map((t) => (
                              <Badge key={t} variant="outline" className="text-xs">#{t}</Badge>
                            ))}
                          </div>
                          {expanded && r.content && (
                            <div className="mt-3 text-sm whitespace-pre-wrap rounded-md bg-muted/40 p-3 animate-fade-in">
                              {r.content}
                            </div>
                          )}
                          <div className="mt-3 flex gap-2">
                            {r.content && (
                              <Button variant="ghost" size="sm" onClick={() => setExpandedId(expanded ? null : r.id)}>
                                {expanded ? "Hide" : "View"}
                              </Button>
                            )}
                            {r.url && (
                              <Button asChild variant="outline" size="sm">
                                <a href={r.url} target="_blank" rel="noopener noreferrer">Open link</a>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default TransitionResources;

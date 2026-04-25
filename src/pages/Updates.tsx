import { memo, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import PullToRefresh from "@/components/PullToRefresh";
import SEOHead, { StructuredData } from "@/components/SEOHead";
import { Megaphone, Sparkles, Bug, Wrench, Calendar, AlertCircle, Github, Zap, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { supabase } from "@/integrations/supabase/client";
import { format, formatDistanceToNow } from "date-fns";
import Footer from "@/components/Footer";

type UpdateMode = "newest" | "all";

interface UpdateItem {
  id: string;
  category: "feature" | "fix" | "update" | "performance" | "refactor";
  title: string;
  description: string;
  date: string;
  url: string;
  author: string | null;
}

interface UpdatesResponse {
  items: UpdateItem[];
  source: "github";
  cached_at: string;
  mode?: UpdateMode;
  from_cache?: boolean;
  stale?: boolean;
}

const categoryConfig = {
  feature:     { icon: Sparkles, label: "New Feature", className: "bg-accent/10 text-accent border-accent/20" },
  fix:         { icon: Bug,      label: "Bug Fix",     className: "bg-destructive/10 text-destructive border-destructive/20" },
  update:      { icon: Megaphone,label: "Update",      className: "bg-primary/10 text-primary border-primary/20" },
  performance: { icon: Zap,      label: "Performance", className: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  refactor:    { icon: Wrench,   label: "Improvement", className: "bg-primary/10 text-primary border-primary/20" },
} as const;

const PostSkeletonList = memo(() => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {[1, 2, 3, 4].map((i) => (
      <Card key={i} className="animate-pulse">
        <CardHeader className="space-y-3">
          <div className="h-6 bg-muted rounded w-3/4" />
          <div className="h-4 bg-muted rounded w-1/4" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-full" />
            <div className="h-4 bg-muted rounded w-2/3" />
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
));
PostSkeletonList.displayName = "PostSkeletonList";

interface UpdateCardProps {
  item: UpdateItem;
  isVisible: boolean;
  index: number;
}

const UpdateCard = memo(({ item, isVisible, index }: UpdateCardProps) => {
  const config = categoryConfig[item.category] || categoryConfig.update;
  const Icon = config.icon;
  const formattedDate = format(new Date(item.date), "MMM d, yyyy");

  return (
    <Card
      className={`h-full bg-card/50 backdrop-blur-sm border-border/50 hover:border-border transition-colors ${isVisible ? "opacity-0 animate-reveal-up" : "opacity-100"}`}
      style={{ animationDelay: `${Math.min(index * 100, 400)}ms` }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg leading-tight line-clamp-2">{item.title}</h3>
          </div>
          <Badge variant="outline" className={`${config.className} shrink-0`}>
            <Icon className="h-3 w-3 mr-1" />
            {config.label}
          </Badge>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3 w-3" />
            {formattedDate}
          </span>
          {item.author && (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <Github className="h-3 w-3" />
              {item.author}
            </a>
          )}
        </div>
      </CardHeader>
      {item.description && item.description !== item.title && (
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 whitespace-pre-line">
            {item.description}
          </p>
        </CardContent>
      )}
    </Card>
  );
});
UpdateCard.displayName = "UpdateCard";

const Updates = () => {
  const [mode, setMode] = useState<UpdateMode>("newest");
  const { data, isLoading, isError, refetch, isFetching } = useQuery<UpdatesResponse>({
    queryKey: ["github-updates", mode],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("github-updates", {
        body: { mode },
      });
      if (error) throw error;
      return data as UpdatesResponse;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const handleRefresh = async () => { await refetch(); };
  const [cardsRef, cardsVisible] = useScrollReveal<HTMLDivElement>();

  const structuredData = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Platform Updates - StudyHub",
    description: "Latest features, improvements, and announcements from StudyHub",
    url: `${window.location.origin}/updates`,
  }), []);

  const items = data?.items ?? [];

  return (
    <>
      <SEOHead
        title="What's New | Updates & New Features | Changelog"
        description="See the latest updates and new features. Bug fixes, improvements, new study tools."
        canonical="https://studyhub.world/updates"
      />
      <StructuredData data={structuredData} />
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="container mx-auto px-4 py-8 flex-1">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/10 opacity-0 animate-hero-fade-up">
                    <Megaphone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold opacity-0 animate-hero-fade-up" style={{ animationDelay: "100ms" }}>
                      Updates & Changelog
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1 opacity-0 animate-hero-fade-up" style={{ animationDelay: "150ms" }}>
                      Latest features, improvements, and fixes — synced from GitHub
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isFetching}
                  className="opacity-0 animate-hero-fade-up"
                  style={{ animationDelay: "200ms" }}
                >
                  <RefreshCw className={`h-3.5 w-3.5 mr-2 ${isFetching ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-6 opacity-0 animate-hero-fade-up" style={{ animationDelay: "250ms" }}>
                <div className="flex items-center rounded-md border border-border bg-muted/30 p-1">
                  {(["newest", "all"] as UpdateMode[]).map((filterMode) => (
                    <Button
                      key={filterMode}
                      type="button"
                      variant={mode === filterMode ? "default" : "ghost"}
                      size="sm"
                      className="h-7 px-3 text-xs capitalize"
                      onClick={() => setMode(filterMode)}
                    >
                      {filterMode === "newest" ? "Newest" : "All"}
                    </Button>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-medium border border-accent/20">
                  <Sparkles className="h-3 w-3" /> New Features
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                  <Wrench className="h-3 w-3" /> Improvements
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-destructive/10 text-destructive text-xs font-medium border border-destructive/20">
                  <Bug className="h-3 w-3" /> Bug Fixes
                </div>
                {data?.cached_at && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-xs ml-auto">
                    {items.length} shown · Updated {formatDistanceToNow(new Date(data.cached_at), { addSuffix: true })}
                    {data.stale && " (cached)"}
                  </div>
                )}
              </div>
            </div>

            <PullToRefresh onRefresh={handleRefresh}>
              {isLoading ? (
                <PostSkeletonList />
              ) : isError ? (
                <div className="text-center py-16 bg-card/50 rounded-2xl border border-border/50 backdrop-blur-sm">
                  <div className="p-4 rounded-full bg-destructive/10 w-fit mx-auto mb-4">
                    <AlertCircle className="h-12 w-12 text-destructive" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Failed to load updates</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto mb-4">
                    Couldn't reach GitHub. Please try again in a moment.
                  </p>
                  <Button variant="outline" onClick={() => refetch()}>Retry</Button>
                </div>
              ) : items.length === 0 ? (
                <div className="text-center py-16 bg-card/50 rounded-2xl border border-border/50 backdrop-blur-sm">
                  <div className="p-4 rounded-full bg-muted/50 w-fit mx-auto mb-4">
                    <Megaphone className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No updates yet</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto">
                    Check back soon — new features and fixes will appear here as they ship.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6" ref={cardsRef}>
                  {items.map((item, index) => (
                    <UpdateCard key={item.id} item={item} isVisible={cardsVisible} index={index} />
                  ))}
                </div>
              )}
            </PullToRefresh>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default memo(Updates);

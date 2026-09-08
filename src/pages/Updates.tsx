import { memo, useMemo } from "react";
import Navbar from "@/components/Navbar";
import SEOHead, { StructuredData } from "@/components/SEOHead";
import { Megaphone, Sparkles, Bug, Wrench, Calendar, Zap } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { format } from "date-fns";
import Footer from "@/components/Footer";
import { CHANGELOG, type ChangelogEntry } from "@/data/changelog";

const categoryConfig = {
  feature:     { icon: Sparkles, label: "New Feature", className: "bg-accent/10 text-accent border-accent/20" },
  fix:         { icon: Bug,      label: "Bug Fix",     className: "bg-destructive/10 text-destructive border-destructive/20" },
  update:      { icon: Megaphone,label: "Update",      className: "bg-primary/10 text-primary border-primary/20" },
  performance: { icon: Zap,      label: "Performance", className: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  refactor:    { icon: Wrench,   label: "Improvement", className: "bg-primary/10 text-primary border-primary/20" },
} as const;

interface UpdateCardProps {
  item: ChangelogEntry;
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
            <h2 className="font-bold text-lg leading-tight">{item.title}</h2>
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
          <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground">v{item.version}</span>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
        {item.highlights && item.highlights.length > 0 && (
          <ul className="mt-3 space-y-1.5">
            {item.highlights.map((h) => (
              <li key={h} className="text-sm text-muted-foreground flex gap-2">
                <span className="text-primary" aria-hidden="true">•</span>
                <span>{h}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
});
UpdateCard.displayName = "UpdateCard";

const Updates = () => {
  const [cardsRef, cardsVisible] = useScrollReveal<HTMLDivElement>();

  const items = useMemo(
    () => [...CHANGELOG].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    []
  );

  const structuredData = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Platform Updates - StudyHub",
    description: "Latest features, improvements, and announcements from StudyHub",
    url: `${window.location.origin}/updates`,
  }), []);

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
            <header className="mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/10 opacity-0 animate-hero-fade-up">
                  <Megaphone className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold opacity-0 animate-hero-fade-up" style={{ animationDelay: "100ms" }}>
                    Updates & Changelog
                  </h1>
                  <p className="text-muted-foreground text-sm mt-1 opacity-0 animate-hero-fade-up" style={{ animationDelay: "150ms" }}>
                    Every release worth knowing about, written in plain English
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-6 opacity-0 animate-hero-fade-up" style={{ animationDelay: "250ms" }}>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-medium border border-accent/20">
                  <Sparkles className="h-3 w-3" /> New Features
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                  <Wrench className="h-3 w-3" /> Improvements
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-destructive/10 text-destructive text-xs font-medium border border-destructive/20">
                  <Bug className="h-3 w-3" /> Bug Fixes
                </div>
              </div>
            </header>

            {items.length === 0 ? (
              <div className="text-center py-16 bg-card/50 rounded-2xl border border-border/50 backdrop-blur-sm">
                <div className="p-4 rounded-full bg-muted/50 w-fit mx-auto mb-4">
                  <Megaphone className="h-12 w-12 text-muted-foreground" />
                </div>
                <h2 className="text-lg font-semibold mb-2">No updates yet</h2>
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
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default memo(Updates);

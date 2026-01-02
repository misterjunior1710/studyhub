import { memo, useMemo } from "react";
import { usePosts } from "@/hooks/usePosts";
import Navbar from "@/components/Navbar";
import PostSkeleton from "@/components/PostSkeleton";
import PullToRefresh from "@/components/PullToRefresh";
import SEOHead, { StructuredData } from "@/components/SEOHead";
import CreateUpdatePostDialog from "@/components/CreateUpdatePostDialog";
import { useAuth } from "@/contexts/AuthContext";
import { Megaphone, Sparkles, Bug, Wrench, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useScrollReveal } from "@/hooks/useScrollReveal";

import { format } from "date-fns";

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

// Helper to get update type from content
const getUpdateType = (content: string): "feature" | "improvement" | "bugfix" => {
  const lowerContent = content.toLowerCase();
  if (lowerContent.includes("bug") || lowerContent.includes("fix")) return "bugfix";
  if (lowerContent.includes("improve") || lowerContent.includes("enhance") || lowerContent.includes("update")) return "improvement";
  return "feature";
};

const updateTypeConfig = {
  feature: {
    icon: Sparkles,
    label: "New Feature",
    className: "bg-accent/10 text-accent border-accent/20",
  },
  improvement: {
    icon: Wrench,
    label: "Improvement",
    className: "bg-primary/10 text-primary border-primary/20",
  },
  bugfix: {
    icon: Bug,
    label: "Bug Fix",
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
};

interface UpdateCardProps {
  title: string;
  content: string;
  createdAt: string;
  isVisible: boolean;
  index: number;
}

const UpdateCard = memo(({ title, content, createdAt, isVisible, index }: UpdateCardProps) => {
  const updateType = getUpdateType(content);
  const config = updateTypeConfig[updateType];
  const Icon = config.icon;
  
  // Strip HTML tags and truncate for description
  const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  };
  
  const description = stripHtml(content).slice(0, 200) + (stripHtml(content).length > 200 ? "..." : "");
  const formattedDate = format(new Date(createdAt), "MMM d, yyyy");

  return (
    <Card 
      className={`h-full bg-card/50 backdrop-blur-sm border-border/50 ${isVisible ? "opacity-0 animate-reveal-up" : "opacity-0"}`}
      style={{ animationDelay: `${Math.min(index * 100, 400)}ms` }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg leading-tight line-clamp-2">
              {title}
            </h3>
          </div>
          <Badge variant="outline" className={`shrink-0 ${config.className}`}>
            <Icon className="h-3 w-3 mr-1" />
            {config.label}
          </Badge>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
          <Calendar className="h-3 w-3" />
          {formattedDate}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      </CardContent>
    </Card>
  );
});

UpdateCard.displayName = "UpdateCard";

const Updates = () => {
  const { user } = useAuth();
  
  // Check if current user is the specific admin
  const isAdminUser = user?.email === "misterjunior1710@gmail.com";

  const { data: posts, isLoading, refetch } = usePosts({
    postType: "update",
    sortBy: "new",
  });

  const handleRefresh = async () => {
    await refetch();
  };
  
  // Scroll reveal for cards
  const [cardsRef, cardsVisible] = useScrollReveal<HTMLDivElement>();

  const structuredData = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Platform Updates - StudyHub",
      description: "Latest features, improvements, and announcements from StudyHub",
      url: `${window.location.origin}/updates`,
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: window.location.origin,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Updates",
            item: `${window.location.origin}/updates`,
          },
        ],
      },
    }),
    []
  );

  return (
    <>
      <SEOHead
        title="Platform Updates & New Features"
        description="Stay up-to-date with the latest StudyHub features, improvements, and bug fixes. See what's new, what's been improved, and what's coming next to help you study smarter."
        canonical="https://studyhub.world/updates"
      />
      <StructuredData data={structuredData} />
      <div className="min-h-screen bg-background">
        <Navbar onPostCreated={handleRefresh} />

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/10 opacity-0 animate-hero-fade-up">
                    <Megaphone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text opacity-0 animate-hero-fade-up" style={{ animationDelay: "100ms" }}>
                      Updates & Announcements
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1 opacity-0 animate-hero-fade-up" style={{ animationDelay: "150ms" }}>
                      Latest features, improvements, and platform news
                    </p>
                  </div>
                </div>
                {/* Only show create button for admin user */}
                {isAdminUser && (
                  <div className="opacity-0 animate-hero-fade-up" style={{ animationDelay: "200ms" }}>
                    <CreateUpdatePostDialog onPostCreated={handleRefresh} />
                  </div>
                )}
              </div>

              {/* Category badges */}
              <div className="flex flex-wrap gap-2 mt-6 opacity-0 animate-hero-fade-up" style={{ animationDelay: "250ms" }}>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-medium border border-accent/20">
                  <Sparkles className="h-3 w-3" />
                  New Features
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                  <Wrench className="h-3 w-3" />
                  Improvements
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-destructive/10 text-destructive text-xs font-medium border border-destructive/20">
                  <Bug className="h-3 w-3" />
                  Bug Fixes
                </div>
              </div>
            </div>

            {/* Posts Grid */}
            <PullToRefresh onRefresh={handleRefresh}>
              {isLoading ? (
                <PostSkeletonList />
              ) : !posts || posts.length === 0 ? (
                <div className="text-center py-16 bg-card/50 rounded-2xl border border-border/50 backdrop-blur-sm">
                  <div className="p-4 rounded-full bg-muted/50 w-fit mx-auto mb-4">
                    <Megaphone className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No updates yet</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto">
                    Check back later for the latest platform announcements and features.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6" ref={cardsRef}>
                  {posts.map((post, index) => (
                    <UpdateCard
                      key={post.id}
                      title={post.title}
                      content={post.content}
                      createdAt={post.created_at}
                      isVisible={cardsVisible}
                      index={index}
                    />
                  ))}
                </div>
              )}
            </PullToRefresh>
          </div>
        </main>
      </div>
    </>
  );
};

export default memo(Updates);

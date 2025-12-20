import { memo, useMemo } from "react";
import { usePosts } from "@/hooks/usePosts";
import Navbar from "@/components/Navbar";
import StudyPost from "@/components/StudyPost";
import PostSkeleton from "@/components/PostSkeleton";
import PullToRefresh from "@/components/PullToRefresh";
import SEOHead, { StructuredData } from "@/components/SEOHead";
import CreateUpdatePostDialog from "@/components/CreateUpdatePostDialog";
import { useAuth } from "@/contexts/AuthContext";
import { Megaphone, Sparkles, Bug, Wrench } from "lucide-react";

const PostSkeletonList = memo(() => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <PostSkeleton key={i} />
    ))}
  </div>
));

PostSkeletonList.displayName = "PostSkeletonList";

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
        title="Platform Updates"
        description="Stay informed about the latest features, improvements, bug fixes, and platform announcements from StudyHub."
        canonical={`${window.location.origin}/updates`}
      />
      <StructuredData data={structuredData} />
      <div className="min-h-screen bg-background">
        <Navbar onPostCreated={handleRefresh} />

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Megaphone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">Updates & Announcements</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                      Latest features, improvements, and platform news
                    </p>
                  </div>
                </div>
                {/* Only show create button for admin user */}
                {isAdminUser && (
                  <CreateUpdatePostDialog onPostCreated={handleRefresh} />
                )}
              </div>

              {/* Category badges */}
              <div className="flex flex-wrap gap-2 mt-4">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-medium">
                  <Sparkles className="h-3 w-3" />
                  New Features
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  <Wrench className="h-3 w-3" />
                  Improvements
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-destructive/10 text-destructive text-xs font-medium">
                  <Bug className="h-3 w-3" />
                  Bug Fixes
                </div>
              </div>
            </div>

            {/* Posts */}
            <PullToRefresh onRefresh={handleRefresh}>
              {isLoading ? (
                <PostSkeletonList />
              ) : !posts || posts.length === 0 ? (
                <div className="text-center py-12 bg-card rounded-lg border border-border">
                  <Megaphone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No updates yet</h3>
                  <p className="text-muted-foreground">
                    Check back later for the latest platform announcements and features.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <StudyPost
                      key={post.id}
                      id={post.id}
                      title={post.title}
                      content={post.content}
                      author={post.profiles?.username || "StudyHub Team"}
                      authorId={post.user_id}
                      upvotes={post.upvotes}
                      downvotes={post.downvotes}
                      comments={post.comments?.[0]?.count || 0}
                      timeAgo={new Date(post.created_at).toLocaleDateString()}
                      subject={post.subject}
                      grade={post.grade}
                      stream={post.stream}
                      country={post.country}
                      postType="update"
                      createdAt={post.created_at}
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

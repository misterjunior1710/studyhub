import { memo, useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import StudyPost from "@/components/StudyPost";
import SEOHead, { StructuredData, getBreadcrumbSchema } from "@/components/SEOHead";
import { PostSkeletonList } from "@/components/PostSkeleton";
import PullToRefresh from "@/components/PullToRefresh";
import { usePosts, getTimeAgo } from "@/hooks/usePosts";
import StudyReminderDialog from "@/components/StudyReminderDialog";

const INITIAL_REMINDER_DELAY = 2 * 60 * 1000; // 2 minutes
const EXTENDED_REMINDER_DELAY = 5 * 60 * 1000; // 5 minutes

const Memes = () => {
  const [showReminder, setShowReminder] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const { data: posts = [], isLoading: loading, invalidatePosts } = usePosts({
    postType: "meme",
    sortBy: "new",
  });

  const startTimer = (delay: number) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      setShowReminder(true);
    }, delay);
  };

  useEffect(() => {
    startTimer(INITIAL_REMINDER_DELAY);
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleExtendTime = () => {
    startTimer(EXTENDED_REMINDER_DELAY);
  };

  const breadcrumbData = getBreadcrumbSchema([
    { name: "Home", url: "https://studyhub.lovable.app/" },
    { name: "Memes", url: "https://studyhub.lovable.app/memes" },
  ]);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Study Memes - Funny Educational Content"
        description="Share and enjoy study-related memes with the StudyHub community. Laugh while learning with fellow students from around the world."
        canonical="https://studyhub.lovable.app/memes"
      />
      <StructuredData data={breadcrumbData} />
      
      <Navbar onPostCreated={invalidatePosts} />
      <main className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Memes
          </h1>
          <p className="text-muted-foreground">
            Share and enjoy study-related memes
          </p>
        </header>

        <section aria-label="Memes feed">
          <PullToRefresh onRefresh={invalidatePosts}>
            {loading ? (
              <div className="grid gap-6 md:grid-cols-2">
                <PostSkeletonList count={2} />
                <PostSkeletonList count={2} />
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No memes yet. Share the first one!
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {posts.map((post) => (
                  <article key={post.id}>
                    <StudyPost
                      id={post.id}
                      title={post.title}
                      content={post.content}
                      author={post.profiles?.username ?? "Anonymous"}
                      authorId={post.user_id}
                      upvotes={post.upvotes}
                      downvotes={post.downvotes}
                      comments={Array.isArray(post.comments) ? post.comments.length : 0}
                      subject={post.subject}
                      grade={post.grade}
                      stream={post.stream}
                      country={post.country}
                      timeAgo={getTimeAgo(post.created_at)}
                      fileUrl={post.file_url ?? undefined}
                      onVoteChange={invalidatePosts}
                    />
                  </article>
                ))}
              </div>
            )}
          </PullToRefresh>
        </section>
      </main>
      
      <StudyReminderDialog 
        open={showReminder} 
        onOpenChange={setShowReminder}
        onExtendTime={handleExtendTime}
      />
    </div>
  );
};

export default memo(Memes);

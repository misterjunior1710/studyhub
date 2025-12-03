import { memo } from "react";
import Navbar from "@/components/Navbar";
import StudyPost from "@/components/StudyPost";
import SEOHead, { StructuredData, getBreadcrumbSchema } from "@/components/SEOHead";
import { Loader2 } from "lucide-react";
import { usePosts, getTimeAgo } from "@/hooks/usePosts";

const AskDoubt = () => {
  const { data: posts = [], isLoading: loading, invalidatePosts } = usePosts({
    postType: "doubt",
    sortBy: "new",
  });

  const breadcrumbData = getBreadcrumbSchema([
    { name: "Home", url: "https://studyhub.lovable.app/" },
    { name: "Ask Doubt", url: "https://studyhub.lovable.app/ask-doubt" },
  ]);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Ask a Doubt - Get Study Help"
        description="Get help with your studies from the StudyHub community. Post your academic questions and receive answers from students worldwide."
        canonical="https://studyhub.lovable.app/ask-doubt"
      />
      <StructuredData data={breadcrumbData} />
      
      <Navbar onPostCreated={invalidatePosts} />
      <main className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Ask a Doubt
          </h1>
          <p className="text-muted-foreground">
            Get help with your studies from the community
          </p>
        </header>

        <section aria-label="Doubts feed">
          {loading ? (
            <div className="flex justify-center items-center py-12" role="status" aria-label="Loading doubts">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No doubts posted yet. Be the first to ask!
            </div>
          ) : (
            <div className="grid gap-6">
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
        </section>
      </main>
    </div>
  );
};

export default memo(AskDoubt);

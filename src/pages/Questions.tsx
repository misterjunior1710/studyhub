import { memo } from "react";
import Navbar from "@/components/Navbar";
import StudyPost from "@/components/StudyPost";
import SEOHead, { StructuredData, getBreadcrumbSchema } from "@/components/SEOHead";
import { PostSkeletonList } from "@/components/PostSkeleton";
import PullToRefresh from "@/components/PullToRefresh";
import { usePosts, getTimeAgo } from "@/hooks/usePosts";

const Questions = () => {
  const {
    data: posts = [],
    isLoading: loading,
    invalidatePosts
  } = usePosts({
    postType: "doubt",
    sortBy: "new"
  });

  const breadcrumbData = getBreadcrumbSchema([{
    name: "Home",
    url: "https://studyhub-studentportal.lovable.app/"
  }, {
    name: "Questions",
    url: "https://studyhub-studentportal.lovable.app/questions"
  }]);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Questions - Get Study Help" 
        description="Get help with your studies from the StudyHub community. Post your academic questions and receive answers from students worldwide." 
        canonical="https://studyhub-studentportal.lovable.app/questions" 
      />
      <StructuredData data={breadcrumbData} />
      
      <Navbar onPostCreated={invalidatePosts} />
      <main className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Questions
          </h1>
          <p className="text-muted-foreground">
            Get help with your studies from the community
          </p>
        </header>

        <section aria-label="Questions feed">
          <PullToRefresh onRefresh={invalidatePosts}>
            {loading ? (
              <PostSkeletonList count={4} />
            ) : posts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No questions posted yet. Be the first to ask!
              </div>
            ) : (
              <div className="grid gap-6">
                {posts.map(post => (
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
    </div>
  );
};

export default memo(Questions);

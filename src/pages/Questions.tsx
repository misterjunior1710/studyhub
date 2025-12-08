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
        title="Academic Questions - Get Study Help" 
        description="Get help with your studies from the StudyHub community. Post academic questions in any subject and receive answers from students worldwide. From math problems to essay feedback." 
        canonical="https://studyhub-studentportal.lovable.app/questions" 
      />
      <StructuredData data={breadcrumbData} />
      
      <Navbar onPostCreated={invalidatePosts} />
      <main className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Academic Questions
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Stuck on a problem? Post your question and get help from students around the world. 
            Whether it's calculus, chemistry, or creative writing, the community is here to help.
          </p>
          <nav className="mt-3 text-sm" aria-label="Related pages">
            <span className="text-muted-foreground">See also: </span>
            <a href="/" className="text-primary hover:underline">Home Feed</a>
            <span className="text-muted-foreground mx-2">•</span>
            <a href="/groups" className="text-primary hover:underline">Study Groups</a>
            <span className="text-muted-foreground mx-2">•</span>
            <a href="/leaderboard" className="text-primary hover:underline">Leaderboard</a>
          </nav>
        </header>

        <section aria-label="Questions feed">
          <PullToRefresh onRefresh={invalidatePosts}>
            {loading ? (
              <PostSkeletonList count={4} />
            ) : posts.length === 0 ? (
              <div className="text-center py-12">
                <h2 className="text-lg font-semibold mb-2">No questions posted yet</h2>
                <p className="text-muted-foreground mb-4">
                  Be the first to ask! Click the post button in the navigation to ask your question.
                </p>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Questions can be about any academic subject — homework help, exam preparation, 
                  concept explanations, or study strategies. The community is ready to assist.
                </p>
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

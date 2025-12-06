import { memo, useState, useCallback, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RedditSidebar from "@/components/RedditSidebar";
import BottomNav from "@/components/BottomNav";
import StudyPost from "@/components/StudyPost";
import CookieConsent from "@/components/CookieConsent";
import SEOHead, { StructuredData, getOrganizationSchema, getCommunitySchema } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { TrendingUp, Clock, Star, Loader2, Sparkles, Flame } from "lucide-react";
import { usePosts, useUserData, getTimeAgo } from "@/hooks/usePosts";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";

const Index = () => {
  const [sortBy, setSortBy] = useState<"hot" | "new" | "top">("hot");
  const [searchInput, setSearchInput] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const searchQuery = useDebounce(searchInput, 300);
  const { data: userData } = useUserData();

  const { data: posts = [], isLoading: loading, invalidatePosts } = usePosts({
    postType: "general",
    sortBy,
    searchQuery,
    selectedCountry: null,
    selectedSubject,
    selectedGrade: null,
    selectedStream: null,
    userGrade: userData?.grade,
    isAdmin: userData?.isAdmin,
  });

  const structuredData = useMemo(() => ({
    "@context": "https://schema.org",
    "@graph": [getOrganizationSchema(), getCommunitySchema()],
  }), []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title="StudyHub - Learn Together"
        description="Connect with students worldwide on StudyHub. Share knowledge, ask questions, and collaborate across different subjects and grades."
        canonical="https://studyhub.lovable.app/"
      />
      <StructuredData data={structuredData} />
      
      <Navbar 
        onPostCreated={invalidatePosts} 
        searchValue={searchInput}
        onSearchChange={setSearchInput}
      />
      
      <div className="container mx-auto px-4 py-4 flex-1">
        <div className="flex gap-6">
          {/* Left Sidebar */}
          <RedditSidebar 
            selectedSubject={selectedSubject}
            onSubjectChange={setSelectedSubject}
          />
          
          {/* Main Content */}
          <main className="flex-1 min-w-0 space-y-3 pb-20 md:pb-0">
            {/* Sort Tabs */}
            <div className="bg-card border border-border rounded-md p-2 flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "gap-2 h-9 rounded-full",
                  sortBy === "hot" && "bg-secondary font-medium"
                )}
                onClick={() => setSortBy("hot")}
              >
                <Flame className="h-4 w-4" />
                Hot
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "gap-2 h-9 rounded-full",
                  sortBy === "new" && "bg-secondary font-medium"
                )}
                onClick={() => setSortBy("new")}
              >
                <Clock className="h-4 w-4" />
                New
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "gap-2 h-9 rounded-full",
                  sortBy === "top" && "bg-secondary font-medium"
                )}
                onClick={() => setSortBy("top")}
              >
                <TrendingUp className="h-4 w-4" />
                Top
              </Button>
            </div>

            {/* Posts Feed */}
            <section aria-label="Posts feed">
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : posts.length === 0 ? (
                <div className="bg-card border border-border rounded-md p-12 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary mb-4">
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-muted-foreground">
                    No posts yet. Be the first to create one!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
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
      </div>

      <Footer />
      <BottomNav />
      <CookieConsent />
    </div>
  );
};

export default memo(Index);

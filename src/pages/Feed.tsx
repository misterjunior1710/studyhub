import { memo, useState, useCallback, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FilterSidebar from "@/components/FilterSidebar";
import MobileFilterSheet from "@/components/MobileFilterSheet";
import StudyPost from "@/components/StudyPost";
import SEOHead, { StructuredData, getBreadcrumbSchema } from "@/components/SEOHead";
import { PostSkeletonList } from "@/components/PostSkeleton";
import PullToRefresh from "@/components/PullToRefresh";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TrendingUp, Clock, Star, Sparkles, Search } from "lucide-react";
import { usePosts, getTimeAgo } from "@/hooks/usePosts";
import { useDebounce } from "@/hooks/useDebounce";
import { useAuth } from "@/contexts/AuthContext";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const Feed = () => {
  const [sortBy, setSortBy] = useState<"hot" | "new" | "top">("hot");
  const [searchInput, setSearchInput] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [selectedStream, setSelectedStream] = useState<string | null>(null);

  const searchQuery = useDebounce(searchInput, 300);
  const { profileData, isAdmin, user } = useAuth();
  const { completeTask, isOnboardingComplete } = useOnboarding();
  
  useEffect(() => {
    if (!user || isOnboardingComplete) return;
    
    const handleScroll = () => {
      if (window.scrollY > 200) {
        completeTask("browse");
        window.removeEventListener("scroll", handleScroll);
      }
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [user, isOnboardingComplete, completeTask]);

  const { data: posts = [], isLoading: loading, invalidatePosts } = usePosts({
    postType: "general",
    sortBy,
    searchQuery,
    selectedCountry,
    selectedSubject,
    selectedGrade,
    selectedStream,
    userGrade: profileData?.grade,
    isAdmin,
  });

  const handleClearFilters = useCallback(() => {
    setSelectedCountry(null);
    setSelectedSubject(null);
    setSelectedGrade(null);
    setSelectedStream(null);
  }, []);

  const [postsRef, postsVisible] = useScrollReveal<HTMLDivElement>();

  const breadcrumbData = getBreadcrumbSchema([
    { name: "Home", url: "https://studyhub.world/" },
    { name: "Feed", url: "https://studyhub.world/feed" },
  ]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title="Student Forum | Study Discussions | Share Notes & Resources"
        description="Join student discussions, share study notes, find study partners. Browse posts about homework, exams, study tips. Connect with students from around the world."
        canonical="https://studyhub.world/feed"
      />
      <StructuredData data={breadcrumbData} />
      
      <Navbar onPostCreated={invalidatePosts} />
      
      <header className="bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 border-b border-border">
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 opacity-0 animate-hero-fade-up">
            Study Feed
          </h1>
          <p className="text-muted-foreground mb-4 opacity-0 animate-hero-fade-up" style={{ animationDelay: "100ms" }}>
            See what students around the world are posting, asking, and sharing
          </p>
          
          <div className="max-w-2xl opacity-0 animate-hero-fade-up" style={{ animationDelay: "200ms" }}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search for topics, questions, subjects..."
                className="pl-10 pr-4 py-5"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                aria-label="Search posts"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-4 sm:py-6 flex-1">
        <div className="flex gap-4 lg:gap-6">
          <aside className="hidden lg:block">
            <FilterSidebar
              selectedCountry={selectedCountry}
              selectedSubject={selectedSubject}
              selectedGrade={selectedGrade}
              selectedStream={selectedStream}
              onCountryChange={setSelectedCountry}
              onSubjectChange={setSelectedSubject}
              onGradeChange={setSelectedGrade}
              onStreamChange={setSelectedStream}
              onClearAll={handleClearFilters}
            />
          </aside>
          
          <main className="flex-1 space-y-4 sm:space-y-6 min-w-0">
            <nav className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex gap-1 sm:gap-2">
                <Button
                  variant={sortBy === "hot" ? "default" : "ghost"}
                  size="sm"
                  className="gap-1 sm:gap-2 text-xs sm:text-sm"
                  onClick={() => setSortBy("hot")}
                >
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                  Hot
                </Button>
                <Button
                  variant={sortBy === "new" ? "default" : "ghost"}
                  size="sm"
                  className="gap-1 sm:gap-2 text-xs sm:text-sm"
                  onClick={() => setSortBy("new")}
                >
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                  New
                </Button>
                <Button
                  variant={sortBy === "top" ? "default" : "ghost"}
                  size="sm"
                  className="gap-1 sm:gap-2 text-xs sm:text-sm"
                  onClick={() => setSortBy("top")}
                >
                  <Star className="h-3 w-3 sm:h-4 sm:w-4" />
                  Top
                </Button>
              </div>
              
              <MobileFilterSheet
                selectedCountry={selectedCountry}
                selectedSubject={selectedSubject}
                selectedGrade={selectedGrade}
                selectedStream={selectedStream}
                onCountryChange={setSelectedCountry}
                onSubjectChange={setSelectedSubject}
                onGradeChange={setSelectedGrade}
                onStreamChange={setSelectedStream}
                onClearAll={handleClearFilters}
              />
            </nav>

            <section ref={postsRef}>
              <PullToRefresh onRefresh={invalidatePosts}>
                {loading ? (
                  <PostSkeletonList count={4} />
                ) : posts.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 mb-4">
                      <Sparkles className="h-8 w-8 text-primary" />
                    </div>
                     <h2 className="text-lg font-semibold mb-2">Nothing here yet!</h2>
                    <p className="text-muted-foreground mb-4">
                      Be the first to drop some knowledge or ask a question!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {posts.map((post, index) => (
                      <article 
                        key={post.id}
                        className={postsVisible ? "opacity-0 animate-reveal-up" : "opacity-0"}
                        style={{ animationDelay: `${Math.min(index * 100, 400)}ms` }}
                      >
                        <StudyPost
                          id={post.id}
                          title={post.title}
                          content={post.content}
                          author={post.profiles?.username ?? "Anonymous"}
                          authorId={post.user_id}
                          upvotes={post.upvotes}
                          downvotes={post.downvotes}
                          shareCount={post.share_count ?? 0}
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
      </div>
      <Footer />
    </div>
  );
};

export default memo(Feed);

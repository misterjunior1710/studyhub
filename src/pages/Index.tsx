import { memo, useState, useCallback, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FilterSidebar from "@/components/FilterSidebar";
import MobileFilterSheet from "@/components/MobileFilterSheet";
import StudyPost from "@/components/StudyPost";
import CookieConsent from "@/components/CookieConsent";
import SEOHead, { StructuredData, getOrganizationSchema, getCommunitySchema } from "@/components/SEOHead";
import { PostSkeletonList } from "@/components/PostSkeleton";
import PullToRefresh from "@/components/PullToRefresh";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TrendingUp, Clock, Star, Sparkles, Search } from "lucide-react";
import heroImage from "@/assets/hero-bg.jpg";
import { usePosts, getTimeAgo } from "@/hooks/usePosts";
import { useDebounce } from "@/hooks/useDebounce";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const [sortBy, setSortBy] = useState<"hot" | "new" | "top">("hot");
  const [searchInput, setSearchInput] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [selectedStream, setSelectedStream] = useState<string | null>(null);

  // Debounce search to prevent excessive API calls
  const searchQuery = useDebounce(searchInput, 300);

  // Get user data from auth context
  const { profileData, isAdmin } = useAuth();

  // Get posts with React Query caching
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

  // Memoize structured data
  const structuredData = useMemo(() => ({
    "@context": "https://schema.org",
    "@graph": [getOrganizationSchema(), getCommunitySchema()],
  }), []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title="Study Smarter, Win Harder"
        description="Connect with students worldwide on StudyHub. Share knowledge, ask questions, and collaborate across different countries, subjects, grades, and educational streams."
        canonical="https://studyhub-studentportal.lovable.app/"
      />
      <StructuredData data={structuredData} />
      
      <Navbar onPostCreated={invalidatePosts} />
      
      <header 
        className="relative bg-cover bg-center overflow-hidden"
        style={{ backgroundImage: `url(${heroImage})` }}
        role="img"
        aria-label="Students collaborating and studying together"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-accent/80 to-primary/90 animate-gradient-shift" style={{ backgroundSize: "200% 200%" }} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent)]" />
        <div className="relative container mx-auto px-4 py-8 sm:py-12 md:py-16">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-3 animate-fade-in leading-tight">
            Study Smarter, Win Harder
          </h1>
          <p className="text-white/90 text-sm sm:text-base md:text-lg lg:text-xl mb-4 sm:mb-6 animate-fade-in max-w-2xl" style={{ animationDelay: "0.1s" }}>
            Connect with students worldwide, share knowledge, and ace your exams ✨
          </p>
          
          <div className="max-w-2xl animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="relative">
              <Search className="absolute left-3 sm:left-4 top-1/2 h-4 w-4 sm:h-5 sm:w-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                placeholder="Search questions, topics..."
                className="w-full pl-10 sm:pl-12 pr-4 py-4 sm:py-6 text-sm sm:text-base md:text-lg bg-background/95 backdrop-blur-sm border-0 shadow-xl rounded-xl focus:ring-2 focus:ring-white/50"
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
          <aside className="hidden lg:block" aria-label="Filters">
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
            <nav className="flex flex-wrap items-center justify-between gap-2" aria-label="Sort options">
              <div className="flex gap-1 sm:gap-2">
                <Button
                  variant={sortBy === "hot" ? "default" : "ghost"}
                  size="sm"
                  className="gap-1 sm:gap-2 transition-all duration-200 hover:scale-105 text-xs sm:text-sm"
                  onClick={() => setSortBy("hot")}
                  aria-pressed={sortBy === "hot"}
                >
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
                  Hot
                </Button>
                <Button
                  variant={sortBy === "new" ? "default" : "ghost"}
                  size="sm"
                  className="gap-1 sm:gap-2 transition-all duration-200 hover:scale-105 text-xs sm:text-sm"
                  onClick={() => setSortBy("new")}
                  aria-pressed={sortBy === "new"}
                >
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
                  New
                </Button>
                <Button
                  variant={sortBy === "top" ? "default" : "ghost"}
                  size="sm"
                  className="gap-1 sm:gap-2 transition-all duration-200 hover:scale-105 text-xs sm:text-sm"
                  onClick={() => setSortBy("top")}
                  aria-pressed={sortBy === "top"}
                >
                  <Star className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
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

            <section aria-label="Posts feed">
              <PullToRefresh onRefresh={invalidatePosts}>
                {loading ? (
                  <PostSkeletonList count={4} />
                ) : posts.length === 0 ? (
                  <div className="text-center py-12 animate-fade-in">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 mb-4">
                      <Sparkles className="h-8 w-8 text-primary" aria-hidden="true" />
                    </div>
                    <h2 className="text-lg font-semibold mb-2">No posts yet</h2>
                    <p className="text-muted-foreground mb-4">
                      Be the first to share your knowledge or ask a question!
                    </p>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      StudyHub is a community where students from around the world help each other succeed. 
                      Start by asking a question or sharing study materials in any subject — from Mathematics 
                      and Physics to Languages and History.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {posts.map((post, index) => (
                      <article 
                        key={post.id} 
                        className="animate-slide-up" 
                        style={{ animationDelay: `${Math.min(index * 0.05, 0.5)}s` }}
                      >
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
      </div>
      <Footer />
      <CookieConsent />
    </div>
  );
};

export default memo(Index);

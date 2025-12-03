import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FilterSidebar from "@/components/FilterSidebar";
import MobileFilterSheet from "@/components/MobileFilterSheet";
import StudyPost from "@/components/StudyPost";
import CookieConsent from "@/components/CookieConsent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TrendingUp, Clock, Star, Loader2, Sparkles, Search } from "lucide-react";
import heroImage from "@/assets/hero-bg.jpg";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Post {
  id: string;
  title: string;
  content: string;
  subject: string;
  grade: string;
  stream: string;
  country: string;
  upvotes: number;
  downvotes: number;
  created_at: string;
  file_url: string | null;
  user_id: string;
  profiles?: {
    username: string;
  };
  comments?: { count: number }[];
}

const Index = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("hot");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [selectedStream, setSelectedStream] = useState<string | null>(null);
  const [userGrade, setUserGrade] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const [profileResult, roleResult] = await Promise.all([
          supabase.from("profiles").select("grade").eq("id", user.id).single(),
          supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").single()
        ]);
        setUserGrade(profileResult.data?.grade || null);
        setIsAdmin(!!roleResult.data);
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    loadPosts();

    const channel = supabase
      .channel("posts")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "posts",
        },
        () => {
          loadPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sortBy, searchQuery, selectedCountry, selectedSubject, selectedGrade, selectedStream, userGrade, isAdmin]);

  const loadPosts = async () => {
    setLoading(true);

    const buildQuery = (withRelations: boolean) => {
      let query = supabase
        .from("posts")
        .select(
          withRelations
            ? "*, profiles!posts_user_id_fkey(username), comments(count)"
            : "*"
        )
        .eq("post_type", "general");

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);
      }

      if (selectedCountry) {
        query = query.eq("country", selectedCountry);
      }

      if (selectedSubject) {
        query = query.eq("subject", selectedSubject);
      }

      if (selectedGrade) {
        query = query.eq("grade", selectedGrade);
      }

      if (selectedStream) {
        query = query.eq("stream", selectedStream);
      }

      // Hide Adult (18+) content from non-adult users (admins can see all)
      if (!isAdmin && userGrade !== "Adult (18+)") {
        query = query.neq("grade", "Adult (18+)");
      }

      if (sortBy === "new") {
        query = query.order("created_at", { ascending: false });
      } else if (sortBy === "top") {
        query = query.order("upvotes", { ascending: false });
      } else {
        query = query.order("upvotes", { ascending: false }).order("created_at", { ascending: false });
      }

      return query;
    };

    try {
      const { data, error } = await buildQuery(true);

      if (error) {
        console.error("Error loading posts with relations:", error);
        const { data: fallbackData, error: fallbackError } = await buildQuery(false);

        if (fallbackError) {
          console.error("Error loading posts without relations:", fallbackError);
          toast.error("Failed to load posts");
        } else {
          setPosts((fallbackData as any) || []);
        }
      } else {
        setPosts((data as any) || []);
      }
    } catch (err) {
      console.error("Unexpected error loading posts:", err);
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSelectedCountry(null);
    setSelectedSubject(null);
    setSelectedGrade(null);
    setSelectedStream(null);
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return `${seconds} seconds ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar onPostCreated={loadPosts} />
      
      <div 
        className="relative bg-cover bg-center overflow-hidden"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-accent/80 to-primary/90 animate-gradient-shift" style={{ backgroundSize: "200% 200%" }} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent)]" />
        <div className="relative container mx-auto px-4 py-8 sm:py-12 md:py-16">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-3 animate-fade-in leading-tight">
            Study Together, Learn Better
          </h1>
          <p className="text-white/90 text-sm sm:text-base md:text-lg lg:text-xl mb-4 sm:mb-6 animate-fade-in max-w-2xl" style={{ animationDelay: "0.1s" }}>
            Connect with students worldwide, share knowledge, and ace your exams ✨
          </p>
          
          {/* Search Bar in Hero */}
          <div className="max-w-2xl animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="relative">
              <Search className="absolute left-3 sm:left-4 top-1/2 h-4 w-4 sm:h-5 sm:w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search questions, topics..."
                className="w-full pl-10 sm:pl-12 pr-4 py-4 sm:py-6 text-sm sm:text-base md:text-lg bg-background/95 backdrop-blur-sm border-0 shadow-xl rounded-xl focus:ring-2 focus:ring-white/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 sm:py-6 flex-1">
        <div className="flex gap-4 lg:gap-6">
          {/* Desktop sidebar */}
          <div className="hidden lg:block">
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
          </div>
          
          <main className="flex-1 space-y-4 sm:space-y-6 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex gap-1 sm:gap-2">
                <Button
                  variant={sortBy === "hot" ? "default" : "ghost"}
                  size="sm"
                  className="gap-1 sm:gap-2 transition-all duration-200 hover:scale-105 text-xs sm:text-sm"
                  onClick={() => setSortBy("hot")}
                >
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                  Hot
                </Button>
                <Button
                  variant={sortBy === "new" ? "default" : "ghost"}
                  size="sm"
                  className="gap-1 sm:gap-2 transition-all duration-200 hover:scale-105 text-xs sm:text-sm"
                  onClick={() => setSortBy("new")}
                >
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                  New
                </Button>
                <Button
                  variant={sortBy === "top" ? "default" : "ghost"}
                  size="sm"
                  className="gap-1 sm:gap-2 transition-all duration-200 hover:scale-105 text-xs sm:text-sm"
                  onClick={() => setSortBy("top")}
                >
                  <Star className="h-3 w-3 sm:h-4 sm:w-4" />
                  Top
                </Button>
              </div>
              
              {/* Mobile filter button */}
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
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12 animate-fade-in">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 mb-4">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <p className="text-muted-foreground">
                  No posts yet. Be the first to create one!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post, index) => (
                  <div 
                    key={post.id} 
                    className="animate-slide-up" 
                    style={{ animationDelay: `${index * 0.05}s` }}
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
                      onVoteChange={loadPosts}
                    />
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
      <Footer />
      <CookieConsent />
    </div>
  );
};

export default Index;

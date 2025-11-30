import Navbar from "@/components/Navbar";
import FilterSidebar from "@/components/FilterSidebar";
import StudyPost from "@/components/StudyPost";
import { Button } from "@/components/ui/button";
import { TrendingUp, Clock, Star, Loader2 } from "lucide-react";
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
  profiles: {
    username: string;
  };
  comments: { count: number }[];
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
  }, [sortBy, searchQuery, selectedCountry, selectedSubject, selectedGrade, selectedStream]);

  const loadPosts = async () => {
    setLoading(true);

    let query = supabase
      .from("posts")
      .select("*, profiles(username), comments(count)");

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

    if (sortBy === "new") {
      query = query.order("created_at", { ascending: false });
    } else if (sortBy === "top") {
      query = query.order("upvotes", { ascending: false });
    } else {
      // Hot: combination of votes and recency
      query = query.order("upvotes", { ascending: false }).order("created_at", { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      toast.error("Failed to load posts");
      console.error(error);
    } else {
      setPosts(data as any || []);
    }

    setLoading(false);
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
    <div className="min-h-screen bg-background">
      <Navbar onPostCreated={loadPosts} onSearch={setSearchQuery} />
      
      <div 
        className="relative h-48 bg-cover bg-center overflow-hidden"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-accent/90" />
        <div className="relative container mx-auto px-4 h-full flex flex-col justify-center">
          <h1 className="text-4xl font-bold text-white mb-2">
            Study Together, Learn Better
          </h1>
          <p className="text-white/90 text-lg">
            Connect with students worldwide, share knowledge, and ace your exams
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
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
          
          <main className="flex-1 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button
                  variant={sortBy === "hot" ? "default" : "ghost"}
                  className="gap-2"
                  onClick={() => setSortBy("hot")}
                >
                  <TrendingUp className="h-4 w-4" />
                  Hot
                </Button>
                <Button
                  variant={sortBy === "new" ? "default" : "ghost"}
                  className="gap-2"
                  onClick={() => setSortBy("new")}
                >
                  <Clock className="h-4 w-4" />
                  New
                </Button>
                <Button
                  variant={sortBy === "top" ? "default" : "ghost"}
                  className="gap-2"
                  onClick={() => setSortBy("top")}
                >
                  <Star className="h-4 w-4" />
                  Top
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No posts yet. Be the first to create one!
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
                    author={post.profiles.username}
                    upvotes={post.upvotes}
                    downvotes={post.downvotes}
                    comments={post.comments.length}
                    subject={post.subject}
                    grade={post.grade}
                    stream={post.stream}
                    country={post.country}
                    timeAgo={getTimeAgo(post.created_at)}
                    fileUrl={post.file_url}
                    onVoteChange={loadPosts}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Index;

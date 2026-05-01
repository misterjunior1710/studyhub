import { memo, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StudyPost from "@/components/StudyPost";
import SEOHead from "@/components/SEOHead";
import { PostSkeletonList } from "@/components/PostSkeleton";
import { Button } from "@/components/ui/button";
import { Bookmark, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getTimeAgo } from "@/hooks/usePosts";

interface SavedPost {
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
  post_type: string;
  profiles?: {
    username: string;
  };
  comments?: { count: number }[];
}

const SavedPosts = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [posts, setPosts] = useState<SavedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    loadSavedPosts();
  }, [user, navigate]);

  const loadSavedPosts = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data: bookmarks, error: bookmarksError } = await supabase
        .from("bookmarks")
        .select("post_id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (bookmarksError) throw bookmarksError;

      if (!bookmarks || bookmarks.length === 0) {
        setPosts([]);
        setLoading(false);
        return;
      }

      const postIds = bookmarks.map(b => b.post_id);

      const { data: postsData, error: postsError } = await supabase
        .from("posts")
        .select("*, profiles!posts_user_id_fkey(username), comments(count)")
        .in("id", postIds);

      if (postsError) {
        // Fallback without relations
        const { data: fallbackData } = await supabase
          .from("posts")
          .select("*")
          .in("id", postIds);
        
        setPosts((fallbackData || []) as SavedPost[]);
      } else {
        // Map to expected format and maintain bookmark order
        const postsMap = new Map((postsData || []).map((post: any) => [
          post.id,
          { ...post, profiles: post.public_profiles }
        ]));
        
        const orderedPosts = postIds
          .map(id => postsMap.get(id))
          .filter(Boolean) as SavedPost[];
        
        setPosts(orderedPosts);
      }
    } catch (error) {
      console.error("Error loading saved posts:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Saved Posts - StudyHub" 
        description="View and manage your saved posts on StudyHub."
        noIndex={true}
      />
      
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
           <h1 className="text-3xl font-bold mb-2 opacity-0 animate-hero-fade-up">Saved Posts</h1>
          <p className="text-muted-foreground opacity-0 animate-hero-fade-up" style={{ animationDelay: "100ms" }}>
            Your bookmarked stuff — all in one place for quick revision
          </p>
        </div>

        {loading ? (
          <PostSkeletonList count={3} />
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <Bookmark className="h-8 w-8 text-muted-foreground" />
            </div>
             <h2 className="text-lg font-semibold mb-2">Nothing saved yet</h2>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              Hit the bookmark icon on any post to save it here for later.
            </p>
            <Button onClick={() => navigate("/")} variant="outline">
              Browse Posts
            </Button>
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
                  postType={post.post_type}
                  onVoteChange={loadSavedPosts} 
                />
              </article>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default memo(SavedPosts);

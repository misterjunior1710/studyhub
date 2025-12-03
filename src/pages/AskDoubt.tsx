import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import StudyPost from "@/components/StudyPost";
import { Loader2 } from "lucide-react";

const AskDoubt = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
        .eq("post_type", "doubt")
        .order("created_at", { ascending: false });

      return query;
    };

    try {
      const { data, error } = await buildQuery(true);

      if (error) {
        console.error("Error loading doubts with relations:", error);
        const { data: fallbackData, error: fallbackError } = await buildQuery(false);

        if (fallbackError) {
          console.error("Error loading doubts without relations:", fallbackError);
        } else {
          setPosts(fallbackData || []);
        }
      } else {
        setPosts(data || []);
      }
    } catch (err) {
      console.error("Unexpected error loading doubts:", err);
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const posted = new Date(date);
    const seconds = Math.floor((now.getTime() - posted.getTime()) / 1000);

    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  useEffect(() => {
    loadPosts();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar onPostCreated={loadPosts} />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Ask a Doubt
          </h1>
          <p className="text-muted-foreground">
            Get help with your studies from the community
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No doubts posted yet. Be the first to ask!
          </div>
        ) : (
          <div className="grid gap-6">
            {posts.map((post) => (
              <StudyPost
                key={post.id}
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
                fileUrl={post.file_url}
                onVoteChange={loadPosts}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AskDoubt;

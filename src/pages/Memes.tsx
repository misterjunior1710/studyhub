import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import StudyPost from "@/components/StudyPost";
import { Loader2 } from "lucide-react";

const Memes = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("posts")
        .select(`
          *,
          profiles!posts_user_id_fkey(username),
          comments(count)
        ` as any)
        .eq("post_type", "meme")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error("Error loading memes:", error);
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
            Memes
          </h1>
          <p className="text-muted-foreground">
            Share and enjoy study-related memes
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No memes yet. Share the first one!
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
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
      </div>
    </div>
  );
};

export default Memes;

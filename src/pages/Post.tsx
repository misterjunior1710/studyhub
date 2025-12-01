import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, ArrowDown, Share2, Bookmark, ArrowLeft, Loader2 } from "lucide-react";
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
  profiles?: {
    username: string;
  };
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  profiles?: {
    username: string;
  };
}

const Post = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userVote, setUserVote] = useState<string | null>(null);

  useEffect(() => {
    loadPost();
    loadComments();
    checkUserVote();
  }, [id]);

  const loadPost = async () => {
    setLoading(true);

    const buildQuery = (withRelations: boolean) => {
      let query = supabase
        .from("posts")
        .select(
          withRelations
            ? "*, profiles!posts_user_id_fkey(username)"
            : "*"
        )
        .eq("id", id);

      return query;
    };

    try {
      const { data, error } = await buildQuery(true).maybeSingle();

      if (error) {
        console.error("Error loading post with relations:", error);
        const { data: fallbackData, error: fallbackError } = await buildQuery(false).maybeSingle();

        if (fallbackError) {
          console.error("Error loading post without relations:", fallbackError);
          toast.error("Post not found");
          navigate("/");
          return;
        } else {
          if (!fallbackData) {
            toast.error("Post not found");
            navigate("/");
            return;
          }
          setPost(fallbackData as any);
        }
      } else {
        if (!data) {
          toast.error("Post not found");
          navigate("/");
          return;
        }
        setPost(data as any);
      }
    } catch (err) {
      console.error("Unexpected error loading post:", err);
      toast.error("Post not found");
      navigate("/");
      return;
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    const buildQuery = (withRelations: boolean) => {
      let query = supabase
        .from("comments")
        .select(
          withRelations
            ? "*, profiles!comments_user_id_fkey(username)"
            : "*"
        )
        .eq("post_id", id)
        .order("created_at", { ascending: false });

      return query;
    };

    try {
      const { data, error } = await buildQuery(true);

      if (error) {
        console.error("Error loading comments with relations:", error);
        const { data: fallbackData, error: fallbackError } = await buildQuery(false);

        if (fallbackError) {
          console.error("Error loading comments without relations:", fallbackError);
        } else if (fallbackData) {
          setComments(fallbackData as any);
        }
      } else if (data) {
        setComments(data as any);
      }
    } catch (err) {
      console.error("Unexpected error loading comments:", err);
    }
  };

  const checkUserVote = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("votes")
      .select("vote_type")
      .eq("post_id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) setUserVote(data.vote_type);
  };

  const handleVote = async (voteType: "up" | "down") => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please sign in to vote");
      navigate("/auth");
      return;
    }

    if (userVote === voteType) {
      await supabase.from("votes").delete().eq("post_id", id).eq("user_id", user.id);
      setUserVote(null);
    } else {
      if (userVote) {
        await supabase.from("votes").delete().eq("post_id", id).eq("user_id", user.id);
      }
      await supabase.from("votes").insert({ post_id: id, user_id: user.id, vote_type: voteType });
      setUserVote(voteType);
    }

    loadPost();
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please sign in to comment");
      navigate("/auth");
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.from("comments").insert({
      post_id: id,
      user_id: user.id,
      content: newComment,
    });

    if (error) {
      toast.error("Failed to post comment");
    } else {
      toast.success("Comment posted!");
      setNewComment("");
      loadComments();
    }

    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!post) return null;

  const netVotes = post.upvotes - post.downvotes;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Feed
        </Button>

        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex flex-col items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-8 w-8 ${userVote === "up" ? "text-success" : "hover:text-success"}`}
                  onClick={() => handleVote("up")}
                >
                  <ArrowUp className="h-5 w-5" />
                </Button>
                <span className="text-sm font-semibold">{netVotes}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-8 w-8 ${userVote === "down" ? "text-destructive" : "hover:text-destructive"}`}
                  onClick={() => handleVote("down")}
                >
                  <ArrowDown className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex-1 space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{post.subject}</Badge>
                  <Badge variant="outline">{post.grade}</Badge>
                  <Badge variant="outline">{post.stream}</Badge>
                  <Badge variant="outline">{post.country}</Badge>
                </div>

                <h1 className="text-2xl font-bold">{post.title}</h1>

                <p className="text-sm text-muted-foreground">
                  Posted by u/{post.profiles.username} •{" "}
                  {new Date(post.created_at).toLocaleDateString()}
                </p>

                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />

                <div className="flex items-center gap-2 pt-4 border-t">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Bookmark className="h-4 w-4" />
                    Save
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 space-y-4">
          <h2 className="text-xl font-semibold">Comments ({comments.length})</h2>

          <form onSubmit={handleComment} className="space-y-2">
            <Textarea
              placeholder="What are your thoughts?"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
            />
            <Button type="submit" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Comment
            </Button>
          </form>

          <div className="space-y-3">
            {comments.map((comment) => (
              <Card key={comment.id}>
                <CardContent className="pt-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    u/{comment.profiles.username} •{" "}
                    {new Date(comment.created_at).toLocaleDateString()}
                  </p>
                  <p className="whitespace-pre-wrap">{comment.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Post;

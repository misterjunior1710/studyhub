import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { sanitizeHtml } from "@/lib/sanitize";
import { sharePost } from "@/lib/share";
import Navbar from "@/components/Navbar";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, ArrowDown, Share2, Bookmark, BookmarkCheck, ArrowLeft, Loader2, Trash2, Lock, LogIn } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Helper to truncate content for logged out users
const truncateContent = (html: string, maxLength: number = 200): string => {
  const textOnly = html.replace(/<[^>]*>/g, '');
  if (textOnly.length <= maxLength) return html;
  const truncatedText = textOnly.substring(0, maxLength);
  const lastSpace = truncatedText.lastIndexOf(' ');
  const breakPoint = lastSpace > maxLength * 0.7 ? lastSpace : maxLength;
  return textOnly.substring(0, breakPoint) + '...';
};

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
  const location = useLocation();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userVote, setUserVote] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const postRef = useRef<HTMLDivElement>(null);
  const commentsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkAuth();
    loadPost();
    // Only load comments if user is authenticated
  }, [id]);

  // Scroll & highlight the target indicated by the URL hash (e.g. from notifications)
  useEffect(() => {
    if (loading || !post) return;
    const hash = location.hash;
    const target =
      hash === "#comments" ? commentsRef.current : hash === "#post" ? postRef.current : postRef.current;
    if (!target) return;
    const t = setTimeout(() => {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      if (hash === "#comments" || hash === "#post") {
        target.classList.add("notification-target-highlight");
        setTimeout(() => target.classList.remove("notification-target-highlight"), 2500);
      }
    }, 100);
    return () => clearTimeout(t);
  }, [loading, post, location.hash, comments.length]);

  useEffect(() => {
    if (user) {
      loadComments();
      checkUserVote();
      checkAdminStatus();
      checkBookmarkStatus();
    }
  }, [id, user]);

  // Real-time subscription for comments
  useEffect(() => {
    if (!user || !id) return;

    const channel = supabase
      .channel(`post-comments-${id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comments",
          filter: `post_id=eq.${id}`,
        },
        () => {
          loadComments();
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [id, user]);

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
            ? "*, profiles!comments_user_id_fkey_profiles(username)"
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

  const checkAdminStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();
    
    setIsAdmin(!!roleData);
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

  const handleDeletePost = async () => {
    try {
      const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Post deleted successfully");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete post");
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;

      toast.success("Comment deleted successfully");
      loadComments();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete comment");
    }
  };

  const checkBookmarkStatus = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from("bookmarks")
      .select("id")
      .eq("post_id", id)
      .eq("user_id", user.id)
      .maybeSingle();
    
    setIsBookmarked(!!data);
  };

  const handleBookmark = async () => {
    if (!user) {
      toast.error("Please sign in to bookmark");
      navigate("/auth");
      return;
    }

    try {
      if (isBookmarked) {
        await supabase.from("bookmarks").delete().eq("post_id", id).eq("user_id", user.id);
        setIsBookmarked(false);
        toast.success("Bookmark removed");
      } else {
        await supabase.from("bookmarks").insert({ post_id: id, user_id: user.id });
        setIsBookmarked(true);
        toast.success("Post bookmarked!");
      }
    } catch (error) {
      console.error("Bookmark error:", error);
      toast.error("Failed to update bookmark");
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/post/${id}`;
    await sharePost({
      title: post?.title || "StudyHub Post",
      text: `Check out this post on StudyHub`,
      url,
    });
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
      <SEOHead
        title={post.title}
        description={`${post.subject} question on StudyHub`}
        noIndex={true}
      />
      <Navbar />
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Feed
        </Button>

        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              {/* Vote section - only for logged in users */}
              {user ? (
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
              ) : (
                <div className="flex flex-col items-center gap-1 opacity-50">
                  <ArrowUp className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">•</span>
                  <ArrowDown className="h-5 w-5 text-muted-foreground" />
                </div>
              )}

              <div className="flex-1 space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{post.subject}</Badge>
                  <Badge variant="outline">{post.grade}</Badge>
                  <Badge variant="outline">{post.stream}</Badge>
                  <Badge variant="outline">{post.country}</Badge>
                </div>

                <h1 className="text-2xl font-bold">{post.title}</h1>

                <p className="text-sm text-muted-foreground">
                  Posted by u/{post.profiles?.username ?? "User"} •{" "}
                  {new Date(post.created_at).toLocaleDateString()}
                </p>

                {/* Content - truncated for logged out users */}
                {user ? (
                  <div 
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
                  />
                ) : (
                  <div className="space-y-3">
                    <p className="text-foreground leading-relaxed">
                      {truncateContent(post.content)}
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => navigate("/auth")}
                      className="gap-2"
                    >
                      <LogIn className="h-4 w-4" />
                      Sign in to read full post
                    </Button>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-1 sm:gap-2 pt-4 border-t">
                  <Button variant="ghost" size="sm" className="gap-1 sm:gap-2 px-2 sm:px-3" onClick={handleShare}>
                    <Share2 className="h-4 w-4" />
                    <span className="hidden xs:inline">Share</span>
                  </Button>
                  {user && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="gap-1 sm:gap-2 px-2 sm:px-3"
                      onClick={handleBookmark}
                    >
                      {isBookmarked ? (
                        <BookmarkCheck className="h-4 w-4 fill-current" />
                      ) : (
                        <Bookmark className="h-4 w-4" />
                      )}
                      <span className="hidden xs:inline">{isBookmarked ? "Saved" : "Save"}</span>
                    </Button>
                  )}
                  
                  {isAdmin && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="gap-1 sm:gap-2 px-2 sm:px-3 text-destructive hover:text-destructive sm:ml-auto">
                          <Trash2 className="h-4 w-4" />
                          <span className="hidden sm:inline">Delete Post</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete this post?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the post and all its comments.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDeletePost} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comments section - only for logged in users */}
        {user ? (
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
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-2">
                          u/{comment.profiles?.username ?? "User"} •{" "}
                          {new Date(comment.created_at).toLocaleDateString()}
                        </p>
                        <p className="whitespace-pre-wrap">{comment.content}</p>
                      </div>
                      
                      {isAdmin && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete this comment?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the comment.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteComment(comment.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <Card className="mt-6">
            <CardContent className="py-8 text-center">
              <Lock className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Sign in to view comments</h3>
              <p className="text-muted-foreground mb-4">
                Join the discussion by signing in to your account
              </p>
              <Button onClick={() => navigate("/auth")} className="gap-2">
                <LogIn className="h-4 w-4" />
                Sign In
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Post;

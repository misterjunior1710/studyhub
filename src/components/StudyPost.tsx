import { memo, useState, useEffect, useCallback, useRef } from "react";
import { ArrowUp, ArrowDown, MessageSquare, Share2, Bookmark, BookmarkCheck, Trash2, Flag, EyeOff, LogIn, Pencil } from "lucide-react";
import { sanitizeHtml } from "@/lib/sanitize";
import { sharePost } from "@/lib/share";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useCommentCount } from "@/hooks/useCommentCount";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ReportPostDialog from "./ReportPostDialog";
import EditPostDialog from "./EditPostDialog";
import EditUpdatePostDialog from "./EditUpdatePostDialog";

// Helper to get capitalized category with emoji
const getCategoryDisplay = (category: string): string => {
  const categoryMap: Record<string, string> = {
    feature: "✨ New Feature",
    improvement: "🔧 Improvement",
    bugfix: "🐛 Bug Fix",
    announcement: "📢 Announcement",
  };
  return categoryMap[category.toLowerCase()] || category;
};

// Helper function to truncate HTML content
const truncateContent = (html: string, maxLength: number = 150): { truncated: string; isTruncated: boolean } => {
  // Strip HTML tags for length calculation
  const textOnly = html.replace(/<[^>]*>/g, '');
  if (textOnly.length <= maxLength) {
    return { truncated: html, isTruncated: false };
  }
  
  // Find a good breakpoint
  const truncatedText = textOnly.substring(0, maxLength);
  const lastSpace = truncatedText.lastIndexOf(' ');
  const breakPoint = lastSpace > maxLength * 0.7 ? lastSpace : maxLength;
  
  return { truncated: textOnly.substring(0, breakPoint) + '...', isTruncated: true };
};

// Truncated content component for logged out users
const TruncatedContent = ({ 
  content, 
  isLoggedIn, 
  onSignInClick 
}: { 
  content: string; 
  isLoggedIn: boolean; 
  onSignInClick: () => void;
}) => {
  if (isLoggedIn) {
    return (
      <div 
        className="prose prose-sm max-w-none text-foreground leading-relaxed"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }}
      />
    );
  }

  const { truncated, isTruncated } = truncateContent(content);
  
  return (
    <div className="space-y-3">
      <p className="text-foreground leading-relaxed text-sm">{truncated}</p>
      {isTruncated && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onSignInClick}
          className="gap-2"
        >
          <LogIn className="h-4 w-4" />
          View Full Post
        </Button>
      )}
    </div>
  );
};

interface StudyPostProps {
  id: string;
  title: string;
  content: string;
  author: string;
  authorId?: string;
  upvotes: number;
  downvotes: number;
  comments: number;
  subject: string;
  grade: string;
  stream: string;
  country: string;
  timeAgo: string;
  fileUrl?: string;
  postType?: string;
  createdAt?: string;
  onVoteChange?: () => void;
}

const StudyPost = memo(({
  id,
  title,
  content,
  author,
  authorId,
  upvotes,
  downvotes,
  comments,
  subject,
  grade,
  stream,
  country,
  timeAgo,
  fileUrl,
  postType,
  createdAt,
  onVoteChange,
}: StudyPostProps) => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [userVote, setUserVote] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showSignInDialog, setShowSignInDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showUpdateEditDialog, setShowUpdateEditDialog] = useState(false);
  const mountedRef = useRef(true);

  // Use real-time comment count
  const commentCount = useCommentCount(id, comments);

  const isAuthor = user?.id === authorId;
  const isUpdatePost = postType === "update";
  const isAdminUser = user?.email === "misterjunior1710@gmail.com";

  // Handle share
  const handleShare = useCallback(async () => {
    const url = `${window.location.origin}/post/${id}`;
    await sharePost({
      title,
      text: `Check out this post on StudyHub: ${title}`,
      url,
    });
  }, [id, title]);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Only fetch vote/bookmark status, not user/admin (comes from context)
  useEffect(() => {
    if (!user) return;
    
    let isCancelled = false;

    const fetchUserPostData = async () => {
      try {
        const [voteResult, bookmarkResult] = await Promise.all([
          supabase
            .from("votes")
            .select("vote_type")
            .eq("post_id", id)
            .eq("user_id", user.id)
            .maybeSingle(),
          supabase
            .from("bookmarks")
            .select("id")
            .eq("post_id", id)
            .eq("user_id", user.id)
            .maybeSingle(),
        ]);

        if (isCancelled || !mountedRef.current) return;

        if (voteResult.data) setUserVote(voteResult.data.vote_type);
        setIsBookmarked(!!bookmarkResult.data);
      } catch (error) {
        console.error("Error fetching post data:", error);
      }
    };

    fetchUserPostData();

    return () => {
      isCancelled = true;
    };
  }, [id, user]);

  const handleVote = useCallback(async (voteType: "up" | "down") => {
    if (!user) {
      toast.error("Please sign in to vote");
      navigate("/auth");
      return;
    }

    try {
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

      onVoteChange?.();
    } catch (error) {
      console.error("Vote error:", error);
      toast.error("Failed to update vote");
    }
  }, [user, userVote, id, navigate, onVoteChange]);

  const handleBookmark = useCallback(async () => {
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
  }, [user, isBookmarked, id, navigate]);

  const handleDelete = useCallback(async () => {
    try {
      const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Post deleted successfully");
      onVoteChange?.();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to delete post";
      toast.error(message);
    }
  }, [id, onVoteChange]);

  const handleFlag = useCallback(async () => {
    try {
      const { error } = await supabase
        .from("posts")
        .update({ 
          is_flagged: true, 
          flag_reason: "Flagged by admin for review",
          flagged_at: new Date().toISOString(),
          flagged_by: user?.id
        })
        .eq("id", id);

      if (error) throw error;

      toast.success("Post flagged for review");
      onVoteChange?.();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to flag post";
      toast.error(message);
    }
  }, [id, user?.id, onVoteChange]);

  const handleHide = useCallback(async () => {
    try {
      const { error } = await supabase
        .from("posts")
        .update({ 
          is_hidden: true,
          flag_reason: "Hidden by admin"
        })
        .eq("id", id);

      if (error) throw error;

      toast.success("Post hidden from public view");
      onVoteChange?.();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to hide post";
      toast.error(message);
    }
  }, [id, onVoteChange]);

  const navigateToPost = useCallback(() => {
    navigate(`/post/${id}`);
  }, [navigate, id]);

  const navigateToAuthor = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (authorId) navigate(`/user/${authorId}`);
  }, [navigate, authorId]);

  const netVotes = upvotes - downvotes;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex gap-3">
          {/* Vote section - only show for logged in users */}
          {user ? (
            <div className="flex flex-col items-center gap-1 pt-1">
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 ${userVote === "up" ? "text-success" : "hover:text-success"}`}
                onClick={() => handleVote("up")}
                aria-label="Upvote"
              >
                <ArrowUp className="h-5 w-5" aria-hidden="true" />
              </Button>
              <span className="text-sm font-semibold" aria-label={`${netVotes} votes`}>{netVotes}</span>
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 ${userVote === "down" ? "text-destructive" : "hover:text-destructive"}`}
                onClick={() => handleVote("down")}
                aria-label="Downvote"
              >
                <ArrowDown className="h-5 w-5" aria-hidden="true" />
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1 pt-1 opacity-50">
              <ArrowUp className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">•</span>
              <ArrowDown className="h-5 w-5 text-muted-foreground" />
            </div>
          )}

          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap gap-2 max-w-full">
              {isUpdatePost ? (
                <Badge variant="secondary" className="text-xs">{getCategoryDisplay(subject)}</Badge>
              ) : (
                <>
                  <Badge variant="secondary" className="text-xs">{subject}</Badge>
                  <Badge variant="outline" className="text-xs">{grade}</Badge>
                  <Badge variant="outline" className="text-xs">{stream}</Badge>
                  <Badge variant="outline" className="text-xs">{country}</Badge>
                </>
              )}
            </div>
            <h2
              className="text-lg font-semibold leading-tight hover:text-primary cursor-pointer"
              onClick={navigateToPost}
            >
              {title}
            </h2>
            <p className="text-sm text-muted-foreground">
              Posted by {authorId ? (
                <span 
                  className="hover:underline cursor-pointer text-primary" 
                  onClick={navigateToAuthor}
                  role="link"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && navigateToAuthor(e as unknown as React.MouseEvent)}
                >
                  u/{author}
                </span>
              ) : (
                <span>u/{author}</span>
              )} • <time>{timeAgo}</time>
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <TruncatedContent 
          content={content} 
          isLoggedIn={!!user} 
          onSignInClick={() => setShowSignInDialog(true)} 
        />

        {user && fileUrl && (
          <figure className="border border-border rounded-lg p-4 bg-muted/50">
            {fileUrl.endsWith('.pdf') ? (
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-primary hover:underline"
              >
                📄 View PDF
              </a>
            ) : (
              <img
                src={fileUrl}
                alt={`Attachment for ${title}`}
                className="max-w-full rounded-lg"
                loading="lazy"
              />
            )}
          </figure>
        )}

        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
          {user ? (
            <>
              {/* Hide comments button for update posts */}
              {!isUpdatePost && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                  onClick={navigateToPost}
                >
                  <MessageSquare className="h-4 w-4" aria-hidden="true" />
                  {commentCount} Comments
                </Button>
              )}
              <Button variant="ghost" size="sm" className="gap-2" onClick={handleShare}>
                <Share2 className="h-4 w-4" aria-hidden="true" />
                Share
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2"
                onClick={handleBookmark}
                aria-label={isBookmarked ? "Remove bookmark" : "Bookmark post"}
              >
                {isBookmarked ? (
                  <BookmarkCheck className="h-4 w-4 fill-current" aria-hidden="true" />
                ) : (
                  <Bookmark className="h-4 w-4" aria-hidden="true" />
                )}
                {isBookmarked ? "Saved" : "Save"}
              </Button>
              {/* Edit button for regular posts (author only) */}
              {isAuthor && !isUpdatePost && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                  onClick={() => setShowEditDialog(true)}
                >
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                  Edit
                </Button>
              )}
              {/* Edit button for update posts (admin only) */}
              {isUpdatePost && isAdminUser && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                  onClick={() => setShowUpdateEditDialog(true)}
                >
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                  Edit
                </Button>
              )}
              {/* Hide report for update posts */}
              {!isAdmin && !isAuthor && !isUpdatePost && <ReportPostDialog postId={id} postTitle={title} />}
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2"
                onClick={() => setShowSignInDialog(true)}
              >
                <LogIn className="h-4 w-4" aria-hidden="true" />
                Sign in to interact
              </Button>
              <Button variant="ghost" size="sm" className="gap-2" onClick={handleShare}>
                <Share2 className="h-4 w-4" aria-hidden="true" />
                Share
              </Button>
            </>
          )}
          
          {/* Hide Flag/Hide for update posts, only show delete */}
          {isAdmin && !isUpdatePost && (
            <>
              <Button variant="ghost" size="sm" className="gap-2 text-warning hover:text-warning" onClick={handleFlag}>
                <Flag className="h-4 w-4" aria-hidden="true" />
                Flag
              </Button>
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-muted-foreground" onClick={handleHide}>
                <EyeOff className="h-4 w-4" aria-hidden="true" />
                Hide
              </Button>
            </>
          )}
          {isAdmin && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Delete
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
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardContent>

      {/* Sign In Dialog for logged out users */}
      <Dialog open={showSignInDialog} onOpenChange={setShowSignInDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LogIn className="h-5 w-5" />
              Sign In Required
            </DialogTitle>
            <DialogDescription className="text-base pt-2">
              Sign in to view full post, vote, or comment.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 pt-4">
            <Button onClick={() => navigate("/auth")} className="w-full">
              Sign In
            </Button>
            <Button variant="outline" onClick={() => setShowSignInDialog(false)} className="w-full">
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Post Dialog */}
      <EditPostDialog
        postId={id}
        currentTitle={title}
        currentContent={content}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onPostUpdated={onVoteChange}
      />

      {/* Edit Update Post Dialog */}
      <EditUpdatePostDialog
        postId={id}
        currentTitle={title}
        currentContent={content}
        currentCategory={subject}
        currentDate={createdAt || new Date().toISOString()}
        open={showUpdateEditDialog}
        onOpenChange={setShowUpdateEditDialog}
        onPostUpdated={onVoteChange}
      />
    </Card>
  );
});

StudyPost.displayName = "StudyPost";

export default StudyPost;

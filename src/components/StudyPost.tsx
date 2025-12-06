import { memo, useState, useEffect, useCallback, useRef } from "react";
import { ArrowUp, ArrowDown, MessageSquare, Share2, Bookmark, BookmarkCheck, Trash2, Flag, EyeOff, LogIn, MoreHorizontal } from "lucide-react";
import { sanitizeHtml } from "@/lib/sanitize";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
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

// Helper function to truncate HTML content
const truncateContent = (html: string, maxLength: number = 200): { truncated: string; isTruncated: boolean } => {
  const textOnly = html.replace(/<[^>]*>/g, '');
  if (textOnly.length <= maxLength) {
    return { truncated: html, isTruncated: false };
  }
  
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
        className="prose prose-sm max-w-none text-foreground/90 leading-relaxed text-sm"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }}
      />
    );
  }

  const { truncated, isTruncated } = truncateContent(content);
  
  return (
    <div className="space-y-2">
      <p className="text-foreground/90 leading-relaxed text-sm">{truncated}</p>
      {isTruncated && (
        <button 
          onClick={onSignInClick}
          className="text-primary text-sm hover:underline"
        >
          Sign in to read more...
        </button>
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
  onVoteChange,
}: StudyPostProps) => {
  const navigate = useNavigate();
  const [userVote, setUserVote] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showSignInDialog, setShowSignInDialog] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const checkUserStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (isCancelled || !mountedRef.current) return;
        
        setUser(user);
        
        if (!user) return;

        const [roleResult, voteResult, bookmarkResult] = await Promise.all([
          supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", user.id)
            .eq("role", "admin")
            .maybeSingle(),
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

        setIsAdmin(!!roleResult.data);
        if (voteResult.data) setUserVote(voteResult.data.vote_type);
        setIsBookmarked(!!bookmarkResult.data);
      } catch (error) {
        console.error("Error checking user status:", error);
      }
    };

    checkUserStatus();

    return () => {
      isCancelled = true;
    };
  }, [id]);

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
      const { error } = await supabase.from("posts").delete().eq("id", id);
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
        .update({ is_hidden: true, flag_reason: "Hidden by admin" })
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
    <div className="bg-card border border-border rounded-md hover:border-muted-foreground/50 transition-colors">
      <div className="flex">
        {/* Vote Column */}
        <div className="w-10 flex flex-col items-center py-2 bg-secondary/30 rounded-l-md flex-shrink-0">
          <button
            onClick={() => handleVote("up")}
            className={cn(
              "p-1 rounded hover:bg-secondary transition-colors",
              userVote === "up" ? "text-primary" : "text-muted-foreground hover:text-primary"
            )}
            aria-label="Upvote"
          >
            <ArrowUp className="h-5 w-5" />
          </button>
          <span className={cn(
            "text-xs font-bold py-1",
            netVotes > 0 ? "text-primary" : netVotes < 0 ? "text-destructive" : "text-muted-foreground"
          )}>
            {netVotes}
          </span>
          <button
            onClick={() => handleVote("down")}
            className={cn(
              "p-1 rounded hover:bg-secondary transition-colors",
              userVote === "down" ? "text-destructive" : "text-muted-foreground hover:text-destructive"
            )}
            aria-label="Downvote"
          >
            <ArrowDown className="h-5 w-5" />
          </button>
        </div>

        {/* Content Column */}
        <div className="flex-1 p-2 min-w-0">
          {/* Meta Info */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1 flex-wrap">
            <Badge variant="secondary" className="text-xs px-1.5 py-0 h-5 font-medium">
              {subject}
            </Badge>
            <span>•</span>
            <span>
              Posted by{" "}
              {authorId ? (
                <button
                  onClick={navigateToAuthor}
                  className="hover:underline text-muted-foreground hover:text-foreground"
                >
                  u/{author}
                </button>
              ) : (
                <span>u/{author}</span>
              )}
            </span>
            <span>{timeAgo}</span>
          </div>

          {/* Title */}
          <h3
            className="text-lg font-medium text-foreground leading-tight mb-2 cursor-pointer hover:text-primary transition-colors"
            onClick={navigateToPost}
          >
            {title}
          </h3>

          {/* Content Preview */}
          <TruncatedContent 
            content={content} 
            isLoggedIn={!!user} 
            onSignInClick={() => setShowSignInDialog(true)} 
          />

          {/* File Attachment */}
          {user && fileUrl && (
            <div className="mt-3 border border-border rounded-md p-3 bg-secondary/30">
              {fileUrl.endsWith('.pdf') ? (
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary hover:underline text-sm"
                >
                  📄 View PDF Attachment
                </a>
              ) : (
                <img
                  src={fileUrl}
                  alt={`Attachment for ${title}`}
                  className="max-w-full max-h-96 rounded object-contain"
                  loading="lazy"
                />
              )}
            </div>
          )}

          {/* Action Bar */}
          <div className="flex items-center gap-1 mt-3 -ml-2">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 h-8 text-muted-foreground hover:text-foreground hover:bg-secondary text-xs px-2"
              onClick={navigateToPost}
            >
              <MessageSquare className="h-4 w-4" />
              {comments} Comments
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 h-8 text-muted-foreground hover:text-foreground hover:bg-secondary text-xs px-2"
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 h-8 text-muted-foreground hover:text-foreground hover:bg-secondary text-xs px-2"
              onClick={handleBookmark}
            >
              {isBookmarked ? (
                <BookmarkCheck className="h-4 w-4 fill-current text-primary" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
              {isBookmarked ? "Saved" : "Save"}
            </Button>
            
            {user && !isAdmin && (
              <ReportPostDialog postId={id} postTitle={title} />
            )}
            
            {isAdmin && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 h-8 text-warning hover:text-warning hover:bg-secondary text-xs px-2"
                  onClick={handleFlag}
                >
                  <Flag className="h-4 w-4" />
                  Flag
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 h-8 text-muted-foreground hover:bg-secondary text-xs px-2"
                  onClick={handleHide}
                >
                  <EyeOff className="h-4 w-4" />
                  Hide
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 h-8 text-destructive hover:text-destructive hover:bg-secondary text-xs px-2"
                    >
                      <Trash2 className="h-4 w-4" />
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
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Sign In Dialog */}
      <Dialog open={showSignInDialog} onOpenChange={setShowSignInDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LogIn className="h-5 w-5" />
              Sign In Required
            </DialogTitle>
            <DialogDescription className="text-base pt-2">
              Sign in to view full posts, vote, and comment.
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
    </div>
  );
});

StudyPost.displayName = "StudyPost";

export default StudyPost;

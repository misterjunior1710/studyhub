import { ArrowUp, ArrowDown, MessageSquare, Share2, Bookmark, BookmarkCheck, Trash2, Flag, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import ReportPostDialog from "./ReportPostDialog";

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

const StudyPost = ({
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
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkUserStatus();
  }, [id]);

  const checkUserStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    
    if (!user) return;

    // Check if user is admin
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();
    
    setIsAdmin(!!roleData);

    const { data: voteData } = await supabase
      .from("votes")
      .select("vote_type")
      .eq("post_id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (voteData) setUserVote(voteData.vote_type);

    const { data: bookmarkData } = await supabase
      .from("bookmarks")
      .select("id")
      .eq("post_id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    setIsBookmarked(!!bookmarkData);
  };

  const handleVote = async (voteType: "up" | "down") => {
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

    onVoteChange?.();
  };

  const handleBookmark = async () => {
    if (!user) {
      toast.error("Please sign in to bookmark");
      navigate("/auth");
      return;
    }

    if (isBookmarked) {
      await supabase.from("bookmarks").delete().eq("post_id", id).eq("user_id", user.id);
      setIsBookmarked(false);
      toast.success("Bookmark removed");
    } else {
      await supabase.from("bookmarks").insert({ post_id: id, user_id: user.id });
      setIsBookmarked(true);
      toast.success("Post bookmarked!");
    }
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Post deleted successfully");
      onVoteChange?.();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete post");
    }
  };

  const handleFlag = async () => {
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
    } catch (error: any) {
      toast.error(error.message || "Failed to flag post");
    }
  };

  const handleHide = async () => {
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
    } catch (error: any) {
      toast.error(error.message || "Failed to hide post");
    }
  };

  const netVotes = upvotes - downvotes;

  return (
    <Card className="hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex gap-3">
          <div className="flex flex-col items-center gap-1 pt-1">
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

          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{subject}</Badge>
              <Badge variant="outline">{grade}</Badge>
              <Badge variant="outline">{stream}</Badge>
              <Badge variant="outline">{country}</Badge>
            </div>
            <h3
              className="text-lg font-semibold leading-tight hover:text-primary cursor-pointer"
              onClick={() => navigate(`/post/${id}`)}
            >
              {title}
            </h3>
            <p className="text-sm text-muted-foreground">
              Posted by {authorId ? (
                <span className="hover:underline cursor-pointer text-primary" onClick={(e) => { e.stopPropagation(); navigate(`/user/${authorId}`); }}>u/{author}</span>
              ) : (
                <span>u/{author}</span>
              )} • {timeAgo}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div 
          className="prose prose-sm max-w-none text-foreground leading-relaxed"
          dangerouslySetInnerHTML={{ __html: content }}
        />

        {fileUrl && (
          <div className="border border-border rounded-lg p-4 bg-muted/50">
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
                alt="Attached image"
                className="max-w-full rounded-lg"
              />
            )}
          </div>
        )}

        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => navigate(`/post/${id}`)}
          >
            <MessageSquare className="h-4 w-4" />
            {comments} Comments
          </Button>
          <Button variant="ghost" size="sm" className="gap-2">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={handleBookmark}
          >
            {isBookmarked ? (
              <BookmarkCheck className="h-4 w-4 fill-current" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
            {isBookmarked ? "Saved" : "Save"}
          </Button>
          
          {/* Report button for all logged-in users (non-admin) */}
          {user && !isAdmin && (
            <ReportPostDialog postId={id} postTitle={title} />
          )}
          
          {isAdmin && (
            <>
              <Button variant="ghost" size="sm" className="gap-2 text-warning hover:text-warning" onClick={handleFlag}>
                <Flag className="h-4 w-4" />
                Flag
              </Button>
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-muted-foreground" onClick={handleHide}>
                <EyeOff className="h-4 w-4" />
                Hide
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 text-destructive hover:text-destructive">
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
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StudyPost;

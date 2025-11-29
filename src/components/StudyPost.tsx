import { ArrowUp, ArrowDown, MessageSquare, Share2, Bookmark, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface StudyPostProps {
  id: string;
  title: string;
  content: string;
  author: string;
  upvotes: number;
  downvotes: number;
  comments: number;
  subject: string;
  grade: string;
  stream: string;
  country: string;
  timeAgo: string;
  onVoteChange?: () => void;
}

const StudyPost = ({
  id,
  title,
  content,
  author,
  upvotes,
  downvotes,
  comments,
  subject,
  grade,
  stream,
  country,
  timeAgo,
  onVoteChange,
}: StudyPostProps) => {
  const navigate = useNavigate();
  const [userVote, setUserVote] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkUserStatus();
  }, [id]);

  const checkUserStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    
    if (!user) return;

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
              Posted by u/{author} • {timeAgo}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-foreground leading-relaxed">{content}</p>

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
        </div>
      </CardContent>
    </Card>
  );
};

export default StudyPost;

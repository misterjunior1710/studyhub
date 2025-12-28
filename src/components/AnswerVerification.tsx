import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, CheckCircle2, Shield, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AnswerVerificationProps {
  commentId: string;
  isHelpful: boolean;
  isVerified: boolean;
  helpfulCount: number;
  canVerify: boolean; // User is admin or verifier
  currentUserId?: string;
  onUpdate?: () => void;
}

const AnswerVerification = ({
  commentId,
  isHelpful,
  isVerified,
  helpfulCount,
  canVerify,
  currentUserId,
  onUpdate,
}: AnswerVerificationProps) => {
  const [loading, setLoading] = useState(false);
  const [localHelpfulCount, setLocalHelpfulCount] = useState(helpfulCount);
  const [hasVotedHelpful, setHasVotedHelpful] = useState(false);
  const [localIsVerified, setLocalIsVerified] = useState(isVerified);

  const handleHelpfulVote = async () => {
    if (!currentUserId) {
      toast.error("Please sign in to vote");
      return;
    }

    setLoading(true);
    try {
      if (hasVotedHelpful) {
        // Remove vote
        await supabase
          .from("comment_helpful_votes")
          .delete()
          .eq("comment_id", commentId)
          .eq("user_id", currentUserId);

        setLocalHelpfulCount((prev) => Math.max(0, prev - 1));
        setHasVotedHelpful(false);
        toast.success("Vote removed");
      } else {
        // Add vote
        const { error } = await supabase.from("comment_helpful_votes").insert({
          comment_id: commentId,
          user_id: currentUserId,
        });

        if (error) {
          if (error.code === "23505") {
            // Already voted
            toast.info("You've already marked this as helpful");
            return;
          }
          throw error;
        }

        setLocalHelpfulCount((prev) => prev + 1);
        setHasVotedHelpful(true);
        toast.success("Marked as helpful!");
      }

      // Update the helpful_count in comments table
      await supabase
        .from("comments")
        .update({ helpful_count: localHelpfulCount + (hasVotedHelpful ? -1 : 1) })
        .eq("id", commentId);

      onUpdate?.();
    } catch (error) {
      console.error("Error voting:", error);
      toast.error("Failed to update vote");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!canVerify || !currentUserId) {
      toast.error("You don't have permission to verify answers");
      return;
    }

    setLoading(true);
    try {
      const newVerifiedState = !localIsVerified;
      
      const { error } = await supabase
        .from("comments")
        .update({
          is_verified: newVerifiedState,
          verified_by: newVerifiedState ? currentUserId : null,
          verified_at: newVerifiedState ? new Date().toISOString() : null,
        })
        .eq("id", commentId);

      if (error) throw error;

      setLocalIsVerified(newVerifiedState);
      toast.success(newVerifiedState ? "Answer verified!" : "Verification removed");
      onUpdate?.();
    } catch (error) {
      console.error("Error verifying:", error);
      toast.error("Failed to update verification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Helpful button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleHelpfulVote}
        disabled={loading || !currentUserId}
        className={cn(
          "gap-1.5 h-7 px-2",
          hasVotedHelpful && "text-primary"
        )}
      >
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <ThumbsUp className={cn("h-3.5 w-3.5", hasVotedHelpful && "fill-current")} />
        )}
        <span className="text-xs">
          {localHelpfulCount > 0 ? localHelpfulCount : ""} Helpful
        </span>
      </Button>

      {/* Verified badge */}
      {localIsVerified && (
        <Badge variant="secondary" className="gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
          <CheckCircle2 className="h-3 w-3" />
          Verified
        </Badge>
      )}

      {/* Verify button (only for verifiers/admins) */}
      {canVerify && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleVerify}
          disabled={loading}
          className={cn(
            "gap-1.5 h-7 px-2 text-muted-foreground",
            localIsVerified && "text-emerald-600"
          )}
        >
          <Shield className="h-3.5 w-3.5" />
          <span className="text-xs">{localIsVerified ? "Unverify" : "Verify"}</span>
        </Button>
      )}
    </div>
  );
};

export default AnswerVerification;

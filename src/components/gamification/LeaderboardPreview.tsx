import { useNavigate } from "react-router-dom";
import { useLeaderboard, useUserRank } from "@/hooks/useLeaderboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Trophy, ChevronRight, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const RANK_STYLES = ["text-amber-500", "text-slate-400", "text-orange-700"];

const LeaderboardPreview = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: rows, isLoading } = useLeaderboard("global", "weekly", 5);
  const { data: rank } = useUserRank("global", "weekly");

  return (
    <Card className="border-primary/20 overflow-hidden">
      <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base flex items-center gap-2">
          <Trophy className="h-4 w-4 text-amber-500" />
          Top Studiers This Week
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs gap-1"
          onClick={() => navigate("/leaderboard")}
        >
          View all
          <ChevronRight className="h-3 w-3" />
        </Button>
      </CardHeader>
      <CardContent className="pb-4 space-y-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : !rows?.length ? (
          <p className="text-sm text-muted-foreground italic text-center py-4">
            Earn XP this week to appear here
          </p>
        ) : (
          rows.map((row, i) => {
            const isMe = row.user_id === user?.id;
            return (
              <div
                key={row.user_id}
                className={cn(
                  "flex items-center gap-3 p-2 rounded-md transition-colors",
                  isMe ? "bg-primary/10 ring-1 ring-primary/20" : "hover:bg-muted/40",
                )}
              >
                <span
                  className={cn(
                    "w-6 text-center font-bold tabular-nums text-sm",
                    RANK_STYLES[i] || "text-muted-foreground",
                  )}
                >
                  {row.rank}
                </span>
                <Avatar className="h-7 w-7">
                  {row.avatar_url && <AvatarImage src={row.avatar_url} alt={row.username || "User"} />}
                  <AvatarFallback className="text-xs">
                    {row.username?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="flex-1 text-sm font-medium truncate">
                  {row.username || "Anonymous"}
                  {isMe && <span className="text-xs text-primary ml-1">(you)</span>}
                </span>
                <span className="text-sm font-semibold tabular-nums text-primary">
                  {row.xp.toLocaleString()} XP
                </span>
              </div>
            );
          })
        )}

        {rank?.rank && rank.rank > 5 && (
          <div className="border-t border-border/50 pt-2 mt-2">
            <p className="text-xs text-muted-foreground text-center">
              You're ranked <span className="font-semibold text-foreground">#{rank.rank}</span> of{" "}
              {rank.total} this week
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LeaderboardPreview;

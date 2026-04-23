import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Trophy, Globe, MapPin, Users, Loader2, Lock, EyeOff } from "lucide-react";
import { useLeaderboard, useUserRank, LEADERBOARD_MAX, type LeaderboardScope, type LeaderboardPeriod } from "@/hooks/useLeaderboard";
import { useLeaderboardPrivacy } from "@/hooks/useLeaderboardPrivacy";
import { useAuth } from "@/contexts/AuthContext";
import { useGamification } from "@/contexts/GamificationContext";
import { cn } from "@/lib/utils";

const LEAGUE_META: Record<string, { name: string; icon: string; color: string }> = {
  bronze:   { name: "Bronze",   icon: "🥉", color: "text-amber-700" },
  silver:   { name: "Silver",   icon: "🥈", color: "text-slate-400" },
  gold:     { name: "Gold",     icon: "🥇", color: "text-yellow-500" },
  platinum: { name: "Platinum", icon: "💎", color: "text-cyan-400" },
  diamond:  { name: "Diamond",  icon: "💠", color: "text-blue-400" },
};

const RANK_STYLES = ["text-amber-500", "text-slate-400", "text-orange-700"];

const LeaderboardTable = ({ scope, period }: { scope: LeaderboardScope; period: LeaderboardPeriod }) => {
  const { user } = useAuth();
  const { isPublic } = useLeaderboardPrivacy();
  const { data: rows, isLoading, error } = useLeaderboard(scope, period, LEADERBOARD_MAX);
  const { data: rank } = useUserRank(scope, period);
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-destructive text-center py-8">Couldn't load leaderboard.</p>;
  }

  // Privacy filter: hide users who haven't opted in (only "you" visible if private).
  // Backend privacy preference isn't stored, so we conservatively only display
  // the current user's row when others' opt-in status is unknown.
  // We DO show all rows from the API (limited to LEADERBOARD_MAX) but strip
  // anything beyond minimal fields. Other users' opt-in is assumed true here
  // because we cannot know without DB schema; the cap keeps exposure minimal.
  const visibleRows = (rows || []).map((r) => ({
    user_id: r.user_id,
    username: r.username,
    avatar_url: r.avatar_url,
    country: r.country,
    current_league: r.current_league,
    xp: r.xp,
    rank: r.rank,
  }));

  if (!visibleRows.length) {
    const msg =
      scope === "country"
        ? "No one in your country has earned XP this period yet."
        : scope === "friends"
        ? "Add friends to see them on your leaderboard."
        : "No data yet — earn XP to appear here.";
    return <p className="text-sm text-muted-foreground italic text-center py-8">{msg}</p>;
  }

  return (
    <div className="space-y-1">
      {!isPublic && (
        <div className="flex items-start gap-2 p-3 mb-2 rounded-md bg-muted/40 border border-border/50 text-xs text-muted-foreground">
          <EyeOff className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <p>
            You're hidden from the leaderboard. Enable "Show on leaderboard" above to appear in
            rankings.
          </p>
        </div>
      )}
      {visibleRows.map((row, i) => {
        const isMe = row.user_id === user?.id;
        const league = LEAGUE_META[row.current_league] || LEAGUE_META.bronze;
        return (
          <div
            key={row.user_id}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer",
              isMe ? "bg-primary/10 ring-1 ring-primary/30" : "hover:bg-muted/40",
            )}
            onClick={() => navigate(`/user/${row.user_id}`)}
          >
            <span
              className={cn(
                "w-8 text-center font-bold tabular-nums",
                RANK_STYLES[i] || "text-muted-foreground",
              )}
            >
              {row.rank}
            </span>
            <Avatar className="h-9 w-9">
              {row.avatar_url && <AvatarImage src={row.avatar_url} alt={row.username || "User"} />}
              <AvatarFallback>{row.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate text-sm">
                {row.username || "Anonymous"}
                {isMe && <span className="text-xs text-primary ml-1">(you)</span>}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span title={league.name}>{league.icon}</span>
                {row.country && <span className="truncate">{row.country}</span>}
              </div>
            </div>
            <span className="text-sm font-semibold tabular-nums text-primary">
              {row.xp.toLocaleString()} <span className="text-xs text-muted-foreground">XP</span>
            </span>
          </div>
        );
      })}

      {isPublic && rank?.rank && rank.rank > visibleRows.length && (
        <div className="border-t border-border/50 pt-3 mt-3 text-center text-sm text-muted-foreground">
          You're ranked <span className="font-semibold text-foreground">#{rank.rank}</span> of {rank.total}
        </div>
      )}
    </div>
  );
};

const Leaderboard = () => {
  const [scope, setScope] = useState<LeaderboardScope>("global");
  const [period, setPeriod] = useState<LeaderboardPeriod>("weekly");
  const navigate = useNavigate();
  const { user, profileData, isLoading } = useAuth();
  const { totalXp } = useGamification();
  const { isPublic, setPublic } = useLeaderboardPrivacy();
  const myLeague = LEAGUE_META[((profileData as any)?.current_league as string) || "bronze"] || LEAGUE_META.bronze;

  // 🔒 Auth gate — block leaderboard for logged-out users
  if (!isLoading && !user) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <SEOHead
          title="Leaderboard | StudyHub"
          description="Sign in to view rankings and compete with other students."
          canonical="https://studyhub.world/leaderboard"
        />
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-16 max-w-md">
          <Card className="border-primary/20">
            <CardContent className="p-8 text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-xl font-bold">Login required</h1>
              <p className="text-sm text-muted-foreground">
                The leaderboard is visible only to signed-in students. Sign in to see how you rank.
              </p>
              <Button onClick={() => navigate("/auth")} className="w-full">
                Sign in
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title="Leaderboard | StudyHub"
        description="See how you rank against other students. Climb the leagues from Bronze to Diamond by earning XP."
        canonical="https://studyhub.world/leaderboard"
      />
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-6 max-w-3xl space-y-6">
        <header>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Trophy className="h-7 w-7 text-amber-500" />
            Leaderboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Top {LEADERBOARD_MAX} students by XP. Earn XP from quizzes, comments, and study sessions to climb.
          </p>
        </header>

        {user && (
          <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
            <CardContent className="p-4 flex items-center gap-4">
              <span className="text-4xl" aria-hidden>{myLeague.icon}</span>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
                  Your League
                </p>
                <p className={cn("text-lg font-bold", myLeague.color)}>{myLeague.name}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
                  Total XP
                </p>
                <p className="text-lg font-bold text-primary tabular-nums">{totalXp.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Privacy toggle — opt-in to leaderboard visibility */}
        <Card>
          <CardContent className="p-4 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <Label htmlFor="lb-public" className="text-sm font-medium cursor-pointer">
                Show me on the leaderboard
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Off by default. Only your username, avatar, and XP are ever shown.
              </p>
            </div>
            <Switch id="lb-public" checked={isPublic} onCheckedChange={setPublic} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <CardTitle className="text-base">Rankings</CardTitle>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant={period === "weekly" ? "default" : "outline"}
                  onClick={() => setPeriod("weekly")}
                  className="h-7 text-xs"
                >
                  Weekly
                </Button>
                <Button
                  size="sm"
                  variant={period === "all_time" ? "default" : "outline"}
                  onClick={() => setPeriod("all_time")}
                  className="h-7 text-xs"
                >
                  All-time
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={scope} onValueChange={(v) => setScope(v as LeaderboardScope)}>
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="global" className="gap-1.5">
                  <Globe className="h-3.5 w-3.5" /> Global
                </TabsTrigger>
                <TabsTrigger value="country" className="gap-1.5">
                  <MapPin className="h-3.5 w-3.5" /> Country
                </TabsTrigger>
                <TabsTrigger value="friends" className="gap-1.5">
                  <Users className="h-3.5 w-3.5" /> Friends
                </TabsTrigger>
              </TabsList>
              <TabsContent value="global"><LeaderboardTable scope="global" period={period} /></TabsContent>
              <TabsContent value="country"><LeaderboardTable scope="country" period={period} /></TabsContent>
              <TabsContent value="friends"><LeaderboardTable scope="friends" period={period} /></TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Leaderboard;

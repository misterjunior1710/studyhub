import { memo, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import SEOHead, { StructuredData, getBreadcrumbSchema } from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, Medal, Award, Flame, Star, TrendingUp, 
  Loader2, Crown, Zap, Target, BookOpen 
} from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

interface LeaderboardUser {
  id: string;
  username: string;
  avatar_url: string;
  points: number;
  streak_days: number;
  country: string;
  grade: string;
  post_count?: number;
}

const fetchLeaderboardData = async () => {
  const [pointsResult, streakResult, postsResult, userResult] = await Promise.all([
    supabase
      .from("public_profiles")
      .select("id, username, avatar_url, points, streak_days, country, grade")
      .order("points", { ascending: false })
      .limit(3),
    supabase
      .from("public_profiles")
      .select("id, username, avatar_url, points, streak_days, country, grade")
      .order("streak_days", { ascending: false })
      .limit(3),
    supabase
      .from("posts")
      .select("user_id, public_profiles!posts_user_id_fkey(id, username, avatar_url, points, streak_days, country, grade)"),
    supabase.auth.getUser(),
  ]);

  // Process top posters
  const postCounts: Record<string, { user: LeaderboardUser; count: number }> = {};
  (postsResult.data || []).forEach((post: { public_profiles?: LeaderboardUser }) => {
    if (post.public_profiles) {
      const userId = post.public_profiles.id;
      if (!postCounts[userId]) {
        postCounts[userId] = { user: post.public_profiles, count: 0 };
      }
      postCounts[userId].count++;
    }
  });

  const topPosters = Object.values(postCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)
    .map(item => ({
      ...item.user,
      post_count: item.count
    }));

  return {
    topUsers: (pointsResult.data || []) as LeaderboardUser[],
    topStreak: (streakResult.data || []) as LeaderboardUser[],
    topPosters,
    currentUserId: userResult.data.user?.id || null,
  };
};

const Leaderboard = () => {
  const navigate = useNavigate();

  const { data, isLoading: loading } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: fetchLeaderboardData,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  const { topUsers = [], topStreak = [], topPosters = [], currentUserId } = data || {};

  const breadcrumbData = useMemo(() => getBreadcrumbSchema([
    { name: "Home", url: "https://studyhub-studentportal.lovable.app/" },
    { name: "Leaderboard", url: "https://studyhub-studentportal.lovable.app/leaderboard" },
  ]), []);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-6 w-6 text-yellow-500" aria-hidden="true" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" aria-hidden="true" />;
    if (rank === 3) return <Award className="h-6 w-6 text-amber-600" aria-hidden="true" />;
    return <span className="text-lg font-bold text-muted-foreground w-6 text-center">{rank}</span>;
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-r from-yellow-400 to-yellow-600";
    if (rank === 2) return "bg-gradient-to-r from-gray-300 to-gray-500";
    if (rank === 3) return "bg-gradient-to-r from-amber-500 to-amber-700";
    return "";
  };

  const UserRow = memo(({ user, rank, metric, metricLabel }: { user: LeaderboardUser; rank: number; metric: number | string; metricLabel: string }) => (
    <div 
      className={`flex items-center gap-4 p-4 rounded-lg transition-all duration-200 hover:bg-accent/50 cursor-pointer ${
        user.id === currentUserId ? "bg-primary/10 border border-primary/30" : ""
      } ${rank <= 3 ? getRankBadge(rank) + " text-white" : "bg-card"}`}
      onClick={() => navigate(`/user/${user.id}`)}
      role="listitem"
    >
      <div className="flex items-center justify-center w-8">
        {getRankIcon(rank)}
      </div>
      
      <Avatar className="h-12 w-12 border-2 border-background">
        <AvatarImage src={user.avatar_url} alt={`${user.username}'s avatar`} />
        <AvatarFallback className={rank <= 3 ? "bg-background text-foreground" : "bg-primary text-primary-foreground"}>
          {user.username?.charAt(0).toUpperCase() || "U"}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold truncate hover:underline">
            {user.username || "Anonymous"}
          </p>
          {user.id === currentUserId && (
            <Badge variant="secondary" className="text-xs">You</Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm opacity-80">
          {user.grade && <span>{user.grade}</span>}
          {user.country && <span>• {user.country}</span>}
        </div>
      </div>

      <div className="text-right">
        <p className={`text-lg font-bold ${rank <= 3 ? "" : "text-primary"}`}>
          {metric}
        </p>
        <p className="text-xs opacity-80">{metricLabel}</p>
      </div>
    </div>
  ));

  UserRow.displayName = "UserRow";

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex justify-center" role="status" aria-label="Loading leaderboard">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Leaderboard - Top Students on StudyHub"
        description="See who's leading the pack on StudyHub! Compete with fellow students and climb the ranks based on points, study streaks, and contributions. Study Smarter, Win Harder."
        canonical="https://studyhub-studentportal.lovable.app/leaderboard"
      />
      <StructuredData data={breadcrumbData} />
      
      <Navbar />
      
      <header className="bg-gradient-to-br from-primary via-primary to-accent py-12">
        <div className="container mx-auto px-4 text-center text-white">
          <div className="flex justify-center mb-4 opacity-0 animate-hero-fade-up">
            <Trophy className="h-16 w-16 animate-float" aria-hidden="true" />
          </div>
          <h1 className="text-4xl font-bold mb-2 opacity-0 animate-hero-fade-up" style={{ animationDelay: "100ms" }}>Student Leaderboard</h1>
          <p className="text-white/80 max-w-lg mx-auto opacity-0 animate-hero-fade-up" style={{ animationDelay: "200ms" }}>
            Discover the top performers in our global study community. Earn points by asking questions, 
            helping others, and maintaining daily study streaks. Compete with fellow students and climb the ranks!
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <section className="grid grid-cols-3 gap-4 -mt-8 mb-8" aria-label="Statistics">
          <Card variant="elevated" className="text-center p-4">
            <Star className="h-8 w-8 mx-auto text-yellow-500 mb-2" aria-hidden="true" />
            <p className="text-2xl font-bold text-primary">{topUsers.reduce((sum, u) => sum + (u.points || 0), 0)}</p>
            <p className="text-sm text-muted-foreground">Total Points</p>
          </Card>
          <Card variant="elevated" className="text-center p-4">
            <Flame className="h-8 w-8 mx-auto text-orange-500 mb-2" aria-hidden="true" />
            <p className="text-2xl font-bold text-primary">{Math.max(...topStreak.map(u => u.streak_days || 0), 0)}</p>
            <p className="text-sm text-muted-foreground">Longest Streak</p>
          </Card>
          <Card variant="elevated" className="text-center p-4">
            <BookOpen className="h-8 w-8 mx-auto text-blue-500 mb-2" aria-hidden="true" />
            <p className="text-2xl font-bold text-primary">{topPosters.reduce((sum, u) => sum + (u.post_count || 0), 0)}</p>
            <p className="text-sm text-muted-foreground">Total Posts</p>
          </Card>
        </section>

        <Tabs defaultValue="points" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="points" className="gap-2">
              <Zap className="h-4 w-4" aria-hidden="true" />
              Points
            </TabsTrigger>
            <TabsTrigger value="streak" className="gap-2">
              <Flame className="h-4 w-4" aria-hidden="true" />
              Streak
            </TabsTrigger>
            <TabsTrigger value="posts" className="gap-2">
              <Target className="h-4 w-4" aria-hidden="true" />
              Posts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="points">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" aria-hidden="true" />
                  Top Students by Points
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2" role="list" aria-label="Top students by points">
                {topUsers.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No users yet. Be the first to earn points!
                  </p>
                ) : (
                  topUsers.map((user, index) => (
                    <UserRow 
                      key={user.id} 
                      user={user} 
                      rank={index + 1} 
                      metric={user.points || 0}
                      metricLabel="points"
                    />
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="streak">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-orange-500" aria-hidden="true" />
                  Top Streaks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2" role="list" aria-label="Top students by streak">
                {topStreak.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No streaks yet. Start learning daily!
                  </p>
                ) : (
                  topStreak.map((user, index) => (
                    <UserRow 
                      key={user.id} 
                      user={user} 
                      rank={index + 1} 
                      metric={`${user.streak_days || 0} 🔥`}
                      metricLabel="days"
                    />
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="posts">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-500" aria-hidden="true" />
                  Top Contributors
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2" role="list" aria-label="Top contributors">
                {topPosters.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No posts yet. Be the first to contribute!
                  </p>
                ) : (
                  topPosters.map((user, index) => (
                    <UserRow 
                      key={user.id} 
                      user={user} 
                      rank={index + 1} 
                      metric={user.post_count || 0}
                      metricLabel="posts"
                    />
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* SEO-friendly content section */}
        <section className="mt-12 text-center" aria-labelledby="leaderboard-cta">
          <h2 id="leaderboard-cta" className="text-xl font-semibold mb-3">Ready to Join the Rankings?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-4">
            Start earning points today by participating in the StudyHub community. Ask academic questions, 
            help fellow students with answers, maintain your daily study streak, and watch your rank climb. 
            The more you contribute, the higher you rise!
          </p>
          <nav className="flex flex-wrap justify-center gap-3" aria-label="Related pages">
            <a href="/questions" className="text-primary hover:underline font-medium">
              Browse Questions
            </a>
            <span className="text-muted-foreground">•</span>
            <a href="/groups" className="text-primary hover:underline font-medium">
              Join Study Groups
            </a>
            <span className="text-muted-foreground">•</span>
            <a href="/study" className="text-primary hover:underline font-medium">
              Start Studying
            </a>
          </nav>
        </section>
      </main>
    </div>
  );
};

export default memo(Leaderboard);

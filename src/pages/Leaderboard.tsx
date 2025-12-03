import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, Medal, Award, Flame, Star, TrendingUp, 
  Loader2, Crown, Zap, Target, BookOpen 
} from "lucide-react";

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

const Leaderboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [topUsers, setTopUsers] = useState<LeaderboardUser[]>([]);
  const [topStreak, setTopStreak] = useState<LeaderboardUser[]>([]);
  const [topPosters, setTopPosters] = useState<LeaderboardUser[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    loadLeaderboards();
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
  };

  const loadLeaderboards = async () => {
    setLoading(true);

    // Top users by points
    const { data: pointsData } = await supabase
      .from("profiles")
      .select("id, username, avatar_url, points, streak_days, country, grade")
      .order("points", { ascending: false })
      .limit(50);

    if (pointsData) {
      setTopUsers(pointsData as LeaderboardUser[]);
    }

    // Top users by streak
    const { data: streakData } = await supabase
      .from("profiles")
      .select("id, username, avatar_url, points, streak_days, country, grade")
      .order("streak_days", { ascending: false })
      .limit(50);

    if (streakData) {
      setTopStreak(streakData as LeaderboardUser[]);
    }

    // Top posters - count posts per user
    const { data: postsData } = await supabase
      .from("posts")
      .select("user_id, profiles!posts_user_id_fkey(id, username, avatar_url, points, streak_days, country, grade)");

    if (postsData) {
      const postCounts: Record<string, { user: any; count: number }> = {};
      postsData.forEach((post: any) => {
        if (post.profiles) {
          const userId = post.profiles.id;
          if (!postCounts[userId]) {
            postCounts[userId] = { user: post.profiles, count: 0 };
          }
          postCounts[userId].count++;
        }
      });

      const sortedPosters = Object.values(postCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 50)
        .map(item => ({
          ...item.user,
          post_count: item.count
        }));

      setTopPosters(sortedPosters);
    }

    setLoading(false);
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Award className="h-6 w-6 text-amber-600" />;
    return <span className="text-lg font-bold text-muted-foreground w-6 text-center">{rank}</span>;
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-r from-yellow-400 to-yellow-600";
    if (rank === 2) return "bg-gradient-to-r from-gray-300 to-gray-500";
    if (rank === 3) return "bg-gradient-to-r from-amber-500 to-amber-700";
    return "";
  };

  const UserRow = ({ user, rank, metric, metricLabel }: { user: LeaderboardUser; rank: number; metric: number | string; metricLabel: string }) => (
    <div 
      className={`flex items-center gap-4 p-4 rounded-lg transition-all duration-200 hover:bg-accent/50 cursor-pointer ${
        user.id === currentUserId ? "bg-primary/10 border border-primary/30" : ""
      } ${rank <= 3 ? getRankBadge(rank) + " text-white" : "bg-card"}`}
      onClick={() => navigate(`/user/${user.id}`)}
    >
      <div className="flex items-center justify-center w-8">
        {getRankIcon(rank)}
      </div>
      
      <Avatar className="h-12 w-12 border-2 border-background">
        <AvatarImage src={user.avatar_url} />
        <AvatarFallback className={rank <= 3 ? "bg-background text-foreground" : "bg-primary text-primary-foreground"}>
          {user.username?.charAt(0).toUpperCase() || "U"}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={`font-semibold truncate hover:underline ${rank <= 3 ? "" : ""}`}>
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
  );

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary via-primary to-accent py-12">
        <div className="container mx-auto px-4 text-center text-white">
          <div className="flex justify-center mb-4">
            <Trophy className="h-16 w-16 animate-float" />
          </div>
          <h1 className="text-4xl font-bold mb-2">Leaderboard</h1>
          <p className="text-white/80 max-w-md mx-auto">
            See who's leading the pack! Compete with fellow students and climb the ranks.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 -mt-8 mb-8">
          <Card variant="elevated" className="text-center p-4">
            <Star className="h-8 w-8 mx-auto text-yellow-500 mb-2" />
            <p className="text-2xl font-bold text-primary">{topUsers.reduce((sum, u) => sum + (u.points || 0), 0)}</p>
            <p className="text-sm text-muted-foreground">Total Points</p>
          </Card>
          <Card variant="elevated" className="text-center p-4">
            <Flame className="h-8 w-8 mx-auto text-orange-500 mb-2" />
            <p className="text-2xl font-bold text-primary">{Math.max(...topStreak.map(u => u.streak_days || 0), 0)}</p>
            <p className="text-sm text-muted-foreground">Longest Streak</p>
          </Card>
          <Card variant="elevated" className="text-center p-4">
            <BookOpen className="h-8 w-8 mx-auto text-blue-500 mb-2" />
            <p className="text-2xl font-bold text-primary">{topPosters.reduce((sum, u) => sum + (u.post_count || 0), 0)}</p>
            <p className="text-sm text-muted-foreground">Total Posts</p>
          </Card>
        </div>

        <Tabs defaultValue="points" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="points" className="gap-2">
              <Zap className="h-4 w-4" />
              Points
            </TabsTrigger>
            <TabsTrigger value="streak" className="gap-2">
              <Flame className="h-4 w-4" />
              Streak
            </TabsTrigger>
            <TabsTrigger value="posts" className="gap-2">
              <Target className="h-4 w-4" />
              Posts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="points">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Top Students by Points
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
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
                  <Flame className="h-5 w-5 text-orange-500" />
                  Top Streaks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
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
                  <Target className="h-5 w-5 text-blue-500" />
                  Top Contributors
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
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
      </div>
    </div>
  );
};

export default Leaderboard;

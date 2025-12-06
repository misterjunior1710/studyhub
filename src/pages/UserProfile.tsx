import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Loader2, MapPin, GraduationCap, BookOpen, Trophy, 
  Flame, Target, ArrowLeft, Lock, Calendar
} from "lucide-react";
import { toast } from "sonner";

interface UserProfile {
  id: string;
  username: string;
  avatar_url: string;
  bio: string;
  country: string;
  grade: string;
  stream: string;
  points: number;
  streak_days: number;
  created_at: string;
  is_public: boolean;
}

interface SubjectStats {
  subject: string;
  count: number;
}

// Grade hierarchy for age restriction
const GRADE_ORDER = [
  "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5",
  "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10",
  "Grade 11", "Grade 12", "Undergraduate", "Postgraduate", "Adult Learner"
];

const ADULT_GRADES = ["Undergraduate", "Postgraduate", "Adult Learner"];
const CHILD_GRADES = ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6"];

const UserProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [subjectStats, setSubjectStats] = useState<SubjectStats[]>([]);
  const [leaderboardRank, setLeaderboardRank] = useState<number | null>(null);
  const [postCount, setPostCount] = useState(0);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentUserGrade, setCurrentUserGrade] = useState<string | null>(null);
  const [isRestricted, setIsRestricted] = useState(false);

  useEffect(() => {
    if (userId) {
      loadProfile();
    }
  }, [userId]);

  const loadProfile = async () => {
    setLoading(true);

    // Get current user and their grade
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);

    let viewerGrade: string | null = null;
    if (user) {
      const { data: currentProfile } = await supabase
        .from("profiles")
        .select("grade")
        .eq("id", user.id)
        .maybeSingle();
      
      viewerGrade = currentProfile?.grade || null;
      setCurrentUserGrade(viewerGrade);
    }

    // Fetch target profile - use public_profiles view for other users
    const isOwnProfile = user?.id === userId;
    
    let profileData: UserProfile | null = null;
    let error: Error | null = null;
    
    if (isOwnProfile) {
      const result = await supabase
        .from("profiles")
        .select("id, username, avatar_url, bio, country, grade, stream, points, streak_days, created_at, is_public")
        .eq("id", userId)
        .maybeSingle();
      profileData = result.data as UserProfile | null;
      error = result.error;
    } else {
      const result = await supabase
        .from("public_profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();
      profileData = result.data as UserProfile | null;
      error = result.error;
    }

    if (error || !profileData) {
      toast.error("User not found");
      navigate("/");
      return;
    }

    // Check age restriction - hide adult profiles from young children
    const targetGrade = profileData.grade;
    
    if (targetGrade && ADULT_GRADES.includes(targetGrade)) {
      // If viewer is a child (Grade 1-6) and target is an adult, restrict
      if (viewerGrade && CHILD_GRADES.includes(viewerGrade)) {
        setIsRestricted(true);
        setProfile(profileData);
        setLoading(false);
        return;
      }
    }

    setProfile(profileData as UserProfile);

    // Fetch post statistics
    const { data: postsData } = await supabase
      .from("posts")
      .select("subject")
      .eq("user_id", userId);

    if (postsData) {
      setPostCount(postsData.length);
      
      // Calculate subject stats
      const subjectCounts: Record<string, number> = {};
      postsData.forEach(post => {
        subjectCounts[post.subject] = (subjectCounts[post.subject] || 0) + 1;
      });
      
      const stats = Object.entries(subjectCounts)
        .map(([subject, count]) => ({ subject, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      
      setSubjectStats(stats);
    }

    // Get leaderboard rank from public_profiles
    const { data: allProfiles } = await supabase
      .from("public_profiles")
      .select("id, points")
      .order("points", { ascending: false });

    if (allProfiles) {
      const rank = allProfiles.findIndex(p => p.id === userId) + 1;
      setLeaderboardRank(rank > 0 ? rank : null);
    }

    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long"
    });
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return { text: "🥇 #1", class: "bg-yellow-500/20 text-yellow-600" };
    if (rank === 2) return { text: "🥈 #2", class: "bg-gray-400/20 text-gray-600" };
    if (rank === 3) return { text: "🥉 #3", class: "bg-amber-600/20 text-amber-600" };
    if (rank <= 10) return { text: `🏆 Top 10`, class: "bg-primary/20 text-primary" };
    if (rank <= 50) return { text: `Top 50`, class: "bg-muted text-muted-foreground" };
    return { text: `#${rank}`, class: "bg-muted text-muted-foreground" };
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

  if (isRestricted) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          
          <Card className="text-center py-12">
            <CardContent className="space-y-4">
              <Lock className="h-16 w-16 mx-auto text-muted-foreground" />
              <h2 className="text-2xl font-bold">Profile Restricted</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                This profile belongs to an adult learner and is not viewable by younger students for safety reasons.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-muted-foreground">User not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary via-primary to-accent py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 gap-2 text-white/80 hover:text-white hover:bg-white/10">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          
          <div className="flex flex-col md:flex-row items-center gap-6">
            <Avatar className="h-32 w-32 border-4 border-white/20">
              <AvatarImage src={profile.avatar_url} />
              <AvatarFallback className="text-4xl bg-white/20 text-white">
                {profile.username?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            
            <div className="text-center md:text-left text-white">
              <h1 className="text-3xl font-bold mb-2">{profile.username || "Anonymous"}</h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-white/80">
                {profile.country && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {profile.country}
                  </span>
                )}
                {profile.grade && (
                  <span className="flex items-center gap-1">
                    <GraduationCap className="h-4 w-4" />
                    {profile.grade}
                  </span>
                )}
                {profile.stream && (
                  <Badge variant="secondary" className="bg-white/20 text-white border-0">
                    {profile.stream}
                  </Badge>
                )}
              </div>
              <p className="text-white/60 text-sm mt-2 flex items-center justify-center md:justify-start gap-1">
                <Calendar className="h-4 w-4" />
                Joined {formatDate(profile.created_at)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 -mt-8 mb-8">
          <Card variant="elevated" className="text-center p-4">
            <Trophy className="h-6 w-6 mx-auto text-yellow-500 mb-2" />
            <p className="text-2xl font-bold text-primary">{profile.points || 0}</p>
            <p className="text-xs text-muted-foreground">Points</p>
          </Card>
          <Card variant="elevated" className="text-center p-4">
            <Flame className="h-6 w-6 mx-auto text-orange-500 mb-2" />
            <p className="text-2xl font-bold text-primary">{profile.streak_days || 0}</p>
            <p className="text-xs text-muted-foreground">Day Streak</p>
          </Card>
          <Card variant="elevated" className="text-center p-4">
            <Target className="h-6 w-6 mx-auto text-blue-500 mb-2" />
            <p className="text-2xl font-bold text-primary">{postCount}</p>
            <p className="text-xs text-muted-foreground">Posts</p>
          </Card>
          <Card variant="elevated" className="text-center p-4">
            <Trophy className="h-6 w-6 mx-auto text-purple-500 mb-2" />
            {leaderboardRank ? (
              <>
                <Badge className={getRankBadge(leaderboardRank).class}>
                  {getRankBadge(leaderboardRank).text}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">Leaderboard</p>
              </>
            ) : (
              <>
                <p className="text-lg font-bold text-muted-foreground">-</p>
                <p className="text-xs text-muted-foreground">Not Ranked</p>
              </>
            )}
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Bio Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">About</CardTitle>
            </CardHeader>
            <CardContent>
              {profile.bio ? (
                <p className="text-muted-foreground">{profile.bio}</p>
              ) : (
                <p className="text-muted-foreground italic">No bio yet</p>
              )}
            </CardContent>
          </Card>

          {/* Top Subjects */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Most Posted Subjects
              </CardTitle>
            </CardHeader>
            <CardContent>
              {subjectStats.length > 0 ? (
                <div className="space-y-3">
                  {subjectStats.map((stat, index) => (
                    <div key={stat.subject} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground font-mono text-sm">
                          #{index + 1}
                        </span>
                        <Badge variant="secondary">{stat.subject}</Badge>
                      </div>
                      <span className="text-sm font-medium">{stat.count} posts</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground italic">No posts yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* View on Leaderboard Button */}
        {leaderboardRank && (
          <div className="mt-6 text-center">
            <Button onClick={() => navigate("/leaderboard")} variant="outline" className="gap-2">
              <Trophy className="h-4 w-4" />
              View Full Leaderboard
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;

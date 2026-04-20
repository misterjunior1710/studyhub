import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { useMissions } from "@/hooks/useMissions";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Target, Sparkles, CheckCircle2, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import MissionCard from "@/components/gamification/MissionCard";
import { Navigate } from "react-router-dom";

const Missions = () => {
  const { user } = useAuth();
  const { dailyMissions, weeklyMissions, activeCount, completedCount, loading } = useMissions();

  if (!user) return <Navigate to="/auth" replace />;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title="Missions | Daily & Weekly Quests | StudyHub"
        description="Complete daily and weekly missions to earn XP, coins, and level up your learning streak."
        canonical="https://studyhub.world/missions"
      />
      <Navbar />

      <main className="flex-1 container max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-xl bg-primary/10 p-2.5">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">Missions</h1>
          </div>
          <p className="text-muted-foreground">
            Complete quests to earn XP and coins. Missions refresh automatically.
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-primary" />
              <div>
                <div className="text-2xl font-bold tabular-nums">{activeCount}</div>
                <div className="text-xs text-muted-foreground">Active</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-success" />
              <div>
                <div className="text-2xl font-bold tabular-nums">{completedCount}</div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="daily" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="daily" className="gap-2">
              <Calendar className="h-4 w-4" />
              Daily ({dailyMissions.length})
            </TabsTrigger>
            <TabsTrigger value="weekly" className="gap-2">
              <Target className="h-4 w-4" />
              Weekly ({weeklyMissions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="space-y-3">
            {loading ? (
              <>
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </>
            ) : dailyMissions.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  No daily missions available. Check back soon!
                </CardContent>
              </Card>
            ) : (
              dailyMissions.map((m) => <MissionCard key={m.user_mission_id} mission={m} />)
            )}
          </TabsContent>

          <TabsContent value="weekly" className="space-y-3">
            {loading ? (
              <>
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </>
            ) : weeklyMissions.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  No weekly missions available. Check back soon!
                </CardContent>
              </Card>
            ) : (
              weeklyMissions.map((m) => <MissionCard key={m.user_mission_id} mission={m} />)
            )}
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default Missions;

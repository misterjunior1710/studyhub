import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  Timer, 
  Target, 
  Flame, 
  Clock, 
  Coffee,
  Loader2
} from "lucide-react";
import { format, startOfWeek, endOfWeek, isToday } from "date-fns";

interface StudySession {
  id: string;
  user_id: string;
  started_at: string;
  ended_at: string | null;
  duration_minutes: number;
  session_type: string;
  created_at: string;
}

interface ProfileSettings {
  auto_start_focus_timer: boolean;
  weekly_study_goal: number;
  daily_hours_target: number;
  streak_days: number;
}

const FOCUS_DURATION = 25 * 60; // 25 minutes in seconds
const BREAK_DURATION = 5 * 60; // 5 minutes in seconds

const StudyMode = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  
  const [timeRemaining, setTimeRemaining] = useState(FOCUS_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionType, setSessionType] = useState<"focus" | "break">("focus");
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const sessionStartRef = useRef<Date | null>(null);

  // Fetch profile settings
  const { data: profileSettings } = useQuery({
    queryKey: ["profile-settings", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("auto_start_focus_timer, weekly_study_goal, daily_hours_target, streak_days")
        .eq("id", user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as ProfileSettings | null;
    },
    enabled: !!user?.id,
  });

  // Fetch weekly sessions
  const { data: weeklySessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ["study-sessions-weekly", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
      const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
      
      const { data, error } = await supabase
        .from("study_sessions")
        .select("*")
        .eq("user_id", user.id)
        .gte("started_at", weekStart.toISOString())
        .lte("started_at", weekEnd.toISOString())
        .order("started_at", { ascending: false });
      
      if (error) throw error;
      return data as StudySession[];
    },
    enabled: !!user?.id,
  });

  // Calculate statistics
  const weeklyMinutes = weeklySessions?.reduce((acc, s) => acc + (s.duration_minutes || 0), 0) || 0;
  const weeklyHours = weeklyMinutes / 60;
  const weeklyGoal = profileSettings?.weekly_study_goal || 10;
  const weeklyProgress = Math.min((weeklyHours / weeklyGoal) * 100, 100);
  
  const todaySessions = weeklySessions?.filter(s => isToday(new Date(s.started_at))) || [];
  const todayMinutes = todaySessions.reduce((acc, s) => acc + (s.duration_minutes || 0), 0);

  // Create session mutation
  const createSession = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("study_sessions")
        .insert({
          user_id: user.id,
          session_type: sessionType,
          duration_minutes: 0,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setCurrentSessionId(data.id);
      sessionStartRef.current = new Date();
    },
  });

  // Update session mutation
  const updateSession = useMutation({
    mutationFn: async ({ id, duration }: { id: string; duration: number }) => {
      const { error } = await supabase
        .from("study_sessions")
        .update({
          ended_at: new Date().toISOString(),
          duration_minutes: duration,
        })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["study-sessions-weekly"] });
    },
  });

  // Timer logic
  const startTimer = useCallback(async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to track your study sessions.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    
    setIsRunning(true);
    await createSession.mutateAsync();
  }, [user, navigate, createSession]);

  const pauseTimer = useCallback(() => {
    setIsRunning(false);
  }, []);

  const stopTimer = useCallback(async () => {
    setIsRunning(false);
    
    if (currentSessionId && sessionStartRef.current) {
      const elapsedSeconds = Math.floor((new Date().getTime() - sessionStartRef.current.getTime()) / 1000);
      const elapsedMinutes = Math.max(1, Math.round(elapsedSeconds / 60));
      
      await updateSession.mutateAsync({ id: currentSessionId, duration: elapsedMinutes });
      
      toast({
        title: "Session completed!",
        description: `You studied for ${elapsedMinutes} minute${elapsedMinutes !== 1 ? "s" : ""}.`,
      });
    }
    
    setCurrentSessionId(null);
    sessionStartRef.current = null;
    setTimeRemaining(sessionType === "focus" ? FOCUS_DURATION : BREAK_DURATION);
  }, [currentSessionId, sessionType, updateSession]);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setCurrentSessionId(null);
    sessionStartRef.current = null;
    setTimeRemaining(sessionType === "focus" ? FOCUS_DURATION : BREAK_DURATION);
  }, [sessionType]);

  const switchSessionType = useCallback((type: "focus" | "break") => {
    if (isRunning) {
      toast({
        title: "Timer is running",
        description: "Please stop the timer before switching modes.",
        variant: "destructive",
      });
      return;
    }
    setSessionType(type);
    setTimeRemaining(type === "focus" ? FOCUS_DURATION : BREAK_DURATION);
  }, [isRunning]);

  // Timer countdown effect
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            stopTimer();
            toast({
              title: sessionType === "focus" ? "Focus session complete!" : "Break time over!",
              description: sessionType === "focus" 
                ? "Great work! Time for a break." 
                : "Ready to focus again?",
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, sessionType, stopTimer]);

  // Auto-start timer if setting is enabled
  useEffect(() => {
    if (profileSettings?.auto_start_focus_timer && user && !isRunning && !currentSessionId) {
      startTimer();
    }
  }, [profileSettings?.auto_start_focus_timer, user]);

  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title="Study Mode - Focus Timer"
        description="Boost your productivity with StudyHub's Pomodoro timer and study tracking. Set weekly goals, track focus sessions, and maintain your study streak."
        noIndex={true}
      />
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <article className="space-y-6">
          {/* Header */}
          <header className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Study Mode</h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Boost your focus with the Pomodoro technique — 25 minutes of concentrated study 
              followed by a 5-minute break. Track your progress and build consistent study habits.
            </p>
          </header>

          {/* Timer Card */}
          <Card className="border-2 border-primary/20">
            <CardContent className="pt-8 pb-6">
              {/* Session Type Toggle */}
              <div className="flex justify-center gap-2 mb-8">
                <Button
                  variant={sessionType === "focus" ? "default" : "outline"}
                  onClick={() => switchSessionType("focus")}
                  disabled={isRunning}
                >
                  <Timer className="h-4 w-4 mr-2" />
                  Focus
                </Button>
                <Button
                  variant={sessionType === "break" ? "default" : "outline"}
                  onClick={() => switchSessionType("break")}
                  disabled={isRunning}
                >
                  <Coffee className="h-4 w-4 mr-2" />
                  Break
                </Button>
              </div>

              {/* Timer Display */}
              <div className="text-center mb-8">
                <div className={`text-7xl md:text-8xl font-mono font-bold tracking-wider ${
                  sessionType === "focus" ? "text-primary" : "text-accent"
                }`}>
                  {formatTime(timeRemaining)}
                </div>
                <p className="text-muted-foreground mt-2">
                  {sessionType === "focus" ? "Stay focused!" : "Take a break!"}
                </p>
              </div>

              {/* Timer Controls */}
              <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3">
                {!isRunning ? (
                  <Button 
                    onClick={startTimer}
                    disabled={createSession.isPending}
                    className="px-4 sm:px-6 h-10 sm:h-11"
                  >
                    {createSession.isPending ? (
                      <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                    ) : (
                      <>
                        <Play className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
                        Start
                      </>
                    )}
                  </Button>
                ) : (
                  <Button variant="outline" onClick={pauseTimer} className="px-4 sm:px-6 h-10 sm:h-11">
                    <Pause className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
                    Pause
                  </Button>
                )}
                <Button 
                  variant="destructive" 
                  onClick={stopTimer}
                  disabled={!currentSessionId || updateSession.isPending}
                  className="px-4 sm:px-6 h-10 sm:h-11"
                >
                  {updateSession.isPending ? (
                    <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                  ) : (
                    <>
                      <Square className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
                      Stop
                    </>
                  )}
                </Button>
                <Button variant="ghost" onClick={resetTimer} disabled={isRunning} className="h-10 sm:h-11 px-3">
                  <RotateCcw className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Weekly Progress */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  Weekly Goal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{weeklyHours.toFixed(1)}h studied</span>
                    <span className="text-muted-foreground">{weeklyGoal}h goal</span>
                  </div>
                  <Progress value={weeklyProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {weeklyProgress >= 100 
                      ? "🎉 Goal achieved!" 
                      : `${(weeklyGoal - weeklyHours).toFixed(1)}h remaining`
                    }
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Today's Focus */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 text-accent" />
                  Today's Focus
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.floor(todayMinutes / 60)}h {todayMinutes % 60}m
                </div>
                <p className="text-xs text-muted-foreground">
                  {todaySessions.length} session{todaySessions.length !== 1 ? "s" : ""} completed
                </p>
              </CardContent>
            </Card>

            {/* Streak */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Flame className="h-4 w-4 text-orange-500" />
                  Study Streak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {profileSettings?.streak_days || 0} days
                </div>
                <p className="text-xs text-muted-foreground">
                  Keep it going!
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Today's Sessions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Today's Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              {sessionsLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : todaySessions.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  No sessions yet today. Start your first focus session!
                </p>
              ) : (
                <div className="space-y-2">
                  {todaySessions.map((session) => (
                    <div 
                      key={session.id} 
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant={session.session_type === "focus" ? "default" : "secondary"}>
                          {session.session_type === "focus" ? (
                            <Timer className="h-3 w-3 mr-1" />
                          ) : (
                            <Coffee className="h-3 w-3 mr-1" />
                          )}
                          {session.session_type}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(session.started_at), "h:mm a")}
                        </span>
                      </div>
                      <span className="font-medium">
                        {session.duration_minutes} min
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tips */}
          <section aria-labelledby="tips-heading">
            <Card className="bg-muted/30">
              <CardContent className="pt-6">
                <h2 id="tips-heading" className="font-semibold mb-2">💡 Pomodoro Tips</h2>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Focus for 25 minutes, then take a 5-minute break</li>
                  <li>• After 4 focus sessions, take a longer 15-30 minute break</li>
                  <li>• Remove distractions during focus time</li>
                  <li>• Use breaks to stretch, hydrate, or rest your eyes</li>
                </ul>
                <p className="mt-4 text-sm text-muted-foreground">
                  Need study material? <a href="/questions" className="text-primary hover:underline">Browse questions</a> from 
                  the community or <a href="/groups" className="text-primary hover:underline">join a study group</a> to stay motivated.
                </p>
              </CardContent>
            </Card>
          </section>
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default StudyMode;

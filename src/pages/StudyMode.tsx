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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
  Loader2,
  Layers,
  ClipboardList,
  Network,
  Settings2,
  AlertCircle
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { format, startOfWeek, endOfWeek, isToday } from "date-fns";
import { lazy, Suspense } from "react";

// Lazy load heavy study components to reduce initial bundle
const FlashcardSystem = lazy(() => import("@/components/study/FlashcardSystem").then(m => ({ default: m.FlashcardSystem })));
const QuizSystem = lazy(() => import("@/components/study/QuizSystem").then(m => ({ default: m.QuizSystem })));
const MindMapBuilder = lazy(() => import("@/components/study/MindMapBuilder").then(m => ({ default: m.MindMapBuilder })));

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

const DEFAULT_FOCUS_DURATION = 25 * 60;
const DEFAULT_BREAK_DURATION = 5 * 60;
const MIN_SESSION_DURATION_SECONDS = 180; // 3 minutes minimum
const ENGAGEMENT_CHECK_INTERVAL = 300; // Check every 5 minutes

const StudyMode = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  
  const [focusDuration, setFocusDuration] = useState(DEFAULT_FOCUS_DURATION);
  const [breakDuration, setBreakDuration] = useState(DEFAULT_BREAK_DURATION);
  const [timeRemaining, setTimeRemaining] = useState(DEFAULT_FOCUS_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionType, setSessionType] = useState<"focus" | "break">("focus");
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [showTimerSettings, setShowTimerSettings] = useState(false);
  const [showEngagementCheck, setShowEngagementCheck] = useState(false);
  const [engagementPaused, setEngagementPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const sessionStartRef = useRef<Date | null>(null);
  const lastEngagementCheckRef = useRef<number>(0);
  const engagementTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  const weeklyMinutes = weeklySessions?.reduce((acc, s) => acc + (s.duration_minutes || 0), 0) || 0;
  const weeklyHours = weeklyMinutes / 60;
  const weeklyGoal = profileSettings?.weekly_study_goal || 10;
  const weeklyProgress = Math.min((weeklyHours / weeklyGoal) * 100, 100);
  const todaySessions = weeklySessions?.filter(s => isToday(new Date(s.started_at))) || [];
  const todayMinutes = todaySessions.reduce((acc, s) => acc + (s.duration_minutes || 0), 0);

  const createSession = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("study_sessions")
        .insert({ user_id: user.id, session_type: sessionType, duration_minutes: 0 })
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

  const updateSession = useMutation({
    mutationFn: async ({ id, duration }: { id: string; duration: number }) => {
      const { error } = await supabase
        .from("study_sessions")
        .update({ ended_at: new Date().toISOString(), duration_minutes: duration })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["study-sessions-weekly"] }),
  });

  const startTimer = useCallback(async () => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to track your study sessions.", variant: "destructive" });
      navigate("/auth");
      return;
    }
    setIsRunning(true);
    await createSession.mutateAsync();
  }, [user, navigate, createSession]);

  const pauseTimer = useCallback(() => setIsRunning(false), []);

  const stopTimer = useCallback(async () => {
    setIsRunning(false);
    setShowEngagementCheck(false);
    setEngagementPaused(false);
    if (engagementTimeoutRef.current) {
      clearTimeout(engagementTimeoutRef.current);
    }
    
    if (currentSessionId && sessionStartRef.current) {
      const elapsedSeconds = Math.floor((new Date().getTime() - sessionStartRef.current.getTime()) / 1000);
      const elapsedMinutes = Math.round(elapsedSeconds / 60);
      
      // Only count sessions that are 3+ minutes
      if (elapsedSeconds >= MIN_SESSION_DURATION_SECONDS) {
        await updateSession.mutateAsync({ id: currentSessionId, duration: elapsedMinutes });
        toast({ title: "Session completed!", description: `You studied for ${elapsedMinutes} minute${elapsedMinutes !== 1 ? "s" : ""}.` });
      } else {
        // Delete the session if it's too short
        await supabase.from("study_sessions").delete().eq("id", currentSessionId);
        toast({ 
          title: "Session too short", 
          description: "Sessions must be at least 3 minutes to count toward your goals.",
          variant: "destructive"
        });
      }
    }
    setCurrentSessionId(null);
    sessionStartRef.current = null;
    lastEngagementCheckRef.current = 0;
    setTimeRemaining(sessionType === "focus" ? focusDuration : breakDuration);
  }, [currentSessionId, sessionType, updateSession, focusDuration, breakDuration]);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setCurrentSessionId(null);
    sessionStartRef.current = null;
    lastEngagementCheckRef.current = 0;
    setShowEngagementCheck(false);
    setEngagementPaused(false);
    if (engagementTimeoutRef.current) {
      clearTimeout(engagementTimeoutRef.current);
    }
    setTimeRemaining(sessionType === "focus" ? focusDuration : breakDuration);
  }, [sessionType, focusDuration, breakDuration]);

  const switchSessionType = useCallback((type: "focus" | "break") => {
    if (isRunning) {
      toast({ title: "Timer is running", description: "Please stop the timer before switching modes.", variant: "destructive" });
      return;
    }
    setSessionType(type);
    setTimeRemaining(type === "focus" ? focusDuration : breakDuration);
  }, [isRunning, focusDuration, breakDuration]);

  // Engagement verification - confirm student is still studying
  const confirmEngagement = useCallback(() => {
    setShowEngagementCheck(false);
    setEngagementPaused(false);
    setIsRunning(true);
    lastEngagementCheckRef.current = Date.now();
    if (engagementTimeoutRef.current) {
      clearTimeout(engagementTimeoutRef.current);
    }
    toast({ title: "Great!", description: "Keep up the good work! 📚" });
  }, []);

  const skipEngagementCheck = useCallback(() => {
    setShowEngagementCheck(false);
    setEngagementPaused(false);
    stopTimer();
    toast({ title: "Session ended", description: "Take a break if you need one!" });
  }, [stopTimer]);

  const updateTimerDurations = useCallback((newFocus: number, newBreak: number) => {
    setFocusDuration(newFocus);
    setBreakDuration(newBreak);
    if (!isRunning) {
      setTimeRemaining(sessionType === "focus" ? newFocus : newBreak);
    }
    setShowTimerSettings(false);
    toast({ title: "Timer updated", description: `Focus: ${newFocus / 60}min, Break: ${newBreak / 60}min` });
  }, [isRunning, sessionType]);

  useEffect(() => {
    if (isRunning && !engagementPaused) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            stopTimer();
            toast({ title: sessionType === "focus" ? "Focus session complete!" : "Break time over!", description: sessionType === "focus" ? "Great work! Time for a break." : "Ready to focus again?" });
            return 0;
          }
          
          // Check for engagement verification (every 5 minutes during focus sessions)
          if (sessionType === "focus" && sessionStartRef.current) {
            const elapsedSinceLastCheck = (Date.now() - lastEngagementCheckRef.current) / 1000;
            if (elapsedSinceLastCheck >= ENGAGEMENT_CHECK_INTERVAL && lastEngagementCheckRef.current > 0) {
              setEngagementPaused(true);
              setShowEngagementCheck(true);
              // Auto-stop after 30 seconds if no response
              engagementTimeoutRef.current = setTimeout(() => {
                skipEngagementCheck();
              }, 30000);
            }
          }
          
          return prev - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, sessionType, stopTimer, engagementPaused, skipEngagementCheck]);

  // Initialize engagement check timer when session starts
  useEffect(() => {
    if (isRunning && sessionStartRef.current && lastEngagementCheckRef.current === 0) {
      lastEngagementCheckRef.current = Date.now();
    }
  }, [isRunning]);

  useEffect(() => {
    if (profileSettings?.auto_start_focus_timer && user && !isRunning && !currentSessionId) {
      startTimer();
    }
  }, [profileSettings?.auto_start_focus_timer, user]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (authLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead title="Free Study Tools | Pomodoro Timer | Flashcards | Quizzes Online" description="Free study tools for students. Pomodoro timer, online flashcards, practice quizzes, mind maps. Track study time, build study streaks. Best free study app for students." canonical="https://studyhub.world/study" />
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        <header className="text-center space-y-2 mb-6">
          <h1 className="text-3xl font-bold opacity-0 animate-hero-fade-up">Study Mode</h1>
          <p className="text-muted-foreground max-w-lg mx-auto opacity-0 animate-hero-fade-up" style={{ animationDelay: "100ms" }}>Your complete learning toolkit with proven study techniques.</p>
        </header>

        <Tabs defaultValue="timer" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto gap-1">
            <TabsTrigger value="timer" className="text-xs sm:text-sm py-2"><Timer className="h-4 w-4 mr-1 hidden sm:inline" />Timer</TabsTrigger>
            <TabsTrigger value="flashcards" className="text-xs sm:text-sm py-2"><Layers className="h-4 w-4 mr-1 hidden sm:inline" />Flashcards</TabsTrigger>
            <TabsTrigger value="quizzes" className="text-xs sm:text-sm py-2"><ClipboardList className="h-4 w-4 mr-1 hidden sm:inline" />Quizzes</TabsTrigger>
            <TabsTrigger value="mindmaps" className="text-xs sm:text-sm py-2"><Network className="h-4 w-4 mr-1 hidden sm:inline" />Mind Maps</TabsTrigger>
          </TabsList>

          <TabsContent value="timer" className="space-y-6">
            {/* Timer Card */}
            <Card className="border-2 border-primary/20">
              <CardContent className="pt-8 pb-6">
                <div className="flex justify-center gap-2 mb-8">
                  <Button variant={sessionType === "focus" ? "default" : "outline"} onClick={() => switchSessionType("focus")} disabled={isRunning}><Timer className="h-4 w-4 mr-2" />Focus</Button>
                  <Button variant={sessionType === "break" ? "default" : "outline"} onClick={() => switchSessionType("break")} disabled={isRunning}><Coffee className="h-4 w-4 mr-2" />Break</Button>
                </div>
                <div className="text-center mb-8">
                  <div className={`text-7xl md:text-8xl font-mono font-bold tracking-wider ${sessionType === "focus" ? "text-primary" : "text-accent"}`}>{formatTime(timeRemaining)}</div>
                  <p className="text-muted-foreground mt-2">{sessionType === "focus" ? "Stay focused!" : "Take a break!"}</p>
                </div>
                <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3">
                  <Popover open={showTimerSettings} onOpenChange={setShowTimerSettings}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="icon" disabled={isRunning} title="Timer Settings">
                        <Settings2 className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72">
                      <div className="space-y-4">
                        <h4 className="font-medium">Timer Settings</h4>
                        <div className="space-y-2">
                          <label className="text-sm">Focus: {focusDuration / 60} min</label>
                          <Slider value={[focusDuration / 60]} min={5} max={60} step={5} onValueChange={([v]) => updateTimerDurations(v * 60, breakDuration)} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm">Break: {breakDuration / 60} min</label>
                          <Slider value={[breakDuration / 60]} min={1} max={30} step={1} onValueChange={([v]) => updateTimerDurations(focusDuration, v * 60)} />
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                  {!isRunning ? (
                    <Button onClick={startTimer} disabled={createSession.isPending} className="px-4 sm:px-6 h-10 sm:h-11">
                      {createSession.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Play className="h-4 w-4 mr-1.5" />Start</>}
                    </Button>
                  ) : (
                    <Button variant="outline" onClick={pauseTimer} className="px-4 sm:px-6 h-10 sm:h-11"><Pause className="h-4 w-4 mr-1.5" />Pause</Button>
                  )}
                  <Button variant="destructive" onClick={stopTimer} disabled={!currentSessionId || updateSession.isPending} className="px-4 sm:px-6 h-10 sm:h-11">
                    {updateSession.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Square className="h-4 w-4 mr-1.5" />Stop</>}
                  </Button>
                  <Button variant="ghost" onClick={resetTimer} disabled={isRunning} className="h-10 sm:h-11 px-3"><RotateCcw className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2"><Target className="h-4 w-4 text-primary" />Weekly Goal</CardTitle></CardHeader><CardContent><div className="space-y-2"><div className="flex justify-between text-sm"><span>{weeklyHours.toFixed(1)}h</span><span className="text-muted-foreground">{weeklyGoal}h</span></div><Progress value={weeklyProgress} className="h-2" /></div></CardContent></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2"><Clock className="h-4 w-4 text-accent" />Today</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{Math.floor(todayMinutes / 60)}h {todayMinutes % 60}m</div></CardContent></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2"><Flame className="h-4 w-4 text-orange-500" />Streak</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{profileSettings?.streak_days || 0} days</div></CardContent></Card>
            </div>

            {/* Today's Sessions */}
            <Card>
              <CardHeader><CardTitle className="text-lg">Today's Sessions</CardTitle></CardHeader>
              <CardContent>
                {sessionsLoading ? <div className="flex justify-center py-4"><Loader2 className="h-6 w-6 animate-spin" /></div> : todaySessions.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No sessions yet today.</p>
                ) : (
                  <div className="space-y-2">
                    {todaySessions.map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                          <Badge variant={session.session_type === "focus" ? "default" : "secondary"}>{session.session_type}</Badge>
                          <span className="text-sm text-muted-foreground">{format(new Date(session.started_at), "h:mm a")}</span>
                        </div>
                        <span className="font-medium">{session.duration_minutes} min</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="flashcards">
            <Suspense fallback={<div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
              <FlashcardSystem />
            </Suspense>
          </TabsContent>
          <TabsContent value="quizzes">
            <Suspense fallback={<div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
              <QuizSystem />
            </Suspense>
          </TabsContent>
          <TabsContent value="mindmaps">
            <Suspense fallback={<div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
              <MindMapBuilder />
            </Suspense>
          </TabsContent>
        </Tabs>

        {/* Engagement Verification Dialog */}
        <Dialog open={showEngagementCheck} onOpenChange={(open) => !open && skipEngagementCheck()}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-primary" />
                Still Studying?
              </DialogTitle>
              <DialogDescription>
                Click "I'm here!" to confirm you're still actively studying. This helps us track your study time accurately.
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-3 justify-end mt-4">
              <Button variant="outline" onClick={skipEngagementCheck}>
                Take a Break
              </Button>
              <Button onClick={confirmEngagement} className="gap-2">
                <Play className="h-4 w-4" />
                I'm Here!
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
      
      <Footer />
    </div>
  );
};

export default StudyMode;
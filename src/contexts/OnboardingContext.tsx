import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

interface OnboardingTask {
  id: string;
  label: string;
  completed: boolean;
}

interface OnboardingContextType {
  showWelcome: boolean;
  showChecklist: boolean;
  tasks: OnboardingTask[];
  allCompleted: boolean;
  showCelebration: boolean;
  dismissWelcome: () => void;
  completeTask: (taskId: string) => void;
  dismissChecklist: () => void;
  dismissCelebration: () => void;
  isOnboardingComplete: boolean;
}

const OnboardingContext = createContext<OnboardingContextType | null>(null);

const ONBOARDING_TASKS: Omit<OnboardingTask, "completed">[] = [
  { id: "profile", label: "Complete your profile" },
  { id: "browse", label: "Browse the study feed" },
  { id: "group", label: "Join or create a study group" },
  { id: "friend", label: "Add a friend" },
  { id: "post", label: "Create your first post" },
];

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const { user, profileData, username } = useAuth();
  const [showWelcome, setShowWelcome] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [tasks, setTasks] = useState<OnboardingTask[]>([]);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Initialize onboarding state
  useEffect(() => {
    const initOnboarding = async () => {
      if (!user) {
        setShowWelcome(false);
        setShowChecklist(false);
        setInitialized(true);
        return;
      }

      // Check if user has completed onboarding
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_completed, onboarding_tasks, username, country, grade, stream")
        .eq("id", user.id)
        .single();

      if (profile?.onboarding_completed) {
        setIsOnboardingComplete(true);
        setShowWelcome(false);
        setShowChecklist(false);
        setInitialized(true);
        return;
      }

      setIsOnboardingComplete(false);

      // Load saved tasks or initialize new ones
      const savedTasks = profile?.onboarding_tasks as string[] | null;
      const completedTaskIds = savedTasks || [];

      // Check actual completion status for tasks
      const [groupMember, hasFriend, hasPost] = await Promise.all([
        supabase
          .from("group_members")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),
        supabase
          .from("friends")
          .select("id", { count: "exact", head: true })
          .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`),
        supabase
          .from("posts")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),
      ]);

      // Determine which tasks are complete
      const profileComplete = !!(profile?.username && profile?.country && profile?.grade && profile?.stream);
      const browsedFeed = completedTaskIds.includes("browse") || localStorage.getItem("studyhub_browsed_feed") === "true";
      const joinedGroup = (groupMember.count || 0) > 0;
      const addedFriend = (hasFriend.count || 0) > 0;
      const createdPost = (hasPost.count || 0) > 0;

      const updatedTasks: OnboardingTask[] = [
        { id: "profile", label: "Complete your profile", completed: profileComplete },
        { id: "browse", label: "Browse the study feed", completed: browsedFeed },
        { id: "group", label: "Join or create a study group", completed: joinedGroup },
        { id: "friend", label: "Add a friend", completed: addedFriend },
        { id: "post", label: "Create your first post", completed: createdPost },
      ];

      setTasks(updatedTasks);

      // Check if all tasks are now complete
      const allDone = updatedTasks.every((t) => t.completed);
      if (allDone && !profile?.onboarding_completed) {
        // Mark onboarding as complete
        await supabase
          .from("profiles")
          .update({ onboarding_completed: true })
          .eq("id", user.id);
        setIsOnboardingComplete(true);
        setShowWelcome(false);
        setShowChecklist(false);
      } else {
        // Show welcome if first time
        const hasSeenWelcome = localStorage.getItem("studyhub_onboarding_seen") === "true";
        if (!hasSeenWelcome) {
          setShowWelcome(true);
        } else {
          setShowChecklist(true);
        }
      }

      setInitialized(true);
    };

    initOnboarding();
  }, [user]);

  // Re-check profile task when profileData changes
  useEffect(() => {
    if (!initialized || isOnboardingComplete) return;

    const profileComplete = !!(username && profileData?.country && profileData?.grade && profileData?.stream);
    
    setTasks((prev) =>
      prev.map((task) =>
        task.id === "profile" ? { ...task, completed: profileComplete } : task
      )
    );
  }, [profileData, initialized, isOnboardingComplete]);

  const dismissWelcome = useCallback(() => {
    localStorage.setItem("studyhub_onboarding_seen", "true");
    setShowWelcome(false);
    setShowChecklist(true);
  }, []);

  const completeTask = useCallback(
    async (taskId: string) => {
      if (!user || isOnboardingComplete) return;

      setTasks((prev) => {
        const updated = prev.map((task) =>
          task.id === taskId ? { ...task, completed: true } : task
        );

        // Check if all tasks are now complete
        const allDone = updated.every((t) => t.completed);
        if (allDone) {
          setShowCelebration(true);
          setShowChecklist(false);
          // Mark onboarding as complete in DB
          supabase
            .from("profiles")
            .update({ 
              onboarding_completed: true,
              onboarding_tasks: updated.filter(t => t.completed).map(t => t.id)
            })
            .eq("id", user.id);
        } else {
          // Save progress
          supabase
            .from("profiles")
            .update({ 
              onboarding_tasks: updated.filter(t => t.completed).map(t => t.id)
            })
            .eq("id", user.id);
        }

        return updated;
      });

      // Special handling for browse task
      if (taskId === "browse") {
        localStorage.setItem("studyhub_browsed_feed", "true");
      }
    },
    [user, isOnboardingComplete]
  );

  const dismissChecklist = useCallback(() => {
    setShowChecklist(false);
  }, []);

  const dismissCelebration = useCallback(() => {
    setShowCelebration(false);
    setIsOnboardingComplete(true);
  }, []);

  const allCompleted = tasks.every((t) => t.completed);

  return (
    <OnboardingContext.Provider
      value={{
        showWelcome,
        showChecklist,
        tasks,
        allCompleted,
        showCelebration,
        dismissWelcome,
        completeTask,
        dismissChecklist,
        dismissCelebration,
        isOnboardingComplete,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within OnboardingProvider");
  }
  return context;
}

import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { sounds, setSoundEnabled } from "@/lib/sounds";

export interface DailyGoal {
  id: string;
  goal_type: "study" | "answer" | "quiz";
  target: number;
  progress: number;
  completed: boolean;
  local_date: string;
}

interface GamificationState {
  coins: number;
  streakFreezes: number;
  totalCoinsEarned: number;
  streakDays: number;
  goals: DailyGoal[];
  soundEnabled: boolean;
  loading: boolean;
}

interface GamificationContextValue extends GamificationState {
  refresh: () => Promise<void>;
  purchaseStreakFreeze: () => Promise<{ success: boolean; reason?: string }>;
  setSoundEnabled: (enabled: boolean) => Promise<void>;
  triggerCoinAnimation: (amount: number) => void;
  recentCoinGain: { amount: number; key: number } | null;
}

const defaultState: GamificationState = {
  coins: 0,
  streakFreezes: 0,
  totalCoinsEarned: 0,
  streakDays: 0,
  goals: [],
  soundEnabled: true,
  loading: true,
};

const GamificationContext = createContext<GamificationContextValue>({
  ...defaultState,
  refresh: async () => {},
  purchaseStreakFreeze: async () => ({ success: false }),
  setSoundEnabled: async () => {},
  triggerCoinAnimation: () => {},
  recentCoinGain: null,
});

export const useGamification = () => useContext(GamificationContext);

const getLocalDate = (timezone: string): string => {
  try {
    const fmt = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone || "UTC",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return fmt.format(new Date());
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
};

export const GamificationProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [state, setState] = useState<GamificationState>(defaultState);
  const [recentCoinGain, setRecentCoinGain] = useState<{ amount: number; key: number } | null>(null);
  const prevCoinsRef = useRef<number>(0);
  const prevStreakRef = useRef<number>(0);
  const animKeyRef = useRef(0);

  const fetchAll = useCallback(async () => {
    if (!user) {
      setState({ ...defaultState, loading: false });
      return;
    }

    try {
      const [walletRes, profileRes] = await Promise.all([
        supabase.from("user_wallet").select("*").eq("user_id", user.id).maybeSingle(),
        supabase
          .from("profiles")
          .select("streak_days, sound_enabled, timezone")
          .eq("id", user.id)
          .maybeSingle(),
      ]);

      const tz = profileRes.data?.timezone || "UTC";
      const today = getLocalDate(tz);

      const goalsRes = await supabase
        .from("daily_goals")
        .select("*")
        .eq("user_id", user.id)
        .eq("local_date", today);

      const wallet = walletRes.data;
      const profile = profileRes.data;
      const goals = (goalsRes.data || []) as DailyGoal[];

      // Ensure all 3 goal types appear (with 0 progress) for UI
      const goalTypes: Array<DailyGoal["goal_type"]> = ["study", "answer", "quiz"];
      const goalDefaults: Record<string, number> = { study: 1, answer: 2, quiz: 1 };
      const fullGoals: DailyGoal[] = goalTypes.map((type) => {
        const existing = goals.find((g) => g.goal_type === type);
        return (
          existing || {
            id: `placeholder-${type}`,
            goal_type: type,
            target: goalDefaults[type],
            progress: 0,
            completed: false,
            local_date: today,
          }
        );
      });

      const newCoins = wallet?.coins ?? 0;
      const newStreak = profile?.streak_days ?? 0;
      const soundOn = profile?.sound_enabled ?? true;

      // Detect coin gain → trigger animation
      if (prevCoinsRef.current > 0 && newCoins > prevCoinsRef.current) {
        const gain = newCoins - prevCoinsRef.current;
        animKeyRef.current += 1;
        setRecentCoinGain({ amount: gain, key: animKeyRef.current });
        sounds.coin();
        setTimeout(() => setRecentCoinGain(null), 2000);
      }

      // Detect streak milestone
      if (prevStreakRef.current > 0 && newStreak > prevStreakRef.current && [7, 30, 100, 365].includes(newStreak)) {
        sounds.streakMilestone();
      }

      prevCoinsRef.current = newCoins;
      prevStreakRef.current = newStreak;
      setSoundEnabled(soundOn);

      setState({
        coins: newCoins,
        streakFreezes: wallet?.streak_freezes ?? 0,
        totalCoinsEarned: wallet?.total_coins_earned ?? 0,
        streakDays: newStreak,
        goals: fullGoals,
        soundEnabled: soundOn,
        loading: false,
      });
    } catch (err) {
      console.error("Gamification fetch error:", err);
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [user]);

  // Initial fetch + on auth change
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Realtime subscriptions
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`gamification:${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "user_wallet", filter: `user_id=eq.${user.id}` },
        () => fetchAll(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "daily_goals", filter: `user_id=eq.${user.id}` },
        () => {
          // Detect goal completion sound
          fetchAll().then(() => sounds.goalComplete());
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles", filter: `id=eq.${user.id}` },
        () => fetchAll(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchAll]);

  // Fallback re-sync: window focus + online
  useEffect(() => {
    if (!user) return;
    const handler = () => fetchAll();
    window.addEventListener("focus", handler);
    window.addEventListener("online", handler);
    // Heartbeat every 60s while visible
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") fetchAll();
    }, 60000);
    return () => {
      window.removeEventListener("focus", handler);
      window.removeEventListener("online", handler);
      clearInterval(interval);
    };
  }, [user, fetchAll]);

  const purchaseStreakFreeze = useCallback(async () => {
    const { data, error } = await supabase.rpc("purchase_streak_freeze");
    if (error) {
      console.error("Purchase failed:", error);
      sounds.error();
      return { success: false, reason: error.message };
    }
    const result = data as { success: boolean; reason?: string };
    if (result.success) {
      sounds.coin();
      await fetchAll();
    } else {
      sounds.error();
    }
    return result;
  }, [fetchAll]);

  const updateSoundEnabled = useCallback(
    async (enabled: boolean) => {
      if (!user) return;
      setState((prev) => ({ ...prev, soundEnabled: enabled }));
      setSoundEnabled(enabled);
      await supabase.from("profiles").update({ sound_enabled: enabled }).eq("id", user.id);
    },
    [user],
  );

  const triggerCoinAnimation = useCallback((amount: number) => {
    animKeyRef.current += 1;
    setRecentCoinGain({ amount, key: animKeyRef.current });
    sounds.coin();
    setTimeout(() => setRecentCoinGain(null), 2000);
  }, []);

  return (
    <GamificationContext.Provider
      value={{
        ...state,
        refresh: fetchAll,
        purchaseStreakFreeze,
        setSoundEnabled: updateSoundEnabled,
        triggerCoinAnimation,
        recentCoinGain,
      }}
    >
      {children}
    </GamificationContext.Provider>
  );
};

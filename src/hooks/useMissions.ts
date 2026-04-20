import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Mission {
  id: string;
  user_mission_id: string;
  slug: string;
  title: string;
  description: string;
  icon: string | null;
  difficulty: string;
  period: string;
  event_type: string;
  target: number;
  progress: number;
  completed: boolean;
  reward_claimed: boolean;
  xp_reward: number;
  coin_reward: number;
  expires_at: string;
}

export const useMissions = () => {
  const { user } = useAuth();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMissions = useCallback(async () => {
    if (!user) {
      setMissions([]);
      setLoading(false);
      return;
    }

    try {
      // Lazy-assign daily/weekly missions on first call of the day
      await supabase.rpc("assign_daily_missions" as any, { _user_id: user.id });
      await supabase.rpc("assign_weekly_missions" as any, { _user_id: user.id });

      const { data, error } = await supabase
        .from("user_missions")
        .select(`
          id,
          progress,
          completed,
          reward_claimed,
          expires_at,
          mission:missions (
            id, slug, title, description, icon, difficulty, period,
            event_type, target, xp_reward, coin_reward
          )
        `)
        .eq("user_id", user.id)
        .gt("expires_at", new Date().toISOString())
        .order("completed", { ascending: true });

      if (error) throw error;

      const flat: Mission[] = (data || [])
        .filter((row: any) => row.mission)
        .map((row: any) => ({
          id: row.mission.id,
          user_mission_id: row.id,
          slug: row.mission.slug,
          title: row.mission.title,
          description: row.mission.description,
          icon: row.mission.icon,
          difficulty: row.mission.difficulty,
          period: row.mission.period,
          event_type: row.mission.event_type,
          target: row.mission.target,
          progress: row.progress,
          completed: row.completed,
          reward_claimed: row.reward_claimed,
          xp_reward: row.mission.xp_reward,
          coin_reward: row.mission.coin_reward,
          expires_at: row.expires_at,
        }));

      setMissions(flat);
    } catch (err) {
      console.error("[useMissions] fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMissions();
  }, [fetchMissions]);

  // Realtime updates on user_missions
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`missions:${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "user_missions", filter: `user_id=eq.${user.id}` },
        () => fetchMissions(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchMissions]);

  const dailyMissions = missions.filter((m) => m.period === "daily");
  const weeklyMissions = missions.filter((m) => m.period === "weekly");
  const activeCount = missions.filter((m) => !m.completed).length;
  const completedCount = missions.filter((m) => m.completed).length;

  return {
    missions,
    dailyMissions,
    weeklyMissions,
    activeCount,
    completedCount,
    loading,
    refresh: fetchMissions,
  };
};

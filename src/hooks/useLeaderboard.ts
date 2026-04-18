import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type LeaderboardScope = "global" | "country" | "friends";
export type LeaderboardPeriod = "weekly" | "all_time";

export interface LeaderboardRow {
  user_id: string;
  username: string | null;
  avatar_url: string | null;
  country: string | null;
  current_league: string;
  xp: number;
  rank: number;
}

export const useLeaderboard = (scope: LeaderboardScope, period: LeaderboardPeriod = "weekly", limit = 50) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["leaderboard", scope, period, limit, user?.id],
    enabled: !!user,
    staleTime: 60 * 1000,
    queryFn: async (): Promise<LeaderboardRow[]> => {
      const { data, error } = await supabase.rpc("get_leaderboard", {
        p_scope: scope,
        p_period: period,
        p_limit: limit,
      });
      if (error) throw error;
      return (data || []) as LeaderboardRow[];
    },
  });
};

export const useUserRank = (scope: LeaderboardScope, period: LeaderboardPeriod = "weekly") => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["userRank", scope, period, user?.id],
    enabled: !!user,
    staleTime: 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_user_rank", {
        p_scope: scope,
        p_period: period,
      });
      if (error) throw error;
      return data as { rank: number | null; total: number; xp: number };
    },
  });
};

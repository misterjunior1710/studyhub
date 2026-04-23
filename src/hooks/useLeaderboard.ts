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

// Hard cap on leaderboard size for privacy — never expose more than this.
export const LEADERBOARD_MAX = 10;

export const useLeaderboard = (scope: LeaderboardScope, period: LeaderboardPeriod = "weekly", limit = LEADERBOARD_MAX) => {
  const { user } = useAuth();
  const safeLimit = Math.min(Math.max(1, limit), LEADERBOARD_MAX);
  return useQuery({
    queryKey: ["leaderboard", scope, period, safeLimit, user?.id],
    enabled: !!user, // auth-gated: never fetch for logged-out users
    staleTime: 60 * 1000,
    queryFn: async (): Promise<LeaderboardRow[]> => {
      const { data, error } = await supabase.rpc("get_leaderboard", {
        p_scope: scope,
        p_period: period,
        p_limit: safeLimit,
      });
      if (error) throw error;
      // Strip any sensitive fields defensively — only expose minimal info.
      return ((data || []) as LeaderboardRow[]).map((r) => ({
        user_id: r.user_id,
        username: r.username,
        avatar_url: r.avatar_url,
        country: r.country,
        current_league: r.current_league,
        xp: r.xp,
        rank: r.rank,
      }));
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

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Badge {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  criteria_type: string;
  criteria_value: number;
  sort_order: number;
}

export interface UserBadge {
  badge_slug: string;
  unlocked_at: string;
}

export const useAllBadges = () =>
  useQuery({
    queryKey: ["badges", "all"],
    staleTime: 10 * 60 * 1000,
    queryFn: async (): Promise<Badge[]> => {
      const { data, error } = await supabase
        .from("badges")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data || []) as Badge[];
    },
  });

export const useUserBadges = (userId: string | undefined) =>
  useQuery({
    queryKey: ["userBadges", userId],
    enabled: !!userId,
    staleTime: 60 * 1000,
    queryFn: async (): Promise<UserBadge[]> => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("user_badges")
        .select("badge_slug, unlocked_at")
        .eq("user_id", userId);
      if (error) throw error;
      return (data || []) as UserBadge[];
    },
  });

export const RARITY_STYLES: Record<Badge["rarity"], { ring: string; bg: string; label: string }> = {
  common: {
    ring: "ring-muted-foreground/30",
    bg: "bg-muted/50",
    label: "text-muted-foreground",
  },
  rare: {
    ring: "ring-blue-400/50",
    bg: "bg-blue-500/10",
    label: "text-blue-500",
  },
  epic: {
    ring: "ring-purple-400/60",
    bg: "bg-purple-500/10",
    label: "text-purple-500",
  },
  legendary: {
    ring: "ring-amber-400/70",
    bg: "bg-gradient-to-br from-amber-500/20 to-orange-500/20",
    label: "text-amber-500",
  },
};

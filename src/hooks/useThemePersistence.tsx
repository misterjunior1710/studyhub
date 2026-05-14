import { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const themeColors: Record<string, { primary: string; accent: string }> = {
  // Premium / Modern
  "royal-purple": { primary: "282 68% 38%", accent: "282 68% 55%" },
  "neon-violet": { primary: "291 64% 42%", accent: "291 70% 60%" },
  "sunset-orange": { primary: "36 100% 50%", accent: "24 95% 55%" },
  "crimson-red": { primary: "0 65% 51%", accent: "350 80% 60%" },
  "rose-pink": { primary: "330 81% 60%", accent: "320 70% 70%" },
  "graphite-gray": { primary: "217 19% 27%", accent: "217 19% 45%" },
  "arctic-silver": { primary: "215 20% 65%", accent: "215 25% 75%" },
  // Calm / Focused
  "ocean-blue": { primary: "207 90% 54%", accent: "199 89% 60%" },
  "slate-blue": { primary: "231 44% 56%", accent: "231 50% 70%" },
  "indigo-night": { primary: "231 48% 48%", accent: "239 70% 60%" },
  "forest-green": { primary: "123 46% 34%", accent: "142 60% 45%" },
  "sage-green": { primary: "127 16% 55%", accent: "127 22% 65%" },
  "teal-focus": { primary: "174 100% 29%", accent: "174 80% 40%" },
  "midnight-cyan": { primary: "182 100% 20%", accent: "182 80% 32%" },
};

export const applyThemeColor = (colorName: string) => {
  const theme = themeColors[colorName];
  if (theme) {
    document.documentElement.style.setProperty('--primary', theme.primary);
    document.documentElement.style.setProperty('--accent', theme.accent);
    document.documentElement.style.setProperty('--ring', theme.primary);
  }
};

export const useThemePersistence = () => {
  const { user } = useAuth();
  const hasFetchedRef = useRef<string | null>(null);

  useEffect(() => {
    const loadUserTheme = async () => {
      if (!user) return;
      
      // Prevent duplicate fetches for same user
      if (hasFetchedRef.current === user.id) return;
      hasFetchedRef.current = user.id;

      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("theme_color")
          .eq("id", user.id)
          .maybeSingle();

        if (profile?.theme_color) {
          applyThemeColor(profile.theme_color);
        }
      } catch (error) {
        console.error("Error loading theme:", error);
      }
    };

    loadUserTheme();
  }, [user]);
};

export default useThemePersistence;

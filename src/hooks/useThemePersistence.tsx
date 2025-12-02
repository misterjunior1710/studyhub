import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const themeColors: Record<string, { primary: string; accent: string }> = {
  purple: { primary: "262 83% 58%", accent: "330 85% 60%" },
  blue: { primary: "217 91% 60%", accent: "199 89% 48%" },
  green: { primary: "142 76% 36%", accent: "160 84% 39%" },
  orange: { primary: "24 95% 53%", accent: "38 92% 50%" },
  red: { primary: "0 72% 51%", accent: "350 89% 60%" },
  teal: { primary: "173 80% 40%", accent: "187 92% 35%" },
  indigo: { primary: "239 84% 67%", accent: "250 70% 55%" },
  slate: { primary: "215 20% 45%", accent: "215 25% 35%" },
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
  useEffect(() => {
    const loadUserTheme = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("theme_color")
          .eq("id", user.id)
          .maybeSingle();
        
        if (profile?.theme_color) {
          applyThemeColor(profile.theme_color);
        }
      }
    };

    loadUserTheme();

    // Also listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("theme_color")
          .eq("id", session.user.id)
          .maybeSingle();
        
        if (profile?.theme_color) {
          applyThemeColor(profile.theme_color);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);
};

export default useThemePersistence;

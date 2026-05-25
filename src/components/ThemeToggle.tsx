import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useCallback } from "react";

const themeOrder = ["dark", "light", "system"] as const;
type Theme = (typeof themeOrder)[number];

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  const cycleTheme = useCallback(() => {
    const current = (theme || "system") as Theme;
    const idx = themeOrder.indexOf(current);
    const next = themeOrder[(idx + 1) % themeOrder.length];
    setTheme(next);
  }, [theme, setTheme]);

  const current = (theme || "system") as Theme;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycleTheme}
      aria-label={`Current theme: ${current}. Click to cycle.`}
      className="relative h-9 w-9"
    >
      <Sun
        className={`absolute h-[1.15rem] w-[1.15rem] transition-all duration-300 ${
          current === "light"
            ? "rotate-0 scale-100 opacity-100"
            : "-rotate-90 scale-0 opacity-0"
        }`}
      />
      <Moon
        className={`absolute h-[1.15rem] w-[1.15rem] transition-all duration-300 ${
          current === "dark"
            ? "rotate-0 scale-100 opacity-100"
            : "rotate-90 scale-0 opacity-0"
        }`}
      />
      <Monitor
        className={`absolute h-[1.15rem] w-[1.15rem] transition-all duration-300 ${
          current === "system"
            ? "rotate-0 scale-100 opacity-100"
            : "-rotate-90 scale-0 opacity-0"
        }`}
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};

export default ThemeToggle;

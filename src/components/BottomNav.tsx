import { Home, Rss, HelpCircle, Timer, PlusCircle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const items = user
    ? [
        { path: "/", label: "Home", icon: Home },
        { path: "/feed", label: "Feed", icon: Rss },
        { path: "/questions", label: "Questions", icon: HelpCircle },
        { path: "/study", label: "Study", icon: Timer },
      ]
    : [
        { path: "/", label: "Home", icon: Home },
        { path: "/feed", label: "Feed", icon: Rss },
        { path: "/questions", label: "Questions", icon: HelpCircle },
        { path: "/study", label: "Study", icon: Timer },
      ];

  return (
    <>
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md"
        role="navigation"
        aria-label="Main navigation"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="flex items-center justify-around h-14">
          {items.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors relative",
                isActive(item.path)
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
              aria-label={item.label}
              aria-current={isActive(item.path) ? "page" : undefined}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
              {isActive(item.path) && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Bottom nav spacer to prevent content from being hidden behind the nav */}
      <div className="md:hidden h-14" />
    </>
  );
};

export default BottomNav;

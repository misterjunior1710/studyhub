import { Home, Rss, HelpCircle, Timer } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useOnboarding } from "@/contexts/OnboardingContext";

// Routes where bottom nav should be hidden
const HIDDEN_ROUTES = ["/auth", "/profile-onboarding"];

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isOnboardingComplete } = useOnboarding();

  // Hide on auth-related pages
  if (HIDDEN_ROUTES.some(r => location.pathname.startsWith(r))) {
    return null;
  }

  const isActive = (path: string) => location.pathname === path;

  const items = [
    { path: "/", label: "Home", icon: Home, badge: !isOnboardingComplete },
    { path: "/feed", label: "Feed", icon: Rss, badge: false },
    { path: "/questions", label: "Questions", icon: HelpCircle, badge: false },
    { path: "/study", label: "Study", icon: Timer, badge: false },
  ];

  return (
    <>
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-[60] border-t border-border bg-card/95 backdrop-blur-md"
        role="navigation"
        aria-label="Main navigation"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="flex items-center justify-around h-16">
          {items.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 flex-1 h-full min-w-[48px] min-h-[48px] transition-colors relative touch-manipulation active:scale-95",
                isActive(item.path)
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
              aria-label={item.badge ? `${item.label} (setup incomplete)` : item.label}
              aria-current={isActive(item.path) ? "page" : undefined}
            >
              <span className="relative">
                <item.icon className="h-5 w-5" />
                {item.badge && (
                  <span
                    className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-primary ring-2 ring-card"
                    aria-hidden="true"
                  />
                )}
              </span>
              <span className="text-[10px] font-medium">{item.label}</span>
              {isActive(item.path) && (
                <span className="absolute bottom-2 w-1 h-1 rounded-full bg-primary" />
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Bottom nav spacer to prevent content from being hidden behind the nav */}
      <div className="md:hidden h-16" />
    </>
  );
};

export default BottomNav;

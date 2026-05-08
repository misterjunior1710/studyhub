import { Home, Rss, HelpCircle, Timer, PlusCircle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { useState } from "react";
import CreatePostDialog from "./CreatePostDialog";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [createOpen, setCreateOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/feed", label: "Feed", icon: Rss },
    { path: "/questions", label: "Questions", icon: HelpCircle },
    { path: "/study", label: "Study", icon: Timer },
  ];

  return (
    <>
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md safe-area-bottom"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-around h-14">
          {navItems.slice(0, 2).map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 w-16 h-full transition-colors",
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

          {/* Center create button */}
          {user ? (
            <button
              onClick={() => setCreateOpen(true)}
              className="flex flex-col items-center justify-center gap-0.5 w-16 h-full text-primary"
              aria-label="Create post"
            >
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center -mt-4 shadow-lg">
                <PlusCircle className="h-5 w-5 text-primary-foreground" />
              </div>
            </button>
          ) : (
            <button
              onClick={() => navigate("/questions")}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 w-16 h-full transition-colors",
                isActive("/questions")
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
              aria-label="Questions"
            >
              <HelpCircle className="h-5 w-5" />
              <span className="text-[10px] font-medium">Questions</span>
            </button>
          )}

          {navItems.slice(2).map((item) => {
            // Skip Questions for logged-in users (already have create button in center)
            if (user && item.path === "/questions") return null;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 w-16 h-full transition-colors relative",
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
            );
          })}
        </div>
      </nav>

      {/* Bottom nav spacer */}
      <div className="md:hidden h-14" />

      {/* Create post dialog for mobile */}
      {user && (
        <CreatePostDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
        />
      )}
    </>
  );
};

export default BottomNav;

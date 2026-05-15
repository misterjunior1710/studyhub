import { LogOut, Settings, UserPlus, Timer, LifeBuoy, Sparkles, Megaphone, Bookmark, Sun, Moon, Download, Calendar, Palette, Rss, NotebookPen, ChevronDown, Trophy, ListChecks, Users, HelpCircle, Search, Briefcase, UserCircle2, Target, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import CreatePostDialog from "./CreatePostDialog";
import NotificationsPopover from "./NotificationsPopover";
import ThemeToggle from "./ThemeToggle";
import MobileNav from "./MobileNav";
import CoinWallet from "./gamification/CoinWallet";
import StreakIndicator from "./gamification/StreakIndicator";
import LevelBadge from "./gamification/LevelBadge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "next-themes";
import { useEasterEggs } from "./EasterEggs";
import StudyHubLogo from "@/components/StudyHubLogo";
import GlobalSearch from "@/components/GlobalSearch";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface NavbarProps {
  onPostCreated?: () => void;
}

const Navbar = ({ onPostCreated }: NavbarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const { handleLogoClick } = useEasterEggs();
  const { user, username, profileData, isAdmin, profileLoading, signOut } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  const handleLogoClickWithNav = () => {
    handleLogoClick();
    navigate("/");
  };

  // Subtle active style — replaces solid pill with glow + underline + translucent bg
  const activeClass =
    "bg-primary/10 text-primary underline underline-offset-[6px] decoration-primary/70 decoration-2 shadow-[0_0_14px_-2px_hsl(var(--primary)/0.4)] hover:bg-primary/15";
  const inactiveClass = "text-foreground/80 hover:text-foreground hover:bg-accent/10";

  const coreItems = [
    { path: "/feed", label: "Feed", icon: Rss },
    { path: "/questions", label: "Questions", icon: HelpCircle },
    { path: "/tasks", label: "Tasks", icon: ListChecks },
    { path: "/assistant", label: "Nova AI", icon: Sparkles },
  ];

  const productivityItems = [
    { path: "/tasks", label: "Tasks", icon: ListChecks },
    { path: "/calendar", label: "Calendar", icon: Calendar },
    { path: "/notes", label: "Notes", icon: NotebookPen },
    { path: "/whiteboards", label: "Whiteboards", icon: Palette },
    { path: "/study", label: "Study Tools", icon: Timer },
    { path: "/content-generator", label: "AI Study Tools", icon: Sparkles },
    { path: "/transitions", label: "Life Skills", icon: Compass },
  ];

  const socialItems = [
    { path: "/friends", label: "Friends", icon: UserPlus },
    { path: "/groups", label: "Groups", icon: Users },
    { path: "/leaderboard", label: "Leaderboard", icon: Trophy },
    { path: "/missions", label: "Missions", icon: Target },
  ];

  const accountItems = [
    { path: "/saved", label: "Saved Posts", icon: Bookmark },
    { path: "/install", label: "Install App", icon: Download },
    { path: "/updates", label: "Updates", icon: Megaphone },
    { path: "/support", label: "Support", icon: LifeBuoy },
  ];

  const groupActive = (items: { path: string }[]) => items.some((i) => isActive(i.path));

  const renderDropdown = (
    label: string,
    icon: React.ElementType,
    items: { path: string; label: string; icon: React.ElementType }[],
  ) => {
    const Icon = icon;
    const active = groupActive(items);
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn("h-8 px-2.5 gap-1 rounded-md text-sm font-medium", active ? activeClass : inactiveClass)}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden lg:inline">{label}</span>
            <ChevronDown className="h-3 w-3 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="w-48">
          {items.map((it) => (
            <DropdownMenuItem key={it.path} onClick={() => navigate(it.path)}>
              <it.icon className="mr-2 h-4 w-4" />
              <span>{it.label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container mx-auto px-4">
        <div className="relative flex h-11 sm:h-12 items-center justify-between gap-2">
          {/* LEFT: Logo only */}
          <div className="flex items-center gap-1">
            <MobileNav />
            <button
              type="button"
              onClick={handleLogoClickWithNav}
              className="flex items-center gap-2 px-1.5 py-1 rounded-lg transition-all hover:bg-accent/10 hover:scale-[1.02] active:scale-95"
              aria-label="StudyHub home"
            >
              <StudyHubLogo className="h-8 w-8 sm:h-9 sm:w-9" />
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                StudyHub™
              </h1>
            </button>
          </div>

          {/* CENTER: Core actions + categorized dropdowns */}
          <div className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
            {coreItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Button
                  key={item.path}
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(item.path)}
                  className={cn("h-8 px-3 rounded-md text-sm font-medium gap-1.5", active ? activeClass : inactiveClass)}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Button>
              );
            })}
            <div className="mx-1 h-5 w-px bg-border/60" />
            {renderDropdown("Productivity", Briefcase, productivityItems)}
            {renderDropdown("Social", Users, socialItems)}
            {renderDropdown("Account", UserCircle2, accountItems)}
          </div>

          {/* RIGHT: Search, Notifications, Create, Avatar */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            <div className="md:hidden">
              <ThemeToggle />
            </div>
            {user ? (
              <>
                <div className="hidden xs:flex items-center gap-1 sm:gap-1.5 mr-1">
                  <StreakIndicator />
                  <CoinWallet />
                  <LevelBadge />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hidden sm:inline-flex rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/10"
                  onClick={() => setSearchOpen(true)}
                  aria-label="Open global search"
                  title="Search (Ctrl/Cmd+K)"
                >
                  <Search className="h-4 w-4" />
                </Button>
                <NotificationsPopover />
                <CreatePostDialog onPostCreated={onPostCreated} />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 relative" aria-label={`${username || "User"}'s profile menu`}>
                      <Avatar className="h-7 w-7">
                        {profileData.avatar_url && <AvatarImage src={profileData.avatar_url} alt={username || "User"} />}
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          {username.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 bg-popover text-popover-foreground border border-border shadow-md z-50 p-0">
                    <DropdownMenuLabel className="py-3">
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center gap-2">
                            {profileLoading ? (
                              <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                            ) : (
                              <p className="text-sm font-medium leading-none">{username || "User"}</p>
                            )}
                            {isAdmin && (
                              <span className="text-xs bg-destructive text-destructive-foreground px-2 py-0.5 rounded-full font-semibold">
                                ADMIN
                              </span>
                            )}
                          </div>
                          <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                        </div>
                        <div className="space-y-1">
                          {profileData.grade && (
                            <p className="text-xs text-muted-foreground"><span className="font-medium">Grade:</span> {profileData.grade}</p>
                          )}
                          {profileData.stream && (
                            <p className="text-xs text-muted-foreground"><span className="font-medium">Stream:</span> {profileData.stream}</p>
                          )}
                          {profileData.country && (
                            <p className="text-xs text-muted-foreground"><span className="font-medium">Country:</span> {profileData.country}</p>
                          )}
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <div className="py-1">
                      <DropdownMenuItem onClick={toggleTheme} className="hidden md:flex">
                        {theme === "dark" ? (<><Sun className="mr-2 h-4 w-4" /><span>Light Mode</span></>) : (<><Moon className="mr-2 h-4 w-4" /><span>Dark Mode</span></>)}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/settings")}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </DropdownMenuItem>
                    </div>
                    <DropdownMenuSeparator />
                    <div className="py-1">
                      <DropdownMenuItem onClick={handleSignOut}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sign out</span>
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <div className="hidden md:block">
                  <ThemeToggle />
                </div>
                <Button size="sm" onClick={() => navigate("/auth")}>Sign In</Button>
              </>
            )}
          </div>
        </div>
      </div>
      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </nav>
  );
};

export default Navbar;

import {
  LogOut, Settings, UserPlus, Timer, LifeBuoy, Sparkles, Megaphone, Bookmark,
  Sun, Moon, Download, Calendar, Palette, Rss, NotebookPen, Trophy, ListChecks,
  Users, HelpCircle, Search, Target, Compass, type LucideIcon,
} from "lucide-react";
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
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  NavigationMenu, NavigationMenuContent, NavigationMenuItem,
  NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { useTheme } from "next-themes";
import { useEasterEggs } from "./EasterEggs";
import StudyHubLogo from "@/components/StudyHubLogo";
import GlobalSearch from "@/components/GlobalSearch";
import { cn } from "@/lib/utils";
import { useEffect, useState, useCallback } from "react";

interface NavbarProps {
  onPostCreated?: () => void;
}

type LinkItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  description?: string;
};

const studyLinks: LinkItem[] = [
  { title: "Study Tools", href: "/study", icon: Timer, description: "Flashcards, quizzes, Pomodoro" },
  { title: "Nova AI", href: "/assistant", icon: Sparkles, description: "Your personal AI study buddy" },
  { title: "Notes", href: "/notes", icon: NotebookPen, description: "Capture and organise ideas" },
  { title: "Whiteboards", href: "/whiteboards", icon: Palette, description: "Visual collab in real time" },
];

const planLinks: LinkItem[] = [
  { title: "Tasks", href: "/tasks", icon: ListChecks, description: "Plan assignments and to-dos" },
  { title: "Calendar", href: "/calendar", icon: Calendar, description: "Events, deadlines, reminders" },
  { title: "Life Skills", href: "/transitions", icon: Compass, description: "Budgeting, savings, and beyond" },
  { title: "Missions", href: "/missions", icon: Target, description: "Daily challenges and rewards" },
];

const communityLinks: LinkItem[] = [
  { title: "Friends", href: "/friends", icon: UserPlus, description: "Find and chat with classmates" },
  { title: "Groups", href: "/groups", icon: Users, description: "Join Study Squads by subject" },
  { title: "Leaderboard", href: "/leaderboard", icon: Trophy, description: "See top learners this week" },
  { title: "Updates", href: "/updates", icon: Megaphone, description: "What's new on StudyHub" },
];

const resourceLinks: LinkItem[] = [
  { title: "Saved Posts", href: "/saved", icon: Bookmark },
  { title: "Install App", href: "/install", icon: Download },
  { title: "Support", href: "/support", icon: LifeBuoy },
];

function useScroll(threshold: number) {
  const [scrolled, setScrolled] = useState(false);
  const onScroll = useCallback(() => {
    setScrolled(window.scrollY > threshold);
  }, [threshold]);
  useEffect(() => {
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [onScroll]);
  return scrolled;
}

const Navbar = ({ onPostCreated }: NavbarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const { handleLogoClick } = useEasterEggs();
  const { user, username, profileData, isAdmin, profileLoading, signOut } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const scrolled = useScroll(8);

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
  const groupActive = (items: LinkItem[]) => items.some((i) => isActive(i.href));

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  const handleLogoClickWithNav = () => {
    handleLogoClick();
    navigate("/");
  };

  const renderMegaMenu = (label: string, items: LinkItem[]) => (
    <NavigationMenuItem>
      <NavigationMenuTrigger
        className={cn(
          "h-9 px-3 bg-transparent text-sm font-medium",
          groupActive(items) && "text-primary",
        )}
      >
        {label}
      </NavigationMenuTrigger>
      <NavigationMenuContent>
        <ul className="grid w-[520px] grid-cols-2 gap-1 p-3">
          {items.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <li key={item.href}>
                <NavigationMenuLink asChild>
                  <button
                    type="button"
                    onClick={() => navigate(item.href)}
                    className={cn(
                      "group flex w-full items-start gap-3 rounded-md p-3 text-left transition-colors hover:bg-accent/60 focus:bg-accent/60 focus:outline-none",
                      active && "bg-accent/40",
                    )}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary group-hover:bg-primary/15">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-sm font-medium leading-none">{item.title}</span>
                      {item.description && (
                        <span className="text-xs text-muted-foreground leading-snug line-clamp-2">
                          {item.description}
                        </span>
                      )}
                    </span>
                  </button>
                </NavigationMenuLink>
              </li>
            );
          })}
        </ul>
      </NavigationMenuContent>
    </NavigationMenuItem>
  );

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "border-b border-border bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-[0_1px_0_0_hsl(var(--border)/0.6)]"
          : "border-b border-transparent bg-background/60 backdrop-blur",
      )}
    >
      <div className="container mx-auto px-4">
        <div className="relative flex h-14 items-center justify-between gap-2">
          {/* LEFT: Mobile menu + Logo */}
          <div className="flex items-center gap-1">
            <MobileNav />
            <button
              type="button"
              onClick={handleLogoClickWithNav}
              className="flex items-center gap-2 rounded-lg px-1.5 py-1 transition-all hover:bg-accent/10 hover:scale-[1.02] active:scale-95"
              aria-label="StudyHub home"
            >
              <StudyHubLogo className="h-8 w-8 sm:h-9 sm:w-9" />
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                StudyHub™
              </h1>
            </button>
          </div>

          {/* CENTER: Mega menus */}
          <div className="hidden md:flex absolute left-1/2 -translate-x-1/2">
            <NavigationMenu>
              <NavigationMenuList>
                {renderMegaMenu("Study", studyLinks)}
                {renderMegaMenu("Plan", planLinks)}
                {renderMegaMenu("Community", communityLinks)}
                {!user && (
                  <NavigationMenuItem>
                    <button
                      type="button"
                      onClick={() => navigate("/pricing")}
                      className={cn(
                        "inline-flex h-9 items-center rounded-md px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                        isActive("/pricing") && "text-primary",
                      )}
                    >
                      Pricing
                    </button>
                  </NavigationMenuItem>
                )}
                {user && renderMegaMenu("More", resourceLinks)}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* RIGHT: Account / CTAs */}
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
                  className="h-9 w-9 hidden sm:inline-flex rounded-md text-muted-foreground hover:text-foreground"
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
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 relative"
                      aria-label={`${username || "User"}'s profile menu`}
                    >
                      <Avatar className="h-7 w-7">
                        {profileData.avatar_url && (
                          <AvatarImage src={profileData.avatar_url} alt={username || "User"} />
                        )}
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          {username.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-64 bg-popover text-popover-foreground border border-border shadow-md z-50 p-0"
                  >
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
                            <p className="text-xs text-muted-foreground">
                              <span className="font-medium">Grade:</span> {profileData.grade}
                            </p>
                          )}
                          {profileData.stream && (
                            <p className="text-xs text-muted-foreground">
                              <span className="font-medium">Stream:</span> {profileData.stream}
                            </p>
                          )}
                          {profileData.country && (
                            <p className="text-xs text-muted-foreground">
                              <span className="font-medium">Country:</span> {profileData.country}
                            </p>
                          )}
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <div className="py-1">
                      <DropdownMenuItem onClick={toggleTheme} className="hidden md:flex">
                        {theme === "dark" ? (
                          <><Sun className="mr-2 h-4 w-4" /><span>Light Mode</span></>
                        ) : (
                          <><Moon className="mr-2 h-4 w-4" /><span>Dark Mode</span></>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/pricing")}>
                        <Sparkles className="mr-2 h-4 w-4" />
                        <span>Upgrade to Pro</span>
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/auth")}
                  className="hidden sm:inline-flex"
                >
                  Sign In
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate("/auth")}
                  className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 px-3 sm:px-4 text-xs sm:text-sm whitespace-nowrap"
                >
                  Get Started
                </Button>
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

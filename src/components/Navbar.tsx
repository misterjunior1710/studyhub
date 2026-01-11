import { User, LogOut, Home, HelpCircle, Users, Settings, Trophy, UserPlus, Timer, LifeBuoy, Sparkles, Megaphone, Bookmark, Bell, Sun, Moon, Download, Calendar, Palette } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import CreatePostDialog from "./CreatePostDialog";
import NotificationsPopover from "./NotificationsPopover";
import ThemeToggle from "./ThemeToggle";
import MobileNav from "./MobileNav";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "next-themes";

interface NavbarProps {
  onPostCreated?: () => void;
}

const Navbar = ({
  onPostCreated
}: NavbarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const {
    user,
    username,
    profileData,
    isAdmin,
    profileLoading,
    signOut
  } = useAuth();
  
  const isActive = (path: string) => location.pathname === path;
  
  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/95">
      <div className="container mx-auto px-4">
        <div className="flex h-14 sm:h-16 items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-6">
            <MobileNav />
            <h1 
              className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent cursor-pointer px-2 py-1 rounded-lg transition-colors hover:bg-accent/10" 
              onClick={() => navigate("/")}
            >
              StudyHub
            </h1>
            <div className="hidden md:flex items-center gap-1">
              <Button variant={isActive("/") || isActive("/feed") ? "default" : "ghost"} size="sm" onClick={() => navigate("/feed")}>
                <Home className="h-4 w-4 mr-2" />
                Feed
              </Button>
              <Button variant={isActive("/questions") ? "default" : "ghost"} size="sm" onClick={() => navigate("/questions")}>
                <HelpCircle className="h-4 w-4 mr-2" />
                Questions
              </Button>
              <Button variant={isActive("/groups") ? "default" : "ghost"} size="sm" onClick={() => navigate("/groups")}>
                <Users className="h-4 w-4 mr-2" />
                Groups
              </Button>
              <Button variant={isActive("/leaderboard") ? "default" : "ghost"} size="sm" onClick={() => navigate("/leaderboard")}>
                <Trophy className="h-4 w-4 mr-2" />
                Leaderboard
              </Button>
              <Button variant={isActive("/friends") ? "default" : "ghost"} size="sm" onClick={() => navigate("/friends")}>
                <UserPlus className="h-4 w-4 mr-2" />
                Friends
              </Button>
              <Button variant={isActive("/study") ? "default" : "ghost"} size="sm" onClick={() => navigate("/study")}>
                <Timer className="h-4 w-4 mr-2" />
                Study
              </Button>
              <Button variant={isActive("/content-generator") ? "default" : "ghost"} size="sm" onClick={() => navigate("/content-generator")}>
                <Sparkles className="h-4 w-4 mr-2" />
                AI
              </Button>
              <Button variant={isActive("/updates") ? "default" : "ghost"} size="sm" onClick={() => navigate("/updates")}>
                <Megaphone className="h-4 w-4 mr-2" />
                Updates
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            {/* Mobile: Show theme toggle and notifications outside dropdown */}
            <div className="md:hidden">
              <ThemeToggle />
            </div>
            {user ? (
              <>
                {/* Show notifications popover - visible on all screens */}
                <NotificationsPopover />
                <div className="hidden sm:block">
                  <CreatePostDialog onPostCreated={onPostCreated} />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative" aria-label={`${username || 'User'}'s profile menu`}>
                      <Avatar className="h-8 w-8" title={`${username || 'User'}'s profile`}>
                        {profileData.avatar_url && (
                          <AvatarImage src={profileData.avatar_url} alt={username || 'User'} />
                        )}
                        <AvatarFallback className="bg-primary text-primary-foreground">
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

                    {/* Study actions */}
                    <div className="py-1">
                      <DropdownMenuItem onClick={() => navigate("/calendar")}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        <span>Calendar</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/whiteboards")}
                      >
                        <Palette className="mr-2 h-4 w-4" />
                        <span>Whiteboards</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/saved")}
                      >
                        <Bookmark className="mr-2 h-4 w-4" />
                        <span>Saved Posts</span>
                      </DropdownMenuItem>
                    </div>

                    <DropdownMenuSeparator />

                    {/* Utilities */}
                    <div className="py-1">
                      <DropdownMenuItem onClick={() => navigate("/install")}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        <span>Install App</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/support")}
                      >
                        <LifeBuoy className="mr-2 h-4 w-4" />
                        <span>Support</span>
                      </DropdownMenuItem>
                    </div>

                    <DropdownMenuSeparator />

                    {/* Preferences */}
                    <div className="py-1">
                      {/* Desktop only: Theme toggle in dropdown */}
                      <DropdownMenuItem onClick={toggleTheme} className="hidden md:flex">
                        {theme === "dark" ? (
                          <>
                            <Sun className="mr-2 h-4 w-4" />
                            <span>Light Mode</span>
                          </>
                        ) : (
                          <>
                            <Moon className="mr-2 h-4 w-4" />
                            <span>Dark Mode</span>
                          </>
                        )}
                      </DropdownMenuItem>

                      <DropdownMenuItem onClick={() => navigate("/settings")}
                      >
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
              <Button onClick={() => navigate("/auth")}>Sign In</Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

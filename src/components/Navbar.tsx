import { User, LogOut, Home, HelpCircle, Laugh, Users, Settings, Trophy, UserPlus, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import CreatePostDialog from "./CreatePostDialog";
import NotificationsPopover from "./NotificationsPopover";
import ThemeToggle from "./ThemeToggle";
import MobileNav from "./MobileNav";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface NavbarProps {
  onPostCreated?: () => void;
}

const Navbar = ({ onPostCreated }: NavbarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, username, profileData, isAdmin, profileLoading, signOut } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-14 sm:h-16 items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-6">
            <MobileNav />
            <h1
              className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent cursor-pointer"
              onClick={() => navigate("/")}
            >
              StudyHub
            </h1>
            <div className="hidden md:flex items-center gap-2">
              <Button variant={isActive("/") ? "default" : "ghost"} size="sm" onClick={() => navigate("/")}>
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
              <Button variant={isActive("/ask-doubt") ? "default" : "ghost"} size="sm" onClick={() => navigate("/ask-doubt")}>
                <HelpCircle className="h-4 w-4 mr-2" />
                Doubts
              </Button>
              <Button variant={isActive("/memes") ? "default" : "ghost"} size="sm" onClick={() => navigate("/memes")}>
                <Laugh className="h-4 w-4 mr-2" />
                Memes
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
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <ThemeToggle />
            {user ? (
              <>
                <NotificationsPopover />
                <div className="hidden sm:block">
                  <CreatePostDialog onPostCreated={onPostCreated} />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {username.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
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
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <div className="px-2 py-2 space-y-1">
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
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/settings")}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
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

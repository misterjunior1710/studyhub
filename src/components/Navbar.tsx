import { Search, User, LogOut, Home, HelpCircle, Laugh } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { toast } from "sonner";
import CreatePostDialog from "./CreatePostDialog";
import NotificationsPopover from "./NotificationsPopover";
import ThemeToggle from "./ThemeToggle";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface NavbarProps {
  onPostCreated?: () => void;
  onSearch?: (query: string) => void;
}

const Navbar = ({ onPostCreated, onSearch }: NavbarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [username, setUsername] = useState<string>("");
  const [profileData, setProfileData] = useState<{ country?: string; grade?: string; stream?: string }>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUsername(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchUsername(session.user.id);
        } else {
          setUsername("");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUsername = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("username, country, grade, stream")
      .eq("id", userId)
      .single();
    
    if (data) {
      setUsername(data.username || "");
      setProfileData({
        country: data.country || undefined,
        grade: data.grade || undefined,
        stream: data.stream || undefined,
      });
    }

    // Check if user is admin
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    
    setIsAdmin(!!roleData);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch?.(searchQuery);
      // Navigate to home to show all search results
      if (location.pathname !== "/") {
        navigate("/");
      }
    }
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <h1 
              className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent cursor-pointer"
              onClick={() => navigate("/")}
            >
              StudyHub
            </h1>
            <div className="hidden md:flex items-center gap-2">
              <Button
                variant={isActive("/") ? "default" : "ghost"}
                size="sm"
                onClick={() => navigate("/")}
              >
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
              <Button
                variant={isActive("/ask-doubt") ? "default" : "ghost"}
                size="sm"
                onClick={() => navigate("/ask-doubt")}
              >
                <HelpCircle className="h-4 w-4 mr-2" />
                Ask Doubt
              </Button>
              <Button
                variant={isActive("/memes") ? "default" : "ghost"}
                size="sm"
                onClick={() => navigate("/memes")}
              >
                <Laugh className="h-4 w-4 mr-2" />
                Memes
              </Button>
            </div>
          </div>

          <div className="flex-1 max-w-2xl">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search for questions, topics, or subjects..."
                className="w-full pl-10 bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              <>
                <NotificationsPopover />
                <CreatePostDialog onPostCreated={onPostCreated} />
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
                          <p className="text-sm font-medium leading-none">{username || "User"}</p>
                          {isAdmin && (
                            <span className="text-xs bg-destructive text-destructive-foreground px-2 py-0.5 rounded-full font-semibold">
                              ADMIN
                            </span>
                          )}
                        </div>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
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
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button onClick={() => navigate("/auth")}>
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

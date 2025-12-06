import { User, LogOut, Settings, Search, Plus } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface NavbarProps {
  onPostCreated?: () => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}

const Navbar = ({ onPostCreated, searchValue, onSearchChange }: NavbarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [username, setUsername] = useState<string>("");
  const [profileData, setProfileData] = useState<{
    country?: string;
    grade?: string;
    stream?: string;
  }>({});
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUsername(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUsername(session.user.id);
      } else {
        setUsername("");
      }
    });

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

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card">
      <div className="container mx-auto px-4">
        <div className="flex h-12 items-center gap-4">
          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer flex-shrink-0"
            onClick={() => navigate("/")}
          >
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">S</span>
            </div>
            <span className="text-xl font-bold text-foreground hidden sm:block">
              studyhub
            </span>
          </div>

          {/* Search Bar */}
          {onSearchChange && (
            <div className="flex-1 max-w-xl hidden sm:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search StudyHub"
                  className="w-full pl-10 bg-secondary border-0 focus-visible:ring-1 focus-visible:ring-primary h-10 rounded-full"
                  value={searchValue}
                  onChange={(e) => onSearchChange(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Right Section */}
          <div className="flex items-center gap-2 ml-auto">
            <ThemeToggle />
            
            {user ? (
              <>
                <NotificationsPopover />
                <CreatePostDialog onPostCreated={onPostCreated} />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                          {username.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{username || "User"}</p>
                          {isAdmin && (
                            <span className="text-xs bg-destructive text-destructive-foreground px-2 py-0.5 rounded-full font-semibold">
                              ADMIN
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {(profileData.grade || profileData.stream || profileData.country) && (
                      <>
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
                      </>
                    )}
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
              <Button 
                onClick={() => navigate("/auth")}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
              >
                Log In
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

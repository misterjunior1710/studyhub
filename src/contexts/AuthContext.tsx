import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Session timeout configuration
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const ACTIVITY_DEBOUNCE = 5000; // 5 seconds
const CHECK_INTERVAL = 60 * 1000; // Check every minute

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  username: string;
  profileData: {
    country?: string;
    grade?: string;
    stream?: string;
    avatar_url?: string;
  };
  showSessionExpired: boolean;
  refreshSession: () => Promise<void>;
  signOut: () => Promise<void>;
  resetSessionExpired: () => void;
}

const defaultAuthContext: AuthContextType = {
  user: null,
  session: null,
  isLoading: true,
  isAdmin: false,
  username: "",
  profileData: {},
  showSessionExpired: false,
  refreshSession: async () => {},
  signOut: async () => {},
  resetSessionExpired: () => {},
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export const useAuth = () => {
  return useContext(AuthContext);
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [username, setUsername] = useState("");
  const [profileData, setProfileData] = useState<{
    country?: string;
    grade?: string;
    stream?: string;
    avatar_url?: string;
  }>({});
  const [showSessionExpired, setShowSessionExpired] = useState(false);
  
  // Activity tracking refs
  const lastActivityRef = useRef<number>(Date.now());
  const activityTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced activity update
  const updateActivity = useCallback(() => {
    const now = Date.now();
    if (now - lastActivityRef.current > ACTIVITY_DEBOUNCE) {
      lastActivityRef.current = now;
    }
  }, []);

  // Reset session expired state
  const resetSessionExpired = useCallback(() => {
    setShowSessionExpired(false);
    lastActivityRef.current = Date.now();
  }, []);

  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("username, country, grade, stream, avatar_url")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
        setUsername("");
        setProfileData({});
        return;
      }

      if (data) {
        setUsername(data.username || "");
        setProfileData({
          country: data.country || undefined,
          grade: data.grade || undefined,
          stream: data.stream || undefined,
          avatar_url: data.avatar_url || undefined,
        });
      } else {
        setUsername("");
        setProfileData({});
      }

      // Check admin role
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();

      setIsAdmin(!!roleData);
    } catch (error) {
      console.error("Error in fetchUserProfile:", error);
      setUsername("");
      setProfileData({});
      setIsAdmin(false);
    }
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error("Session refresh failed:", error);
        // Session is truly expired, clear state
        setUser(null);
        setSession(null);
        setUsername("");
        setProfileData({});
        setIsAdmin(false);
        toast.error("Session expired. Please sign in again.");
        return;
      }
      
      if (data.session) {
        setSession(data.session);
        setUser(data.session.user);
      }
    } catch (error) {
      console.error("Error refreshing session:", error);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setUsername("");
      setProfileData({});
      setIsAdmin(false);
      toast.success("Signed out successfully");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out");
    }
  }, []);

  // Activity tracking effect
  useEffect(() => {
    if (!session) return;

    const handleActivity = () => updateActivity();
    
    // Listen for user activity
    window.addEventListener("mousemove", handleActivity, { passive: true });
    window.addEventListener("keydown", handleActivity, { passive: true });
    window.addEventListener("click", handleActivity, { passive: true });
    window.addEventListener("scroll", handleActivity, { passive: true });
    window.addEventListener("touchstart", handleActivity, { passive: true });

    // Check for inactivity periodically
    const checkInactivity = setInterval(() => {
      if (session && Date.now() - lastActivityRef.current > INACTIVITY_TIMEOUT) {
        setShowSessionExpired(true);
      }
    }, CHECK_INTERVAL);

    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("click", handleActivity);
      window.removeEventListener("scroll", handleActivity);
      window.removeEventListener("touchstart", handleActivity);
      clearInterval(checkInactivity);
    };
  }, [session, updateActivity]);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        // Synchronous state updates only
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setIsLoading(false);

        // Defer profile fetch with setTimeout to avoid deadlock
        if (currentSession?.user) {
          setTimeout(() => {
            fetchUserProfile(currentSession.user.id);
          }, 0);
          // Reset activity on new session
          lastActivityRef.current = Date.now();
          setShowSessionExpired(false);
        } else {
          setUsername("");
          setProfileData({});
          setIsAdmin(false);
        }

        // Handle token refresh errors
        if (event === "TOKEN_REFRESHED" && !currentSession) {
          toast.error("Session expired. Please sign in again.");
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession }, error }) => {
      if (error) {
        console.error("Error getting session:", error);
        setIsLoading(false);
        return;
      }

      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setIsLoading(false);

      if (currentSession?.user) {
        fetchUserProfile(currentSession.user.id);
        lastActivityRef.current = Date.now();
      }
    });

    // Refresh session on window focus (for returning to idle tabs)
    const handleFocus = () => {
      updateActivity();
      if (session) {
        // Check if session is about to expire (within 5 minutes)
        const expiresAt = session.expires_at;
        if (expiresAt) {
          const expiryTime = expiresAt * 1000;
          const now = Date.now();
          const fiveMinutes = 5 * 60 * 1000;
          
          if (expiryTime - now < fiveMinutes) {
            refreshSession();
          }
        }
      }
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("focus", handleFocus);
      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current);
      }
    };
  }, [fetchUserProfile, refreshSession, session, updateActivity]);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isAdmin,
        username,
        profileData,
        showSessionExpired,
        refreshSession,
        signOut,
        resetSessionExpired,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

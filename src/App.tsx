import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import OfflineBanner from "@/components/OfflineBanner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { useThemePersistence } from "@/hooks/useThemePersistence";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import SessionExpiredDialog from "@/components/SessionExpiredDialog";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";

// Eager load critical pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";

// Lazy load non-critical pages for better initial load
const Post = lazy(() => import("./pages/Post"));
const Questions = lazy(() => import("./pages/Questions"));
const Groups = lazy(() => import("./pages/Groups"));
const GroupChat = lazy(() => import("./pages/GroupChat"));
const Settings = lazy(() => import("./pages/Settings"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const Friends = lazy(() => import("./pages/Friends"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const NotFound = lazy(() => import("./pages/NotFound"));
const UserProfile = lazy(() => import("./pages/UserProfile"));
const StudyMode = lazy(() => import("./pages/StudyMode"));
const Support = lazy(() => import("./pages/Support"));
const DirectMessage = lazy(() => import("./pages/DirectMessage"));
const ContentGenerator = lazy(() => import("./pages/ContentGenerator"));

// Optimized QueryClient with proper caching and garbage collection
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      gcTime: 30 * 60 * 1000, // 30 minutes
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: true,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      networkMode: "online",
    },
    mutations: {
      retry: 2,
      networkMode: "online",
    },
  },
});

const ThemeInitializer = ({ children }: { children: React.ReactNode }) => {
  useThemePersistence();
  return <>{children}</>;
};

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

// Session expired handler component (needs to be inside BrowserRouter)
const SessionExpiredHandler = () => {
  const navigate = useNavigate();
  const { showSessionExpired, refreshSession, resetSessionExpired } = useAuth();

  const handleRefresh = async () => {
    await refreshSession();
    resetSessionExpired();
  };

  const handleSignIn = () => {
    resetSessionExpired();
    navigate("/auth");
  };

  return (
    <SessionExpiredDialog
      open={showSessionExpired}
      onRefresh={handleRefresh}
      onSignIn={handleSignIn}
    />
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <ThemeInitializer>
          <TooltipProvider>
            <OfflineBanner />
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <SessionExpiredHandler />
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/post/:id" element={<Post />} />
                  <Route path="/questions" element={<Questions />} />
                  <Route path="/groups" element={<Groups />} />
                  <Route path="/groups/:id" element={<GroupChat />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/leaderboard" element={<Leaderboard />} />
                  <Route path="/friends" element={<Friends />} />
                  <Route path="/dm/:friendId" element={<DirectMessage />} />
                  <Route path="/user/:userId" element={<UserProfile />} />
                  <Route path="/study" element={<StudyMode />} />
                  <Route path="/content-generator" element={<ContentGenerator />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/support" element={<Support />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </ThemeInitializer>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

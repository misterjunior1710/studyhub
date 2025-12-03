import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { useThemePersistence } from "@/hooks/useThemePersistence";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";

// Eager load critical pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";

// Lazy load non-critical pages for better initial load
const Post = lazy(() => import("./pages/Post"));
const AskDoubt = lazy(() => import("./pages/AskDoubt"));
const Memes = lazy(() => import("./pages/Memes"));
const Groups = lazy(() => import("./pages/Groups"));
const GroupChat = lazy(() => import("./pages/GroupChat"));
const Settings = lazy(() => import("./pages/Settings"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const Friends = lazy(() => import("./pages/Friends"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const NotFound = lazy(() => import("./pages/NotFound"));
const UserProfile = lazy(() => import("./pages/UserProfile"));

// Optimized QueryClient with proper caching and garbage collection
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time: how long data is considered fresh
      staleTime: 30 * 1000, // 30 seconds
      // Garbage collection time: how long inactive queries stay in cache
      gcTime: 10 * 60 * 1000, // 10 minutes
      // Refetch policies
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: true,
      // Retry configuration
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Network mode
      networkMode: "online",
    },
    mutations: {
      retry: 1,
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ThemeInitializer>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/post/:id" element={<Post />} />
                <Route path="/ask-doubt" element={<AskDoubt />} />
                <Route path="/memes" element={<Memes />} />
                <Route path="/groups" element={<Groups />} />
                <Route path="/groups/:id" element={<GroupChat />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/friends" element={<Friends />} />
                <Route path="/user/:userId" element={<UserProfile />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeInitializer>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import OfflineBanner from "@/components/OfflineBanner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { useThemePersistence } from "@/hooks/useThemePersistence";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { GamificationProvider } from "@/contexts/GamificationContext";
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import OnboardingFlow from "@/components/onboarding";
import SessionExpiredDialog from "@/components/SessionExpiredDialog";
import PageTransition from "@/components/PageTransition";
import CursorHighlighter from "@/components/CursorHighlighter";
import LevelUpDialog from "@/components/gamification/LevelUpDialog";
import BadgeUnlockToast from "@/components/gamification/BadgeUnlockToast";
import ErrorBoundary from "@/components/ErrorBoundary";
import { PremiumMomentProvider } from "@/components/pro/PremiumMomentDialog";

import { lazy, Suspense } from "react";
import BottomNav from "@/components/BottomNav";
import AnimatedLoadingSkeleton from "@/components/ui/animated-loading-skeleton";
import { shouldSkipHeavyVisuals } from "@/lib/networkAware";
const BackgroundGradientAnimation = lazy(() =>
  import("@/components/ui/background-gradient-animation").then((m) => ({
    default: m.BackgroundGradientAnimation,
  })),
);
const skipHeavyBg = shouldSkipHeavyVisuals();

// Eager load critical pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import ProfileOnboarding from "./pages/ProfileOnboarding";
import ProfileOnboardingGuard from "@/components/ProfileOnboardingGuard";

// Lazy load non-critical pages for better initial load
const Feed = lazy(() => import("./pages/Feed"));
const Post = lazy(() => import("./pages/Post"));
const Questions = lazy(() => import("./pages/Questions"));
const Groups = lazy(() => import("./pages/Groups"));
const GroupChat = lazy(() => import("./pages/GroupChat"));
const Settings = lazy(() => import("./pages/Settings"));

const Friends = lazy(() => import("./pages/Friends"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const NotFound = lazy(() => import("./pages/NotFound"));
const UserProfile = lazy(() => import("./pages/UserProfile"));
const StudyMode = lazy(() => import("./pages/StudyMode"));
const Support = lazy(() => import("./pages/Support"));
const DirectMessage = lazy(() => import("./pages/DirectMessage"));
const ContentGenerator = lazy(() => import("./pages/ContentGenerator"));
const Updates = lazy(() => import("./pages/Updates"));
const SavedPosts = lazy(() => import("./pages/SavedPosts"));
const Install = lazy(() => import("./pages/Install"));
const Calendar = lazy(() => import("./pages/Calendar"));
const GroupTools = lazy(() => import("./pages/GroupTools"));
const Whiteboards = lazy(() => import("./pages/Whiteboards"));
const Notes = lazy(() => import("./pages/Notes"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const Missions = lazy(() => import("./pages/Missions"));
const Tasks = lazy(() => import("./pages/Tasks"));
const Assistant = lazy(() => import("./pages/Assistant"));
const Transitions = lazy(() => import("./pages/Transitions"));
const TransitionModule = lazy(() => import("./pages/TransitionModule"));
const TransitionResources = lazy(() => import("./pages/TransitionResources"));
const Pricing = lazy(() => import("./pages/Pricing"));
const StudyGuides = lazy(() => import("./pages/StudyGuides"));
const StudyGuideDetail = lazy(() => import("./pages/StudyGuideDetail"));
const Refund = lazy(() => import("./pages/Refund"));
const SuccessBasic = lazy(() => import("./pages/SuccessBasic"));
const SuccessPro = lazy(() => import("./pages/SuccessPro"));
const SuccessProYearly = lazy(() => import("./pages/SuccessProYearly"));
const FloatingAssistant = lazy(() => import("@/components/assistant/FloatingAssistant"));
const AdminAudit = lazy(() => import("./pages/AdminAudit"));
const RequirePro = lazy(() => import("@/components/pro/RequirePro"));

// Optimized QueryClient — tuned aggressively to minimize DB hits.
// staleTime is 5 min so a re-mount within that window is FREE.
// refetchOnWindowFocus is OFF (realtime + manual refresh cover live updates).
// retries are 1 so failing requests don't 4x our DB cost on outages.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: false,
      retry: 1,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
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
const PageLoader = () => <AnimatedLoadingSkeleton />;

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
  <ErrorBoundary>
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <AuthProvider>
        <GamificationProvider>
        <OnboardingProvider>
        <PremiumMomentProvider>
          <ThemeInitializer>
            <TooltipProvider>
              <CursorHighlighter />
              <OfflineBanner />
              <Toaster />
              <Sonner />
              
              <BrowserRouter>
                {!skipHeavyBg && (
                  <Suspense fallback={null}>
                    <BackgroundGradientAnimation
                      containerClassName="fixed inset-0 -z-10 h-screen w-screen motion-reduce:hidden"
                    />
                  </Suspense>
                )}
                <a href="#main-content" className="skip-to-main">Skip to main content</a>
                <SessionExpiredHandler />
                <OnboardingFlow />
                <LevelUpDialog />
                <BadgeUnlockToast />
                <Suspense fallback={<PageLoader />}>
                  <ProfileOnboardingGuard>
                    <PageTransition>
                      <main id="main-content" tabIndex={-1}>
                        <Routes>
                          <Route path="/" element={<Index />} />
                          <Route path="/feed" element={<Feed />} />
                          <Route path="/auth" element={<Auth />} />
                          <Route path="/reset-password" element={<ResetPassword />} />
                          <Route path="/profile-onboarding" element={<ProfileOnboarding />} />
                          <Route path="/post/:id" element={<Post />} />
                        <Route path="/questions" element={<Questions />} />
                        <Route path="/groups" element={<Groups />} />
                        <Route path="/groups/:id" element={<GroupChat />} />
                        <Route path="/groups/:id/tools" element={<GroupTools />} />
                        <Route path="/settings" element={<Settings />} />
                        
                        <Route path="/friends" element={<Friends />} />
                        <Route path="/dm/:friendId" element={<DirectMessage />} />
                        <Route path="/user/:userId" element={<UserProfile />} />
                        <Route path="/study" element={<StudyMode />} />
                        <Route path="/content-generator" element={
                          <RequirePro feature="AI Study Content Generator" description="Generate full study notes, key concepts, examples, and practice questions in seconds with the Pro AI generator.">
                            <ContentGenerator />
                          </RequirePro>
                        } />
                        <Route path="/updates" element={<Updates />} />
                        <Route path="/saved" element={<SavedPosts />} />
                        <Route path="/install" element={<Install />} />
                        <Route path="/calendar" element={<Calendar />} />
                        <Route path="/whiteboards" element={
                          <RequirePro feature="Collaborative Whiteboards" description="Brainstorm together in real time. Pro unlocks unlimited collaborative whiteboards and docs.">
                            <Whiteboards />
                          </RequirePro>
                        } />
                        <Route path="/notes" element={<Notes />} />
                        <Route path="/leaderboard" element={<Leaderboard />} />
                        <Route path="/missions" element={<Missions />} />
                        <Route path="/tasks" element={<Tasks />} />
                        <Route path="/assistant" element={<Assistant />} />
                        <Route path="/transitions" element={<Transitions />} />
                        <Route path="/transitions/resources" element={<TransitionResources />} />
                        <Route path="/transitions/:moduleSlug" element={<TransitionModule />} />
                        <Route path="/privacy" element={<Privacy />} />
                        <Route path="/terms" element={<Terms />} />
                        <Route path="/support" element={<Support />} />
                        <Route path="/pricing" element={<Pricing />} />
                        <Route path="/study-guides" element={<StudyGuides />} />
                        <Route path="/study-guides/:slug" element={<StudyGuideDetail />} />
                        <Route path="/refund" element={<Refund />} />
                        <Route path="/success/basic" element={<SuccessBasic />} />
                        <Route path="/success/pro" element={<SuccessPro />} />
                        <Route path="/success/pro/yearly" element={<SuccessProYearly />} />
                        <Route path="/admin/audit" element={<AdminAudit />} />
                          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </main>
                    </PageTransition>
                  </ProfileOnboardingGuard>
                </Suspense>
                <BottomNav />
                <Suspense fallback={null}>
                  <FloatingAssistant />
                </Suspense>
              </BrowserRouter>
            </TooltipProvider>
          </ThemeInitializer>
        </PremiumMomentProvider>
        </OnboardingProvider>
        </GamificationProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
  </ErrorBoundary>
);

export default App;

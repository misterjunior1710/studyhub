import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { useThemePersistence } from "@/hooks/useThemePersistence";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Post from "./pages/Post";
import AskDoubt from "./pages/AskDoubt";
import Memes from "./pages/Memes";
import Groups from "./pages/Groups";
import GroupChat from "./pages/GroupChat";
import Settings from "./pages/Settings";
import Leaderboard from "./pages/Leaderboard";
import Friends from "./pages/Friends";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import AdminNotifications from "./pages/AdminNotifications";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ThemeInitializer = ({ children }: { children: React.ReactNode }) => {
  useThemePersistence();
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ThemeInitializer>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
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
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/admin/notifications" element={<AdminNotifications />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeInitializer>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

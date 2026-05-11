import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { X, Maximize2 } from "lucide-react";
import { NovaIcon } from "./NovaIcon";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { AssistantChat } from "@/components/assistant/AssistantChat";
import { cn } from "@/lib/utils";

// Routes where the floating button should be hidden (chat lives on its own page)
const HIDDEN_ROUTES = ["/assistant", "/auth", "/profile-onboarding"];

export const FloatingAssistant = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);

  // Reset thread when closing fully
  useEffect(() => { if (!open) setThreadId(null); }, [open]);

  if (!user) return null;
  if (HIDDEN_ROUTES.some((r) => location.pathname.startsWith(r))) return null;

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        size="icon"
        aria-label="Open AI Assistant"
        className={cn(
          "fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40",
          "h-12 w-12 rounded-full shadow-lg",
          "bg-primary text-primary-foreground hover:scale-105 transition-transform"
        )}
      >
        <Sparkles className="h-5 w-5" aria-hidden />
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="p-0 w-full sm:max-w-md md:max-w-lg flex flex-col gap-0"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" aria-hidden />
              <h2 className="text-sm font-semibold">StudyHub Assistant</h2>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => { setOpen(false); navigate(threadId ? `/assistant?t=${threadId}` : "/assistant"); }}
                aria-label="Open full page"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setOpen(false)}
                aria-label="Close assistant"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <AssistantChat
              threadId={threadId}
              onThreadCreated={setThreadId}
              compact
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default FloatingAssistant;

import { useEffect, useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "cache-notice-dismissed-session";

const CacheNoticePopup = () => {
  const [visible, setVisible] = useState(false);
  const [isMac, setIsMac] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === "1") return;
    } catch {
      // sessionStorage may be unavailable; show anyway
    }

    const ua = navigator.userAgent;
    setIsMac(/Mac|iPhone|iPad|iPod/i.test(ua));
    setIsMobile(/Mobi|Android|iPhone|iPad|iPod/i.test(ua));

    // Defer to avoid blocking initial render
    const t = window.setTimeout(() => setVisible(true), 1500);
    return () => window.clearTimeout(t);
  }, []);

  const dismiss = () => {
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 right-4 left-4 sm:left-auto z-[60] max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="rounded-lg border border-border bg-card text-card-foreground shadow-lg p-4">
        <div className="flex items-start gap-3">
          <div className="shrink-0 rounded-md bg-primary/10 text-primary p-2">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold mb-1">⚠️ Important Notice</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {isMobile
                ? "If you experience issues, pull to refresh or clear your browser cache."
                : isMac
                ? "If you experience issues, please hard refresh using Cmd + Shift + R."
                : "If you experience issues, please hard refresh using Ctrl + Shift + R (Windows) or Cmd + Shift + R (Mac)."}
            </p>
            <div className="mt-3 flex justify-end">
              <Button size="sm" onClick={dismiss} className="h-7 text-xs">
                Got it
              </Button>
            </div>
          </div>
          <button
            onClick={dismiss}
            aria-label="Dismiss notice"
            className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CacheNoticePopup;

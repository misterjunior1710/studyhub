import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Cookie, X, Settings2 } from "lucide-react";
import { Link } from "react-router-dom";

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem("cookie-consent", JSON.stringify({
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString()
    }));
    setShowBanner(false);
  };

  const acceptNecessary = () => {
    localStorage.setItem("cookie-consent", JSON.stringify({
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString()
    }));
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return createPortal(
    <div
      className="fixed bottom-0 left-0 right-0 z-[9999] p-3 sm:p-4 bg-card/95 backdrop-blur-md border-t border-border/50 shadow-lg animate-slide-up"
    >
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center gap-3">
        <div className="flex items-center gap-2 flex-1">
          <Cookie className="h-4 w-4 text-primary shrink-0" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            We use cookies to make your experience better (not the chocolate chip kind, sadly).{" "}
            <Link to="/privacy" className="text-primary hover:underline">
              Learn more
            </Link>
          </p>
        </div>

        {showDetails && (
          <div className="space-y-1.5 p-2 rounded-md bg-muted/50 text-xs animate-fade-in">
            <div className="flex items-center justify-between gap-4">
              <span className="font-medium">Necessary</span>
              <span className="text-muted-foreground">Always on</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="font-medium">Analytics</span>
              <span className="text-muted-foreground">Optional</span>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 shrink-0">
          <Button onClick={acceptAll} variant="gradient" size="sm" className="h-8 text-xs">
            Accept All
          </Button>
          <Button onClick={acceptNecessary} variant="outline" size="sm" className="h-8 text-xs">
            Decline
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowDetails(!showDetails)}
            className="h-8 w-8 text-muted-foreground shrink-0"
            title={showDetails ? "Hide details" : "Show details"}
          >
            <Settings2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={acceptNecessary}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CookieConsent;

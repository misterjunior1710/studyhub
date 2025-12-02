import { useState, useEffect } from "react";
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
      // Small delay for better UX
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

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 animate-slide-up">
      <Card className="max-w-4xl mx-auto p-6 bg-card/95 backdrop-blur-md border-primary/20 shadow-2xl">
        <div className="flex items-start gap-4">
          <div className="hidden sm:flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent shrink-0">
            <Cookie className="h-6 w-6 text-white" />
          </div>
          
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Cookie className="h-5 w-5 sm:hidden text-primary" />
                We value your privacy 🍪
              </h3>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 -mr-2 -mt-2"
                onClick={acceptNecessary}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground">
              We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. 
              By clicking "Accept All", you consent to our use of cookies.{" "}
              <Link to="/privacy" className="text-primary hover:underline">
                Learn more
              </Link>
            </p>

            {showDetails && (
              <div className="space-y-2 p-3 rounded-lg bg-muted/50 text-sm animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Necessary cookies</span>
                  <span className="text-xs text-muted-foreground">Always active</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Essential for the website to function properly. Cannot be disabled.
                </p>
                <div className="flex items-center justify-between pt-2">
                  <span className="font-medium">Analytics cookies</span>
                  <span className="text-xs text-muted-foreground">Optional</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Help us understand how visitors interact with our website.
                </p>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Button onClick={acceptAll} variant="gradient" size="sm">
                Accept All
              </Button>
              <Button onClick={acceptNecessary} variant="outline" size="sm">
                Necessary Only
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
                className="text-muted-foreground"
              >
                <Settings2 className="h-4 w-4 mr-1" />
                {showDetails ? "Hide" : "Show"} Details
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CookieConsent;

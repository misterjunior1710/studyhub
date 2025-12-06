import { useState, useEffect } from "react";
import { WifiOff, Wifi, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const OfflineBanner = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showBanner, setShowBanner] = useState(!navigator.onLine);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [justReconnected, setJustReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setJustReconnected(true);
      // Show "back online" message briefly
      setTimeout(() => {
        setShowBanner(false);
        setJustReconnected(false);
      }, 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
      setJustReconnected(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleRetry = async () => {
    setIsReconnecting(true);
    
    try {
      // Try to fetch a small resource to check connectivity
      await fetch("https://www.google.com/favicon.ico", { 
        mode: "no-cors",
        cache: "no-store" 
      });
      
      // If successful, trigger online state
      if (!navigator.onLine) {
        // Force a check by making another request
        setIsOnline(true);
        setJustReconnected(true);
        setTimeout(() => {
          setShowBanner(false);
          setJustReconnected(false);
        }, 3000);
      }
    } catch {
      // Still offline
      setIsOnline(false);
    } finally {
      setIsReconnecting(false);
    }
  };

  if (!showBanner) return null;

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-[100] px-4 py-3 flex items-center justify-center gap-3 text-sm font-medium animate-fade-in",
        justReconnected
          ? "bg-emerald-500/90 text-white backdrop-blur-sm"
          : "bg-amber-500/90 text-amber-950 backdrop-blur-sm"
      )}
    >
      <div className="flex items-center gap-2">
        {justReconnected ? (
          <>
            <Wifi className="h-5 w-5 animate-pulse" />
            <span>Yay! We're back online! 🎉</span>
          </>
        ) : (
          <>
            <WifiOff className="h-5 w-5 animate-bounce" />
            <span>Hey! Your internet's a bit wonky! 📡</span>
          </>
        )}
      </div>
      
      {!justReconnected && (
        <Button
          size="sm"
          variant="secondary"
          onClick={handleRetry}
          disabled={isReconnecting}
          className="h-7 px-3 bg-amber-100 text-amber-900 hover:bg-amber-200 border-0"
        >
          <RefreshCw className={cn("h-3.5 w-3.5 mr-1.5", isReconnecting && "animate-spin")} />
          {isReconnecting ? "Checking..." : "Retry"}
        </Button>
      )}
    </div>
  );
};

export default OfflineBanner;

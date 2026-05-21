import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { X, Crown, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const ADS = [
  { id: "cinematic", src: "/ads/ad-cinematic.mp4", label: "Cinematic" },
  { id: "kinetic", src: "/ads/ad-kinetic.mp4", label: "Kinetic" },
  { id: "playful", src: "/ads/ad-playful.mp4", label: "Playful" },
];

const DISMISS_KEY = "studyhub.adBanner.dismissedUntil";
const DISMISS_HOURS = 6;

/**
 * Self-promo upgrade ad shown ONLY to free (non-Pro) users.
 * Randomly rotates between 3 video variants per session.
 * Dismiss hides for 6h. Pro users + signed-out users never see it.
 */
const FreeUserAdBanner = ({ className }: { className?: string }) => {
  const { user } = useAuth();
  const { isPro, loading } = useSubscription();
  const [dismissed, setDismissed] = useState(false);
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Pick a random ad once per mount (stable for the session)
  const [ad] = useState(() => ADS[Math.floor(Math.random() * ADS.length)]);

  useEffect(() => {
    try {
      const until = Number(localStorage.getItem(DISMISS_KEY) || "0");
      if (until && Date.now() < until) setDismissed(true);
    } catch { /* ignore */ }
  }, []);

  // Only render for signed-in free users
  if (!user || loading || isPro || dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now() + DISMISS_HOURS * 3600 * 1000));
    } catch { /* ignore */ }
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  return (
    <Card
      className={cn(
        "relative overflow-hidden border-primary/30 bg-card/80 backdrop-blur shadow-lg",
        className,
      )}
      aria-label="Sponsored: StudyHub Pro"
    >
      <div className="flex items-center gap-1 px-3 py-1.5 border-b border-border/50 bg-muted/40">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Ad · StudyHub Pro
        </span>
        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={toggleMute}
            aria-label={muted ? "Unmute ad" : "Mute ad"}
            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={handleDismiss}
            aria-label="Dismiss ad for 6 hours"
            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <Link to="/pricing" aria-label="Upgrade to StudyHub Pro" className="block group">
        <div className="relative aspect-video bg-black">
          <video
            ref={videoRef}
            src={ad.src}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            className="w-full h-full object-cover"
          />
          {/* Overlay CTA on hover */}
          <div className="absolute inset-0 flex items-end justify-end p-3 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-xs font-semibold text-white bg-primary px-2.5 py-1 rounded-md inline-flex items-center gap-1">
              <Crown className="h-3 w-3" /> Upgrade
            </span>
          </div>
        </div>
      </Link>

      <div className="px-3 py-2.5 flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          Tired of seeing ads? Pro removes them.
        </p>
        <Button asChild size="sm" variant="default" className="h-7 text-xs">
          <Link to="/pricing">
            <Crown className="h-3 w-3 mr-1" /> Go Pro
          </Link>
        </Button>
      </div>
    </Card>
  );
};

export default FreeUserAdBanner;

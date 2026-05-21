import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { X, Crown, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/contexts/AuthContext";

const ADS = [
  { id: "cinematic", src: "/ads/ad-cinematic.mp4", label: "Cinematic" },
  { id: "kinetic", src: "/ads/ad-kinetic.mp4", label: "Kinetic" },
  { id: "playful", src: "/ads/ad-playful.mp4", label: "Playful" },
];

// Only show a fullscreen ad at most once every 12 hours per browser.
const SHOWN_KEY = "studyhub.adBanner.lastShownAt";
const COOLDOWN_HOURS = 12;
// Small delay before the ad appears so it doesn't interrupt the first paint.
const APPEAR_DELAY_MS = 4000;

/**
 * Fullscreen self-promo ad shown ONLY to signed-in free (non-Pro) users.
 * - Plays a randomly chosen short video.
 * - Close button is disabled until the video finishes playing.
 * - Throttled to at most once every 12h per browser.
 */
const FreeUserAdBanner = () => {
  const { user } = useAuth();
  const { isPro, loading } = useSubscription();

  const [shouldShow, setShouldShow] = useState(false);
  const [finished, setFinished] = useState(false);
  const [muted, setMuted] = useState(true);
  const [remaining, setRemaining] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Pick a random ad once per mount.
  const [ad] = useState(() => ADS[Math.floor(Math.random() * ADS.length)]);

  // Decide whether to show the ad (respecting cooldown).
  useEffect(() => {
    if (!user || loading || isPro) return;
    let last = 0;
    try {
      last = Number(localStorage.getItem(SHOWN_KEY) || "0");
    } catch { /* ignore */ }
    const cooldownMs = COOLDOWN_HOURS * 3600 * 1000;
    if (last && Date.now() - last < cooldownMs) return;

    const t = setTimeout(() => {
      setShouldShow(true);
      try {
        localStorage.setItem(SHOWN_KEY, String(Date.now()));
      } catch { /* ignore */ }
    }, APPEAR_DELAY_MS);
    return () => clearTimeout(t);
  }, [user, loading, isPro]);

  // Lock body scroll while the ad is open.
  useEffect(() => {
    if (!shouldShow) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [shouldShow]);

  // Block ESC / back-out shortcuts until ad finishes.
  useEffect(() => {
    if (!shouldShow || finished) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [shouldShow, finished]);

  if (!user || loading || isPro || !shouldShow) return null;

  const handleClose = () => {
    if (!finished) return;
    setShouldShow(false);
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const onTimeUpdate = () => {
    const v = videoRef.current;
    if (!v || !v.duration || !isFinite(v.duration)) return;
    const left = Math.max(0, Math.ceil(v.duration - v.currentTime));
    setRemaining(left);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Sponsored: StudyHub Pro"
      className="fixed inset-0 z-[9999] bg-black flex flex-col"
    >
      {/* Top bar */}
      <div className="flex items-center gap-2 px-4 py-3 bg-black/80 text-white">
        <span className="text-[10px] font-semibold uppercase tracking-wider opacity-70">
          Ad · StudyHub Pro
        </span>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={toggleMute}
            aria-label={muted ? "Unmute ad" : "Mute ad"}
            className="p-2 rounded hover:bg-white/10 transition-colors"
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
          <button
            onClick={handleClose}
            disabled={!finished}
            aria-label={finished ? "Close ad" : `Close available in ${remaining ?? "…"}s`}
            className="p-2 rounded inline-flex items-center gap-1.5 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed enabled:hover:bg-white/10 transition-colors"
          >
            {finished ? (
              <>
                <X className="h-4 w-4" /> Close
              </>
            ) : (
              <span>Skip in {remaining ?? "…"}s</span>
            )}
          </button>
        </div>
      </div>

      {/* Video stage */}
      <div className="flex-1 flex items-center justify-center bg-black">
        <video
          ref={videoRef}
          src={ad.src}
          autoPlay
          muted
          playsInline
          preload="auto"
          onEnded={() => setFinished(true)}
          onTimeUpdate={onTimeUpdate}
          onLoadedMetadata={onTimeUpdate}
          className="max-w-full max-h-full w-auto h-auto object-contain"
        />
      </div>

      {/* Bottom CTA */}
      <div className="px-4 py-4 bg-black/80 text-white flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-sm opacity-80 text-center sm:text-left">
          Tired of ads? StudyHub Pro removes them — plus unlocks every premium feature.
        </p>
        <Button asChild size="sm" variant="default">
          <Link to="/pricing" onClick={() => finished && setShouldShow(false)}>
            <Crown className="h-3.5 w-3.5 mr-1.5" /> Go Pro
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default FreeUserAdBanner;

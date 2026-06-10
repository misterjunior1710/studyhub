import { memo, useState, useRef, useCallback, useEffect, ReactNode } from "react";
import { RefreshCw, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void> | void;
  disabled?: boolean;
}

const PULL_THRESHOLD = 80;
const MAX_PULL = 150;
const RESISTANCE = 2.5;
const ACTIVATION_DISTANCE = 20; // finger must move this far down before we hijack scroll

const PullToRefresh = ({ children, onRefresh, disabled = false }: PullToRefreshProps) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef<number>(0);
  const startXRef = useRef<number>(0);
  const isTrackingRef = useRef(false); // candidate gesture
  const isPullingRef = useRef(false); // committed pull
  const pullDistanceRef = useRef(0);

  useEffect(() => {
    setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

  const updatePullDistance = useCallback((d: number) => {
    pullDistanceRef.current = d;
    setPullDistance(d);
  }, []);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (disabled || isRefreshing) return;

    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    if (scrollTop <= 0 && e.touches.length === 1) {
      startYRef.current = e.touches[0].clientY;
      startXRef.current = e.touches[0].clientX;
      isTrackingRef.current = true;
      isPullingRef.current = false;
    }
  }, [disabled, isRefreshing]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isTrackingRef.current || disabled || isRefreshing) return;

    // Bail if user has scrolled away from top (normal scroll, not a pull)
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    if (scrollTop > 0) {
      isTrackingRef.current = false;
      isPullingRef.current = false;
      if (pullDistanceRef.current !== 0) updatePullDistance(0);
      return;
    }

    const currentY = e.touches[0].clientY;
    const currentX = e.touches[0].clientX;
    const diffY = currentY - startYRef.current;
    const diffX = currentX - startXRef.current;

    // If gesture is horizontal or upward, abandon (let native scroll handle it)
    if (!isPullingRef.current) {
      if (diffY < 0 || Math.abs(diffX) > Math.abs(diffY)) {
        isTrackingRef.current = false;
        return;
      }
      if (diffY < ACTIVATION_DISTANCE) return; // wait until clearly a pull
      isPullingRef.current = true;
    }

    if (diffY > 0) {
      const distance = Math.min((diffY - ACTIVATION_DISTANCE) / RESISTANCE, MAX_PULL);
      updatePullDistance(Math.max(0, distance));
      if (e.cancelable) e.preventDefault();
    }
  }, [disabled, isRefreshing, updatePullDistance]);

  const handleTouchEnd = useCallback(async () => {
    const wasPulling = isPullingRef.current;
    isTrackingRef.current = false;
    isPullingRef.current = false;

    if (!wasPulling) return;

    if (pullDistanceRef.current >= PULL_THRESHOLD && !isRefreshing) {
      setIsRefreshing(true);
      updatePullDistance(PULL_THRESHOLD);

      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        updatePullDistance(0);
      }
    } else {
      updatePullDistance(0);
    }
  }, [isRefreshing, onRefresh, updatePullDistance]);

  useEffect(() => {
    if (!isTouchDevice) return;
    
    const container = containerRef.current;
    if (!container) return;

    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd);

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isTouchDevice, handleTouchStart, handleTouchMove, handleTouchEnd]);

  const progress = Math.min(pullDistance / PULL_THRESHOLD, 1);
  const rotation = progress * 180;
  const showIndicator = pullDistance > 10 || isRefreshing;

  return (
    <div ref={containerRef} className="relative">
      {/* Pull indicator */}
      {isTouchDevice && (
        <div
          className={cn(
            "absolute left-1/2 -translate-x-1/2 flex items-center justify-center z-50 transition-opacity duration-200",
            showIndicator ? "opacity-100" : "opacity-0"
          )}
          style={{
            top: Math.max(pullDistance - 50, -50),
            height: 40,
          }}
        >
          <div
            className={cn(
              "flex items-center justify-center w-10 h-10 rounded-full bg-background border border-border shadow-lg",
              isRefreshing && "animate-pulse"
            )}
          >
            {isRefreshing ? (
              <RefreshCw className="h-5 w-5 text-primary animate-spin" />
            ) : (
              <ArrowDown
                className={cn(
                  "h-5 w-5 transition-all duration-200",
                  progress >= 1 ? "text-primary" : "text-muted-foreground"
                )}
                style={{ transform: `rotate(${rotation}deg)` }}
              />
            )}
          </div>
        </div>
      )}
      
      {/* Content with pull offset */}
      <div
        style={{
          transform: pullDistance > 0 ? `translateY(${pullDistance}px)` : undefined,
          transition: !isPullingRef.current ? "transform 0.3s ease-out" : undefined,
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default memo(PullToRefresh);

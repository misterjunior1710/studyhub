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

const PullToRefresh = ({ children, onRefresh, disabled = false }: PullToRefreshProps) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef<number>(0);
  const isPullingRef = useRef(false);

  useEffect(() => {
    setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (disabled || isRefreshing) return;
    
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    if (scrollTop <= 0) {
      startYRef.current = e.touches[0].clientY;
      isPullingRef.current = true;
    }
  }, [disabled, isRefreshing]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isPullingRef.current || disabled || isRefreshing) return;
    
    const currentY = e.touches[0].clientY;
    const diff = currentY - startYRef.current;
    
    if (diff > 0) {
      // Apply resistance for natural feel
      const distance = Math.min(diff / RESISTANCE, MAX_PULL);
      setPullDistance(distance);
      
      if (distance > 10) {
        e.preventDefault();
      }
    }
  }, [disabled, isRefreshing]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPullingRef.current) return;
    
    isPullingRef.current = false;
    
    if (pullDistance >= PULL_THRESHOLD && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(PULL_THRESHOLD);
      
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  }, [pullDistance, isRefreshing, onRefresh]);

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

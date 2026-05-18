// Network/data-aware helpers for low-bandwidth optimization.
// Returns true when the client is on a slow connection, has Save-Data on,
// or prefers reduced data — so we can skip heavy animations/3D/etc.

type NetInfo = {
  saveData?: boolean;
  effectiveType?: "slow-2g" | "2g" | "3g" | "4g";
  downlink?: number;
  addEventListener?: (t: string, l: () => void) => void;
  removeEventListener?: (t: string, l: () => void) => void;
};

const getConn = (): NetInfo | undefined => {
  if (typeof navigator === "undefined") return undefined;
  return (
    (navigator as any).connection ||
    (navigator as any).mozConnection ||
    (navigator as any).webkitConnection
  );
};

export const isSlowNetwork = (): boolean => {
  const c = getConn();
  if (!c) return false;
  if (c.saveData) return true;
  if (c.effectiveType && (c.effectiveType === "slow-2g" || c.effectiveType === "2g" || c.effectiveType === "3g")) {
    return true;
  }
  if (typeof c.downlink === "number" && c.downlink > 0 && c.downlink < 1.5) return true;
  return false;
};

export const prefersReducedMotion = (): boolean => {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

// True when we should skip heavy visuals (3D, animated gradients, etc.)
export const shouldSkipHeavyVisuals = (): boolean => {
  return isSlowNetwork() || prefersReducedMotion();
};

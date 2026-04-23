import { useEffect, useState, useCallback } from "react";

/**
 * Client-side leaderboard privacy preference.
 * Stored in localStorage (no DB schema change required).
 * Default: private (opt-in to appear on leaderboard).
 */
const STORAGE_KEY = "leaderboard-public-opt-in";

export const isLeaderboardPublic = (): boolean => {
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
};

export const useLeaderboardPrivacy = () => {
  const [isPublic, setIsPublic] = useState<boolean>(() => isLeaderboardPublic());

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setIsPublic(e.newValue === "true");
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setPublic = useCallback((value: boolean) => {
    try {
      localStorage.setItem(STORAGE_KEY, value ? "true" : "false");
    } catch {
      /* ignore */
    }
    setIsPublic(value);
  }, []);

  return { isPublic, setPublic };
};

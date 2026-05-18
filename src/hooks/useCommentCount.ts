import { useEffect, useState } from "react";

/**
 * Comment count hook.
 *
 * Previous version opened a Supabase realtime channel + ran a COUNT(*) query
 * for EVERY post rendered in the feed (e.g. 50 channels + 50 round-trips on
 * a single Feed mount). That was the single most expensive frontend pattern
 * in the app at scale.
 *
 * The feed already fetches `comments(count)` as part of the post payload, so
 * the parent always has an authoritative count. This hook now simply mirrors
 * the prop and avoids any network or realtime work. Counts stay accurate on
 * the next feed refresh (which is realtime-driven elsewhere).
 */
export const useCommentCount = (_postId: string, initialCount: number = 0) => {
  const [count, setCount] = useState(initialCount);

  // Keep in sync if the parent prop updates (e.g. after a refetch).
  useEffect(() => {
    setCount(initialCount);
  }, [initialCount]);

  return count;
};

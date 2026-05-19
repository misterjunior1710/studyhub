import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const cache = new Map<string, boolean>();
const pending = new Map<string, Promise<boolean>>();

async function fetchPro(userId: string): Promise<boolean> {
  if (cache.has(userId)) return cache.get(userId)!;
  if (pending.has(userId)) return pending.get(userId)!;
  const p = (async () => {
    try {
      const { data } = await (supabase as any)
        .from("user_pro_status")
        .select("is_pro")
        .eq("user_id", userId)
        .maybeSingle();
      const isPro = !!data?.is_pro;
      cache.set(userId, isPro);
      return isPro;
    } catch {
      return false;
    } finally {
      pending.delete(userId);
    }
  })();
  pending.set(userId, p);
  return p;
}

/**
 * Lightweight "is this user (by id) a Pro member?" lookup, used for rendering
 * Pro badges on posts/comments/profiles. Cached in-memory per session.
 */
export function useProStatus(userId: string | null | undefined): boolean {
  const [isPro, setIsPro] = useState<boolean>(() => (userId ? cache.get(userId) ?? false : false));
  useEffect(() => {
    if (!userId) {
      setIsPro(false);
      return;
    }
    let cancelled = false;
    fetchPro(userId).then((v) => {
      if (!cancelled) setIsPro(v);
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);
  return isPro;
}

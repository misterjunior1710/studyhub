// Shared Pro-enforcement helpers for edge functions.
// - `consumeQuota`: atomically charges a free user's daily AI bucket.
//    Pro users always pass through. Returns a typed result or a ready-to-return Response.
// - `assertPro`: returns a 402 Response if the user is not Pro.
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

function getAdmin(): SupabaseClient | null {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) {
    console.error("[pro] missing SUPABASE env vars");
    return null;
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export type QuotaResult =
  | { allowed: true; isPro: boolean; remaining: number | null; limit: number | null; used: number | null }
  | { allowed: false; isPro: boolean; reason: "daily_limit_reached" | "error"; limit: number };

export async function consumeQuota(opts: {
  userId: string;
  bucket: string;
  freeLimit: number;
}): Promise<QuotaResult> {
  const admin = getAdmin();
  if (!admin) {
    // Fail closed for safety: treat as denied so we don't bypass caps on misconfig.
    return { allowed: false, isPro: false, reason: "error", limit: opts.freeLimit };
  }
  const { data, error } = await admin.rpc("consume_ai_quota", {
    _user_id: opts.userId,
    _bucket: opts.bucket,
    _free_limit: opts.freeLimit,
  });
  if (error) {
    console.error("[pro] consume_ai_quota error", error);
    return { allowed: false, isPro: false, reason: "error", limit: opts.freeLimit };
  }
  const d = data as {
    allowed: boolean;
    is_pro: boolean;
    reason?: string;
    limit?: number | null;
    used?: number | null;
    remaining?: number | null;
  };
  if (d.allowed) {
    return {
      allowed: true,
      isPro: !!d.is_pro,
      limit: d.limit ?? null,
      used: d.used ?? null,
      remaining: d.remaining ?? null,
    };
  }
  return {
    allowed: false,
    isPro: !!d.is_pro,
    reason: "daily_limit_reached",
    limit: d.limit ?? opts.freeLimit,
  };
}

export function quotaExceededResponse(
  bucket: string,
  limit: number,
  cors: Record<string, string>,
) {
  return new Response(
    JSON.stringify({
      error: "pro_required",
      code: "daily_limit_reached",
      message:
        "You've hit today's free limit. Upgrade to StudyHub Pro for unlimited access.",
      bucket,
      limit,
      upgrade_url: "/pricing",
    }),
    {
      status: 402,
      headers: { ...cors, "Content-Type": "application/json" },
    },
  );
}

export async function isPro(userId: string): Promise<boolean> {
  const admin = getAdmin();
  if (!admin) return false;
  const { data, error } = await admin.rpc("is_pro_user", { _user_id: userId });
  if (error) {
    console.error("[pro] is_pro_user error", error);
    return false;
  }
  return !!data;
}

export function proRequiredResponse(cors: Record<string, string>) {
  return new Response(
    JSON.stringify({
      error: "pro_required",
      code: "pro_required",
      message: "This feature is available on StudyHub Pro.",
      upgrade_url: "/pricing",
    }),
    {
      status: 402,
      headers: { ...cors, "Content-Type": "application/json" },
    },
  );
}

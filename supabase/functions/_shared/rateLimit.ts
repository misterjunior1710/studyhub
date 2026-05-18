// Shared rate-limit helper for edge functions.
// Calls the public.check_rate_limit RPC with service role.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

export type RateLimitResult =
  | { allowed: true; remaining: number }
  | { allowed: false; retryAfterSeconds: number };

export async function checkRateLimit(opts: {
  userId: string;
  bucket: string;
  max: number;
  windowSeconds: number;
}): Promise<RateLimitResult> {
  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceKey) {
    // Fail open on misconfiguration — log and allow so a missing env doesn't break the app.
    console.error("[rateLimit] missing env, failing open");
    return { allowed: true, remaining: opts.max };
  }
  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await admin.rpc("check_rate_limit", {
    _user_id: opts.userId,
    _bucket_key: opts.bucket,
    _max_count: opts.max,
    _window_seconds: opts.windowSeconds,
  });
  if (error) {
    console.error("[rateLimit] rpc error, failing open", error);
    return { allowed: true, remaining: opts.max };
  }
  const d = data as { allowed: boolean; remaining?: number; retry_after_seconds?: number };
  if (d.allowed) return { allowed: true, remaining: d.remaining ?? 0 };
  return { allowed: false, retryAfterSeconds: d.retry_after_seconds ?? opts.windowSeconds };
}

export function rateLimitedResponse(
  retryAfterSeconds: number,
  corsHeaders: Record<string, string>,
) {
  return new Response(
    JSON.stringify({
      error: "Too many requests. Please slow down and try again shortly.",
      retry_after_seconds: retryAfterSeconds,
    }),
    {
      status: 429,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Retry-After": String(retryAfterSeconds),
      },
    },
  );
}

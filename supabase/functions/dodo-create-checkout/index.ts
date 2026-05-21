import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const PLAN_LINKS: Record<string, string> = {
  pro_monthly: "https://dodo.pe/monthproplan",
  pro_yearly: "https://dodo.pe/yearproplan",
};

const PLAN_REDIRECTS: Record<string, string> = {
  pro_monthly: "/success/pro",
  pro_yearly: "/success/pro/yearly",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "Unauthorized" }, 401);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimData, error: claimErr } = await supabase.auth.getClaims(token);
    if (claimErr || !claimData?.claims) return json({ error: "Unauthorized" }, 401);
    const userId = claimData.claims.sub as string;
    const email = (claimData.claims.email as string) ?? "";

    const body = await req.json().catch(() => ({}));
    const plan = String(body?.plan ?? "");
    const origin = String(body?.origin ?? "").replace(/\/$/, "");

    if (!PLAN_LINKS[plan]) return json({ error: "Invalid plan" }, 400);

    // Strict origin allowlist to prevent open-redirect / subscription-fraud abuse
    const ALLOWED_ORIGINS = new Set([
      "https://studyhub.world",
      "https://www.studyhub.world",
      "https://studyhubstudentportal.lovable.app",
    ]);
    let parsedOrigin = "";
    try { parsedOrigin = new URL(origin).origin; } catch { /* noop */ }
    const isLovablePreview = /^https:\/\/[a-z0-9-]+\.lovable\.app$/i.test(parsedOrigin);
    if (!parsedOrigin || (!ALLOWED_ORIGINS.has(parsedOrigin) && !isLovablePreview)) {
      return json({ error: "Invalid origin" }, 400);
    }

    // Rate limit
    const { data: rl } = await supabase.rpc("check_rate_limit", {
      _user_id: userId,
      _bucket_key: "dodo_checkout",
      _max_count: 10,
      _window_seconds: 60,
    });
    if (rl && rl.allowed === false) {
      return json({ error: "Too many attempts, please wait a moment." }, 429);
    }

    const redirectUrl = `${origin}${PLAN_REDIRECTS[plan]}`;

    const url = new URL(PLAN_LINKS[plan]);
    url.searchParams.set("redirect_url", redirectUrl);
    url.searchParams.set("metadata_user_id", userId);
    url.searchParams.set("metadata_plan", plan);
    if (email) url.searchParams.set("email", email);

    // Audit (service role so it bypasses any RLS hiccups)
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    await admin.from("subscription_intents").insert({
      user_id: userId,
      provider: "dodo",
      plan,
      checkout_url: url.toString(),
      status: "initiated",
    });

    return json({ url: url.toString() }, 200);
  } catch (e) {
    console.error("dodo-create-checkout error", e);
    return json({ error: "Internal error" }, 500);
  }
});

function json(data: unknown, status: number) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

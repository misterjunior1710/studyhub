// Internal test-mode promo code: grants Pro access by inserting a synthetic
// sandbox subscription row. Strictly disabled in live env.
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Hidden internal code. Easy to disable: change/remove this constant.
const INTERNAL_TEST_CODE = "STUDYHUB-INTERNAL-TEST";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }
  try {
    const { code, environment } = await req.json();

    // Hard guard: only sandbox/test mode.
    if (environment !== "sandbox") {
      return new Response(JSON.stringify({ error: "Promo codes are disabled in live mode" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (typeof code !== "string" || code.trim().toUpperCase() !== INTERNAL_TEST_CODE) {
      return new Response(JSON.stringify({ error: "Invalid promo code" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const oneYear = new Date();
    oneYear.setFullYear(oneYear.getFullYear() + 1);

    // Synthetic subscription. Flagged via stripe_subscription_id prefix.
    const syntheticId = `promo_${user.id}_${INTERNAL_TEST_CODE}`;

    await supabase.from("subscriptions").upsert(
      {
        user_id: user.id,
        stripe_subscription_id: syntheticId,
        stripe_customer_id: `promo_customer_${user.id}`,
        product_id: "studyhub_pro",
        price_id: "pro_yearly",
        status: "active",
        current_period_start: new Date().toISOString(),
        current_period_end: oneYear.toISOString(),
        cancel_at_period_end: false,
        environment: "sandbox",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "stripe_subscription_id" },
    );

    await supabase.from("promo_redemptions").upsert(
      { user_id: user.id, code: INTERNAL_TEST_CODE, environment: "sandbox" },
      { onConflict: "user_id,code,environment" },
    );

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

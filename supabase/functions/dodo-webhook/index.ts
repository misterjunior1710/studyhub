import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Dodo (Standard Webhooks spec) sends:
//   webhook-id, webhook-timestamp, webhook-signature  (signature is v1,base64HMAC...)
// Signed payload = `${id}.${timestamp}.${rawBody}`
async function verifySignature(
  secret: string,
  id: string,
  timestamp: string,
  rawBody: string,
  signatureHeader: string,
): Promise<boolean> {
  try {
    const cleanSecret = secret.startsWith("whsec_") ? secret.slice(6) : secret;
    const keyBytes = Uint8Array.from(atob(cleanSecret), (c) => c.charCodeAt(0)).buffer;

    let key: CryptoKey;
    try {
      key = await crypto.subtle.importKey(
        "raw",
        keyBytes,
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"],
      );
    } catch {
      // Secret was not base64 — fall back to raw UTF-8 bytes
      key = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"],
      );
    }

    const signed = `${id}.${timestamp}.${rawBody}`;
    const sigBuf = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(signed));
    const expected = btoa(String.fromCharCode(...new Uint8Array(sigBuf)));

    // Header format: "v1,base64sig v1,base64sig2"
    const parts = signatureHeader.split(" ");
    for (const p of parts) {
      const [, sig] = p.split(",");
      if (sig && timingSafeEqual(sig, expected)) return true;
    }
    return false;
  } catch (e) {
    console.error("verify error", e);
    return false;
  }
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}

function pickPlan(payload: any): string | null {
  const direct = payload?.data?.metadata?.plan ?? payload?.metadata?.plan;
  if (direct === "pro_monthly" || direct === "pro_yearly") return direct;
  // Fallback: infer from product/billing cycle if Dodo strips metadata
  const interval = (payload?.data?.recurring_pre_tax_amount ?? payload?.data?.product?.recurring?.interval ?? "")
    .toString()
    .toLowerCase();
  if (interval.includes("year")) return "pro_yearly";
  if (interval.includes("month")) return "pro_monthly";
  return null;
}

function pickUserId(payload: any): string | null {
  return (
    payload?.data?.metadata?.user_id ??
    payload?.metadata?.user_id ??
    payload?.data?.metadata?.userId ??
    null
  );
}

function mapStatus(eventType: string, dataStatus?: string): string {
  if (dataStatus) {
    const s = dataStatus.toLowerCase();
    if (["active", "trialing", "renewed", "cancelled", "canceled", "on_hold", "expired", "paused", "failed"].includes(s)) {
      return s === "canceled" ? "cancelled" : s;
    }
  }
  switch (eventType) {
    case "subscription.active":
    case "subscription.renewed":
    case "payment.succeeded":
      return "active";
    case "subscription.cancelled":
    case "subscription.canceled":
      return "cancelled";
    case "subscription.on_hold":
      return "on_hold";
    case "subscription.expired":
      return "expired";
    case "payment.failed":
      return "failed";
    default:
      return "active";
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const secret = Deno.env.get("DODO_WEBHOOK_SECRET");
  if (!secret) {
    console.error("DODO_WEBHOOK_SECRET not configured");
    return new Response("Server misconfigured", { status: 500 });
  }

  const webhookId = req.headers.get("webhook-id") ?? "";
  const webhookTimestamp = req.headers.get("webhook-timestamp") ?? "";
  const webhookSignature = req.headers.get("webhook-signature") ?? "";
  const rawBody = await req.text();

  if (!webhookId || !webhookTimestamp || !webhookSignature) {
    return new Response("Missing signature headers", { status: 401 });
  }

  const valid = await verifySignature(secret, webhookId, webhookTimestamp, rawBody, webhookSignature);
  if (!valid) {
    console.warn("Invalid Dodo webhook signature", { webhookId });
    return new Response("Invalid signature", { status: 401 });
  }

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const eventType: string = payload?.type ?? payload?.event_type ?? "unknown";
  const eventId: string = payload?.business_id
    ? `${payload.business_id}:${webhookId}`
    : webhookId;

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Idempotency
  const { error: dupErr } = await admin
    .from("dodo_webhook_events")
    .insert({ event_id: eventId, event_type: eventType, payload });
  if (dupErr && (dupErr as any).code === "23505") {
    return new Response("Duplicate", { status: 200 });
  }
  if (dupErr) {
    console.error("Failed to record webhook event", dupErr);
    // Continue anyway — better to process than silently drop
  }

  const data = payload?.data ?? {};
  const userId = pickUserId(payload);
  const plan = pickPlan(payload);

  const subscriptionId: string | null =
    data?.subscription_id ?? data?.id ?? payload?.subscription_id ?? null;
  const paymentId: string | null = data?.payment_id ?? data?.id ?? null;
  const customerId: string | null = data?.customer?.customer_id ?? data?.customer_id ?? null;
  const periodEnd: string | null =
    data?.next_billing_date ?? data?.current_period_end ?? data?.expires_on ?? null;
  const status = mapStatus(eventType, data?.status);

  if (!userId) {
    console.warn("Webhook missing user_id metadata", { eventType, eventId });
    return new Response("OK (no user metadata)", { status: 200 });
  }

  if (!subscriptionId && !paymentId) {
    console.warn("Webhook missing subscription/payment id", { eventType });
    return new Response("OK (no id)", { status: 200 });
  }

  const row: Record<string, any> = {
    user_id: userId,
    provider: "dodo",
    plan: plan ?? "pro_monthly",
    status,
    dodo_subscription_id: subscriptionId,
    dodo_payment_id: paymentId,
    dodo_customer_id: customerId,
    current_period_end: periodEnd,
    cancel_at_period_end: eventType.includes("cancel"),
    updated_at: new Date().toISOString(),
  };

  // Upsert by (provider, dodo_subscription_id) when we have one; otherwise by payment id
  if (subscriptionId) {
    const { error } = await admin
      .from("subscriptions")
      .upsert(row, { onConflict: "provider,dodo_subscription_id" });
    if (error) {
      console.error("Upsert by sub id failed", error);
      return new Response("DB error", { status: 500 });
    }
  } else {
    // One-off payment — find existing by payment id or insert fresh
    const { data: existing } = await admin
      .from("subscriptions")
      .select("id")
      .eq("dodo_payment_id", paymentId!)
      .maybeSingle();
    if (existing?.id) {
      await admin.from("subscriptions").update(row).eq("id", existing.id);
    } else {
      await admin.from("subscriptions").insert(row);
    }
  }

  console.log("Dodo webhook processed", { eventType, userId, status, subscriptionId });
  return new Response("OK", { status: 200 });
});

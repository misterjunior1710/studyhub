import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import webpush from "npm:web-push@3.6.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY")!;
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") || "mailto:admin@studyhub.world";

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

interface PushPayload {
  title: string;
  body?: string;
  url?: string;
  tag?: string;
  icon?: string;
  data?: Record<string, unknown>;
}

async function sendToSubscriptions(
  subs: Array<{ id: string; endpoint: string; p256dh: string; auth: string }>,
  payload: PushPayload,
) {
  let sent = 0;
  let removed = 0;
  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          JSON.stringify(payload),
          { TTL: 60 * 60 * 24 },
        );
        sent++;
      } catch (err: any) {
        // 404/410 => endpoint dead, prune.
        const status = err?.statusCode ?? err?.status;
        if (status === 404 || status === 410) {
          await admin.from("push_subscriptions").delete().eq("id", sub.id);
          removed++;
        } else {
          console.error("push send error", status, err?.body || err?.message);
        }
      }
    }),
  );
  return { sent, removed };
}

async function getCallerUserId(req: Request): Promise<string | null> {
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const token = auth.slice(7);
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data, error } = await client.auth.getClaims(token);
  if (error || !data?.claims) return null;
  return data.claims.sub as string;
}

async function isAdmin(userId: string): Promise<boolean> {
  const { data } = await admin.rpc("has_role", { _user_id: userId, _role: "admin" });
  return !!data;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const url = new URL(req.url);
  // Public endpoint: VAPID public key
  if (req.method === "GET" && url.searchParams.get("action") === "key") {
    return json(200, { publicKey: VAPID_PUBLIC_KEY });
  }

  if (req.method !== "POST") return json(405, { error: "Method not allowed" });

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json(400, { error: "Invalid JSON" });
  }

  const action = body?.action;

  // === SUBSCRIBE / UNSUBSCRIBE: signed-in user ===
  if (action === "subscribe" || action === "unsubscribe") {
    const userId = await getCallerUserId(req);
    if (!userId) return json(401, { error: "Unauthorized" });

    if (action === "subscribe") {
      const sub = body.subscription;
      if (!sub?.endpoint || !sub?.keys?.p256dh || !sub?.keys?.auth) {
        return json(400, { error: "Invalid subscription" });
      }
      const userAgent = (body.userAgent as string | undefined)?.slice(0, 500) ?? null;
      const { error } = await admin.from("push_subscriptions").upsert(
        {
          user_id: userId,
          endpoint: sub.endpoint,
          p256dh: sub.keys.p256dh,
          auth: sub.keys.auth,
          user_agent: userAgent,
          last_seen_at: new Date().toISOString(),
        },
        { onConflict: "endpoint" },
      );
      if (error) return json(500, { error: error.message });
      return json(200, { ok: true });
    }

    // unsubscribe
    const endpoint = body.endpoint as string | undefined;
    if (!endpoint) return json(400, { error: "Missing endpoint" });
    await admin
      .from("push_subscriptions")
      .delete()
      .eq("user_id", userId)
      .eq("endpoint", endpoint);
    return json(200, { ok: true });
  }

  // === BROADCAST: admin only ===
  if (action === "broadcast") {
    const userId = await getCallerUserId(req);
    if (!userId) return json(401, { error: "Unauthorized" });
    if (!(await isAdmin(userId))) return json(403, { error: "Forbidden" });

    const title = (body.title as string | undefined)?.slice(0, 100);
    if (!title) return json(400, { error: "title required" });
    const payload: PushPayload = {
      title,
      body: (body.body as string | undefined)?.slice(0, 500),
      url: (body.url as string | undefined) || "/",
      tag: "broadcast",
    };

    const { data: subs, error } = await admin
      .from("push_subscriptions")
      .select("id, endpoint, p256dh, auth");
    if (error) return json(500, { error: error.message });

    const result = await sendToSubscriptions(subs ?? [], payload);
    return json(200, { ok: true, total: subs?.length ?? 0, ...result });
  }

  // === NOTIFY-USER: server-to-server (service role bearer) ===
  if (action === "notify-user") {
    const auth = req.headers.get("Authorization");
    if (auth !== `Bearer ${SERVICE_ROLE_KEY}`) return json(401, { error: "Unauthorized" });

    const targetUserId = body.userId as string | undefined;
    const title = (body.title as string | undefined)?.slice(0, 100);
    if (!targetUserId || !title) return json(400, { error: "userId+title required" });

    const payload: PushPayload = {
      title,
      body: (body.body as string | undefined)?.slice(0, 500),
      url: (body.url as string | undefined) || "/",
      tag: (body.tag as string | undefined) || "notif",
    };

    const { data: subs } = await admin
      .from("push_subscriptions")
      .select("id, endpoint, p256dh, auth")
      .eq("user_id", targetUserId);

    const result = await sendToSubscriptions(subs ?? [], payload);
    return json(200, { ok: true, ...result });
  }

  return json(400, { error: "Unknown action" });
});

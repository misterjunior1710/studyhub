// Shared helpers for Google Calendar OAuth + API
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

export const GOOGLE_SCOPES = [
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/userinfo.email",
  "openid",
].join(" ");

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

export const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const enc = new TextEncoder();
const dec = new TextDecoder();

const b64u = (buf: ArrayBuffer | Uint8Array) => {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};
const b64uDecode = (s: string) => {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  return Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
};

const getKey = async () => {
  const secret = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "fallback-state-secret";
  return crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
};

export const signState = async (userId: string, origin?: string): Promise<string> => {
  const payload = { uid: userId, ts: Date.now(), origin: origin ?? null };
  const data = b64u(enc.encode(JSON.stringify(payload)));
  const key = await getKey();
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return `${data}.${b64u(sig)}`;
};

export const verifyState = async (
  state: string,
): Promise<{ uid: string; origin: string | null } | null> => {
  const [data, sig] = state.split(".");
  if (!data || !sig) return null;
  const key = await getKey();
  const ok = await crypto.subtle.verify("HMAC", key, b64uDecode(sig), enc.encode(data));
  if (!ok) return null;
  try {
    const payload = JSON.parse(dec.decode(b64uDecode(data)));
    if (Date.now() - payload.ts > 15 * 60 * 1000) return null;
    return { uid: payload.uid as string, origin: (payload.origin ?? null) as string | null };
  } catch {
    return null;
  }
};

const ALLOWED_ORIGINS = [
  "https://studyhub.world",
  "https://www.studyhub.world",
  "https://studyhubstudentportal.lovable.app",
];
export const resolveReturnOrigin = (origin: string | null): string => {
  if (!origin) return "https://studyhub.world";
  try {
    const u = new URL(origin);
    if (ALLOWED_ORIGINS.includes(u.origin)) return u.origin;
    if (u.hostname.endsWith(".lovable.app") || u.hostname.endsWith(".lovableproject.com")) {
      return u.origin;
    }
  } catch {}
  return "https://studyhub.world";
};

export const getRedirectUri = () => {
  const base = Deno.env.get("SUPABASE_URL")!;
  return `${base}/functions/v1/google-calendar-callback`;
};

export const exchangeCode = async (code: string) => {
  const params = new URLSearchParams({
    code,
    client_id: Deno.env.get("GOOGLE_CLIENT_ID")!,
    client_secret: Deno.env.get("GOOGLE_CLIENT_SECRET")!,
    redirect_uri: getRedirectUri(),
    grant_type: "authorization_code",
  });
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });
  if (!r.ok) throw new Error(`token exchange failed: ${await r.text()}`);
  return r.json() as Promise<{
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    scope: string;
    id_token?: string;
  }>;
};

export const refreshAccessToken = async (refreshToken: string) => {
  const params = new URLSearchParams({
    refresh_token: refreshToken,
    client_id: Deno.env.get("GOOGLE_CLIENT_ID")!,
    client_secret: Deno.env.get("GOOGLE_CLIENT_SECRET")!,
    grant_type: "refresh_token",
  });
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });
  if (!r.ok) throw new Error(`refresh failed: ${await r.text()}`);
  return r.json() as Promise<{ access_token: string; expires_in: number; scope: string }>;
};

export const adminClient = () =>
  createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

export type CalendarConnection = {
  id: string;
  user_id: string;
  provider: string;
  account_email: string | null;
  access_token: string;
  refresh_token: string | null;
  token_expires_at: string | null;
  scope: string | null;
};

export const getValidAccessToken = async (
  admin: ReturnType<typeof adminClient>,
  conn: CalendarConnection,
): Promise<string> => {
  const expiresAt = conn.token_expires_at ? new Date(conn.token_expires_at).getTime() : 0;
  if (expiresAt - Date.now() > 60_000) return conn.access_token;
  if (!conn.refresh_token) throw new Error("no refresh token; reconnect required");
  const refreshed = await refreshAccessToken(conn.refresh_token);
  const newExpiry = new Date(Date.now() + refreshed.expires_in * 1000).toISOString();
  await admin
    .from("calendar_connections")
    .update({ access_token: refreshed.access_token, token_expires_at: newExpiry })
    .eq("id", conn.id);
  return refreshed.access_token;
};

export const gcal = async (token: string, path: string, init: RequestInit = {}) => {
  const r = await fetch(`https://www.googleapis.com/calendar/v3${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  if (!r.ok) {
    const text = await r.text();
    throw new Error(`gcal ${path} ${r.status}: ${text}`);
  }
  return r.json();
};

export const requireUser = async (req: Request) => {
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const supa = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: auth } },
  });
  const { data } = await supa.auth.getUser();
  return data.user;
};

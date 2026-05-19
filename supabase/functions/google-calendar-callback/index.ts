// Handles Google OAuth redirect: validates state, exchanges code, stores tokens,
// and redirects back to the originating app origin (preserved in the OAuth state).
import { corsHeaders, verifyState, exchangeCode, adminClient, resolveReturnOrigin } from "../_shared/google-calendar.ts";

const APP_RETURN_PATH = "/calendar?google=connected";
const APP_ERROR_PATH = "/calendar?google=error";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  // Best-effort state parse early so even error redirects honor the origin.
  let returnOrigin = "https://studyhub.world";
  let userId: string | null = null;
  if (state) {
    const parsed = await verifyState(state);
    if (parsed) {
      userId = parsed.uid;
      returnOrigin = resolveReturnOrigin(parsed.origin);
    }
  }
  const back = (path: string) => Response.redirect(`${returnOrigin}${path}`, 302);

  try {
    if (error) return back(`${APP_ERROR_PATH}&reason=${encodeURIComponent(error)}`);
    if (!code || !state) return back(`${APP_ERROR_PATH}&reason=missing_code`);
    if (!userId) return back(`${APP_ERROR_PATH}&reason=bad_state`);

    const tokens = await exchangeCode(code);

    let email: string | null = null;
    try {
      const ui = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      }).then((r) => r.json());
      email = ui.email ?? null;
    } catch {}

    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();
    const admin = adminClient();
    const { error: upErr } = await admin.from("calendar_connections").upsert(
      {
        user_id: userId,
        provider: "google",
        account_email: email,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token ?? null,
        token_expires_at: expiresAt,
        scope: tokens.scope,
      },
      { onConflict: "user_id,provider" },
    );
    if (upErr) throw upErr;

    await admin
      .from("calendar_sync_settings")
      .upsert(
        { user_id: userId, provider: "google" },
        { onConflict: "user_id,provider", ignoreDuplicates: true },
      );

    return back(APP_RETURN_PATH);
  } catch (e) {
    console.error("[google-calendar-callback]", e);
    return back(`${APP_ERROR_PATH}&reason=connection_failed`);
  }
});

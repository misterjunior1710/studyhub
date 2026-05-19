// Generates a Google OAuth consent URL for the signed-in user.
import { corsHeaders, json, requireUser, signState, getRedirectUri, GOOGLE_SCOPES } from "../_shared/google-calendar.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const user = await requireUser(req);
    if (!user) return json(401, { error: "Unauthorized" });

    const clientId = Deno.env.get("GOOGLE_CLIENT_ID");
    if (!clientId) return json(500, { error: "GOOGLE_CLIENT_ID not configured" });

    // Preserve the originating app origin so callback redirects back to the same host.
    let origin: string | null = null;
    try {
      if (req.method === "POST") {
        const body = await req.json().catch(() => ({}));
        if (typeof body?.origin === "string") origin = body.origin;
      }
    } catch {}
    if (!origin) origin = req.headers.get("origin") || req.headers.get("referer");

    const state = await signState(user.id, origin || undefined);
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: getRedirectUri(),
      response_type: "code",
      scope: GOOGLE_SCOPES,
      access_type: "offline",
      include_granted_scopes: "true",
      prompt: "consent",
      state,
    });
    return json(200, { url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}` });
  } catch (e) {
    console.error('[google-calendar-auth-url]', e);
    return json(500, { error: 'Failed to start Google sign-in' });
  }
});

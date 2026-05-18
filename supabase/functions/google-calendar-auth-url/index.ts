// Generates a Google OAuth consent URL for the signed-in user.
import { corsHeaders, json, requireUser, signState, getRedirectUri, GOOGLE_SCOPES } from "../_shared/google-calendar.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const user = await requireUser(req);
    if (!user) return json(401, { error: "Unauthorized" });

    const clientId = Deno.env.get("GOOGLE_CLIENT_ID");
    if (!clientId) return json(500, { error: "GOOGLE_CLIENT_ID not configured" });

    const state = await signState(user.id);
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

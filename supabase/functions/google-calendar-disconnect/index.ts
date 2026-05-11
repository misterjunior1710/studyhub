// Disconnects the user's Google Calendar: revokes token and clears local data.
import {
  corsHeaders, json, requireUser, adminClient,
} from "../_shared/google-calendar.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const user = await requireUser(req);
    if (!user) return json(401, { error: "Unauthorized" });

    const admin = adminClient();
    const { data: conn } = await admin
      .from("calendar_connections")
      .select("access_token, refresh_token")
      .eq("user_id", user.id)
      .eq("provider", "google")
      .maybeSingle();

    if (conn?.refresh_token || conn?.access_token) {
      try {
        await fetch(
          `https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(conn.refresh_token || conn.access_token)}`,
          { method: "POST" },
        );
      } catch (e) {
        console.warn("revoke failed", e);
      }
    }

    await admin.from("external_calendar_events").delete().eq("user_id", user.id).eq("provider", "google");
    await admin.from("calendar_sync_settings").delete().eq("user_id", user.id).eq("provider", "google");
    await admin.from("calendar_connections").delete().eq("user_id", user.id).eq("provider", "google");

    return json(200, { ok: true });
  } catch (e) {
    console.error(e);
    return json(500, { error: (e as Error).message });
  }
});

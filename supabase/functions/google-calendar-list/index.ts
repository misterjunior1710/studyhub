// Lists the signed-in user's Google calendars.
import {
  corsHeaders, json, requireUser, adminClient,
  getValidAccessToken, gcal, type CalendarConnection,
} from "../_shared/google-calendar.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const user = await requireUser(req);
    if (!user) return json(401, { error: "Unauthorized" });

    const admin = adminClient();
    const { data: conn } = await admin
      .from("calendar_connections")
      .select("*")
      .eq("user_id", user.id)
      .eq("provider", "google")
      .maybeSingle();
    if (!conn) return json(404, { error: "Not connected" });

    const token = await getValidAccessToken(admin, conn as CalendarConnection);
    const result = await gcal(token, "/users/me/calendarList?maxResults=250");
    const calendars = (result.items || []).map((c: any) => ({
      id: c.id,
      summary: c.summary,
      primary: !!c.primary,
      backgroundColor: c.backgroundColor,
      accessRole: c.accessRole,
    }));
    return json(200, { calendars });
  } catch (e) {
    console.error('[google-calendar-list]', e);
    return json(500, { error: 'Failed to load calendars' });
  }
});

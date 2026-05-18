// Two-way sync of events between StudyHub and Google Calendar.
// Pulls events from selected calendars and pushes StudyHub events to a chosen target calendar.
import {
  corsHeaders, json, requireUser, adminClient,
  getValidAccessToken, gcal, type CalendarConnection,
} from "../_shared/google-calendar.ts";

const syncForUser = async (userId: string) => {
  const admin = adminClient();
  const { data: conn } = await admin
    .from("calendar_connections")
    .select("*")
    .eq("user_id", userId)
    .eq("provider", "google")
    .maybeSingle();
  if (!conn) return { skipped: "no connection" };

  const { data: settings } = await admin
    .from("calendar_sync_settings")
    .select("*")
    .eq("user_id", userId)
    .eq("provider", "google")
    .maybeSingle();
  if (!settings) return { skipped: "no settings" };

  const calendarIds: string[] = settings.selected_calendar_ids || [];
  if (calendarIds.length === 0) return { skipped: "no calendars selected" };

  const token = await getValidAccessToken(admin, conn as CalendarConnection);

  const now = Date.now();
  const timeMin = new Date(now - settings.sync_days_past * 86400_000).toISOString();
  const timeMax = new Date(now + settings.sync_days_future * 86400_000).toISOString();

  let pulled = 0;
  // PULL
  for (const calId of calendarIds) {
    const params = new URLSearchParams({
      timeMin, timeMax, singleEvents: "true", orderBy: "startTime", maxResults: "500",
    });
    try {
      const result = await gcal(token, `/calendars/${encodeURIComponent(calId)}/events?${params}`);
      const items = result.items || [];
      const rows = items
        .filter((ev: any) => ev.status !== "cancelled" && (ev.start?.dateTime || ev.start?.date))
        .map((ev: any) => {
          const startStr = ev.start?.dateTime || ev.start?.date;
          const endStr = ev.end?.dateTime || ev.end?.date || startStr;
          const allDay = !ev.start?.dateTime;
          return {
            user_id: userId,
            provider: "google",
            external_id: ev.id,
            calendar_id: calId,
            calendar_name: result.summary || null,
            title: ev.summary || "(no title)",
            description: ev.description || null,
            start_time: new Date(startStr).toISOString(),
            end_time: new Date(endStr).toISOString(),
            all_day: allDay,
            location: ev.location || null,
            meeting_link: ev.hangoutLink || ev.conferenceData?.entryPoints?.[0]?.uri || null,
            html_link: ev.htmlLink || null,
            etag: ev.etag || null,
            raw: ev,
          };
        });
      if (rows.length > 0) {
        const { error } = await admin
          .from("external_calendar_events")
          .upsert(rows, { onConflict: "user_id,provider,external_id" });
        if (error) console.error("upsert err", error);
        pulled += rows.length;
      }
    } catch (e) {
      console.error("pull error for", calId, e);
    }
  }

  // PUSH (two-way only)
  let pushed = 0;
  let updated = 0;
  if (settings.two_way_sync && settings.default_write_calendar_id) {
    const writeCal = settings.default_write_calendar_id;
    const { data: localEvents } = await admin
      .from("study_events")
      .select("*")
      .eq("created_by", userId)
      .gte("start_time", timeMin)
      .lte("start_time", timeMax);

    for (const ev of localEvents || []) {
      const body: Record<string, unknown> = {
        summary: ev.title,
        description: ev.description ?? undefined,
        start: { dateTime: new Date(ev.start_time).toISOString() },
        end: { dateTime: new Date(ev.end_time).toISOString() },
        location: ev.is_virtual ? undefined : ev.location ?? undefined,
      };
      if (ev.is_virtual && ev.meeting_link) {
        body.description = `${body.description ? body.description + "\n\n" : ""}Join: ${ev.meeting_link}`;
      }
      try {
        if (!ev.external_id) {
          const created = await gcal(token, `/calendars/${encodeURIComponent(writeCal)}/events`, {
            method: "POST", body: JSON.stringify(body),
          });
          await admin.from("study_events").update({
            external_provider: "google",
            external_calendar_id: writeCal,
            external_id: created.id,
            external_etag: created.etag,
          }).eq("id", ev.id);
          pushed++;
        } else if (ev.external_provider === "google" && ev.external_calendar_id) {
          const u = await gcal(
            token,
            `/calendars/${encodeURIComponent(ev.external_calendar_id)}/events/${encodeURIComponent(ev.external_id)}`,
            { method: "PATCH", body: JSON.stringify(body) },
          );
          await admin.from("study_events").update({ external_etag: u.etag }).eq("id", ev.id);
          updated++;
        }
      } catch (e) {
        console.error("push error", ev.id, e);
      }
    }
  }

  await admin
    .from("calendar_connections")
    .update({ last_synced_at: new Date().toISOString() })
    .eq("id", conn.id);

  return { pulled, pushed, updated };
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    // Cron path: header token triggers full sync
    const cronSecret = req.headers.get("x-cron-secret");
    if (cronSecret && cronSecret === Deno.env.get("INTERNAL_PUSH_SECRET")) {
      const admin = adminClient();
      const { data: conns } = await admin
        .from("calendar_connections")
        .select("user_id")
        .eq("provider", "google");
      const results: any[] = [];
      for (const c of conns || []) {
        try {
          results.push({ user_id: c.user_id, ...(await syncForUser(c.user_id)) });
        } catch (e) {
          console.error('[google-calendar-sync user]', c.user_id, e);
          results.push({ user_id: c.user_id, error: 'sync_failed' });
        }
      }
      return json(200, { ran: results.length, results });
    }

    // User-triggered
    const user = await requireUser(req);
    if (!user) return json(401, { error: "Unauthorized" });
    const result = await syncForUser(user.id);
    return json(200, result);
  } catch (e) {
    console.error('[google-calendar-sync]', e);
    return json(500, { error: 'Calendar sync failed' });
  }
});

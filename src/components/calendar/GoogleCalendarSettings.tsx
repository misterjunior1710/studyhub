import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, RefreshCw, Link2, Unlink, Calendar as CalendarIcon } from "lucide-react";

type GCal = { id: string; summary: string; primary?: boolean; backgroundColor?: string; accessRole?: string };

interface Props {
  userId: string;
  onSyncComplete?: () => void;
}

const GoogleCalendarSettings = ({ userId, onSyncComplete }: Props) => {
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [calendars, setCalendars] = useState<GCal[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [writeId, setWriteId] = useState<string>("");
  const [daysPast, setDaysPast] = useState(30);
  const [daysFuture, setDaysFuture] = useState(90);
  const [twoWay, setTwoWay] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data: conn } = await supabase
        .from("calendar_connections")
        .select("account_email, last_synced_at")
        .eq("user_id", userId)
        .eq("provider", "google")
        .maybeSingle();
      if (!conn) {
        setConnected(false);
        setLoading(false);
        return;
      }
      setConnected(true);
      setEmail(conn.account_email);
      setLastSync(conn.last_synced_at);

      const { data: settings } = await supabase
        .from("calendar_sync_settings")
        .select("*")
        .eq("user_id", userId)
        .eq("provider", "google")
        .maybeSingle();
      if (settings) {
        setSelectedIds(settings.selected_calendar_ids || []);
        setWriteId(settings.default_write_calendar_id || "");
        setDaysPast(settings.sync_days_past);
        setDaysFuture(settings.sync_days_future);
        setTwoWay(settings.two_way_sync);
      }

      const { data: list, error } = await supabase.functions.invoke("google-calendar-list");
      if (!error && list?.calendars) setCalendars(list.calendars);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const params = new URLSearchParams(window.location.search);
    if (params.get("google") === "connected") {
      toast.success("Google Calendar connected");
      params.delete("google");
      window.history.replaceState({}, "", window.location.pathname);
    } else if (params.get("google") === "error") {
      toast.error(`Google connect failed: ${params.get("reason") || "unknown"}`);
      params.delete("google");
      params.delete("reason");
      window.history.replaceState({}, "", window.location.pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleConnect = async () => {
    setBusy("connect");
    try {
      const { data, error } = await supabase.functions.invoke("google-calendar-auth-url");
      if (error || !data?.url) throw new Error(error?.message || "No URL returned");
      window.location.href = data.url;
    } catch (e: any) {
      toast.error(`Couldn't start Google sign-in: ${e.message}`);
    } finally {
      setBusy(null);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm("Disconnect Google Calendar? Imported events will be removed.")) return;
    setBusy("disconnect");
    try {
      const { error } = await supabase.functions.invoke("google-calendar-disconnect");
      if (error) throw error;
      toast.success("Disconnected");
      setConnected(false);
      setCalendars([]);
      setSelectedIds([]);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(null);
    }
  };

  const saveSettings = async () => {
    setBusy("save");
    try {
      const { error } = await supabase.from("calendar_sync_settings").upsert(
        {
          user_id: userId,
          provider: "google",
          selected_calendar_ids: selectedIds,
          default_write_calendar_id: writeId || null,
          sync_days_past: daysPast,
          sync_days_future: daysFuture,
          two_way_sync: twoWay,
        },
        { onConflict: "user_id,provider" },
      );
      if (error) throw error;
      toast.success("Settings saved");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(null);
    }
  };

  const syncNow = async () => {
    setBusy("sync");
    try {
      const { data, error } = await supabase.functions.invoke("google-calendar-sync");
      if (error) throw error;
      toast.success(`Synced — pulled ${data?.pulled ?? 0}, pushed ${data?.pushed ?? 0}, updated ${data?.updated ?? 0}`);
      load();
      onSyncComplete?.();
    } catch (e: any) {
      toast.error(`Sync failed: ${e.message}`);
    } finally {
      setBusy(null);
    }
  };

  const toggleCalendar = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 flex justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              Google Calendar
            </CardTitle>
            <CardDescription>
              {connected ? `Connected as ${email || "Google account"}` : "Sync events two-way with your Google Calendar"}
            </CardDescription>
          </div>
          {connected ? (
            <Badge variant="secondary">Connected</Badge>
          ) : (
            <Badge variant="outline">Not connected</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!connected ? (
          <Button onClick={handleConnect} disabled={busy === "connect"}>
            {busy === "connect" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
            Connect Google Calendar
          </Button>
        ) : (
          <>
            <div className="space-y-2">
              <Label>Calendars to sync</Label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto rounded-md border p-2">
                {calendars.length === 0 && (
                  <p className="text-xs text-muted-foreground">No calendars found</p>
                )}
                {calendars.map((c) => (
                  <label
                    key={c.id}
                    className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 rounded px-1.5 py-1"
                  >
                    <Checkbox
                      checked={selectedIds.includes(c.id)}
                      onCheckedChange={() => toggleCalendar(c.id)}
                    />
                    {c.backgroundColor && (
                      <span
                        className="w-2.5 h-2.5 rounded-sm"
                        style={{ backgroundColor: c.backgroundColor }}
                      />
                    )}
                    <span className="flex-1 truncate">{c.summary}</span>
                    {c.primary && <Badge variant="outline" className="text-[10px]">Primary</Badge>}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="two-way">Two-way sync</Label>
                <p className="text-xs text-muted-foreground">
                  Push new StudyHub events to Google
                </p>
              </div>
              <Switch id="two-way" checked={twoWay} onCheckedChange={setTwoWay} />
            </div>

            {twoWay && (
              <div className="space-y-1.5">
                <Label>Push StudyHub events to</Label>
                <Select value={writeId} onValueChange={setWriteId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose target calendar" />
                  </SelectTrigger>
                  <SelectContent>
                    {calendars
                      .filter((c) => c.accessRole !== "reader" && c.accessRole !== "freeBusyReader")
                      .map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.summary}
                          {c.primary ? " (Primary)" : ""}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="past">Days in past</Label>
                <Input
                  id="past"
                  type="number"
                  min={0}
                  max={365}
                  value={daysPast}
                  onChange={(e) => setDaysPast(Math.max(0, Math.min(365, +e.target.value || 0)))}
                />
              </div>
              <div>
                <Label htmlFor="future">Days in future</Label>
                <Input
                  id="future"
                  type="number"
                  min={1}
                  max={365}
                  value={daysFuture}
                  onChange={(e) => setDaysFuture(Math.max(1, Math.min(365, +e.target.value || 1)))}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={saveSettings} disabled={busy === "save"} size="sm">
                {busy === "save" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Save settings
              </Button>
              <Button onClick={syncNow} disabled={busy === "sync"} variant="secondary" size="sm">
                {busy === "sync" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="h-3.5 w-3.5" />
                )}
                Sync now
              </Button>
              <Button
                onClick={handleDisconnect}
                disabled={busy === "disconnect"}
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
              >
                <Unlink className="h-3.5 w-3.5" />
                Disconnect
              </Button>
            </div>

            {lastSync && (
              <p className="text-xs text-muted-foreground">
                Last synced {new Date(lastSync).toLocaleString()}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default GoogleCalendarSettings;

// Add accessRole field to GCal type
declare module "./GoogleCalendarSettings" {}

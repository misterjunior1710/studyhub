import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Loader2, Shield, ShieldAlert, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface AuditLog {
  id: string;
  actor_id: string | null;
  actor_email: string | null;
  action: string;
  target_type: string | null;
  target_id: string | null;
  metadata: any;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

const PAGE_SIZE = 50;

const ACTION_OPTIONS = [
  "all",
  "role_granted",
  "role_revoked",
  "ban_appeal_decision",
  "account_deleted",
  "post_hidden",
  "post_deleted",
  "user_banned",
  "user_unbanned",
];

export default function AdminAudit() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);

  // filters
  const [action, setAction] = useState<string>("all");
  const [actorQuery, setActorQuery] = useState("");
  const [targetId, setTargetId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      return;
    }
    (async () => {
      const { data, error } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin" as any,
      });
      if (error) {
        setIsAdmin(false);
        return;
      }
      setIsAdmin(Boolean(data));
    })();
  }, [user]);

  const fetchLogs = async () => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      let q = supabase
        .from("audit_logs")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

      if (action !== "all") q = q.eq("action", action);
      if (actorQuery.trim()) {
        const v = actorQuery.trim();
        // uuid or email substring
        if (/^[0-9a-f-]{36}$/i.test(v)) q = q.eq("actor_id", v);
        else q = q.ilike("actor_email", `%${v}%`);
      }
      if (targetId.trim() && /^[0-9a-f-]{36}$/i.test(targetId.trim())) {
        q = q.eq("target_id", targetId.trim());
      }
      if (from) q = q.gte("created_at", new Date(from).toISOString());
      if (to) q = q.lte("created_at", new Date(to).toISOString());
      if (search.trim()) q = q.ilike("action", `%${search.trim()}%`);

      const { data, error, count } = await q;
      if (error) throw error;
      setLogs((data || []) as AuditLog[]);
      setTotal(count || 0);
    } catch (e: any) {
      toast.error(e.message || "Failed to load audit logs");
      setLogs([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, page]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / PAGE_SIZE)), [total]);

  if (isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-destructive" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This page is restricted to administrators. Server-side row-level security
              also blocks unauthorized access at the database level.
            </p>
            <Button onClick={() => navigate("/")}>Go home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl py-6 px-4 space-y-6">
      <header className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Audit Logs
          </h1>
          <p className="text-sm text-muted-foreground">
            Immutable, read-only record of administrative & moderation actions.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => { setPage(0); fetchLogs(); }}>
          <RefreshCw className="h-4 w-4 mr-2" /> Refresh
        </Button>
      </header>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <Label htmlFor="action">Action</Label>
              <Select value={action} onValueChange={(v) => { setAction(v); setPage(0); }}>
                <SelectTrigger id="action"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ACTION_OPTIONS.map((a) => (
                    <SelectItem key={a} value={a}>{a === "all" ? "All actions" : a}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="actor">Actor (email or UUID)</Label>
              <Input id="actor" value={actorQuery} onChange={(e) => setActorQuery(e.target.value)} placeholder="admin@example.com" />
            </div>
            <div>
              <Label htmlFor="target">Target user ID</Label>
              <Input id="target" value={targetId} onChange={(e) => setTargetId(e.target.value)} placeholder="UUID" />
            </div>
            <div>
              <Label htmlFor="from">From</Label>
              <Input id="from" type="datetime-local" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="to">To</Label>
              <Input id="to" type="datetime-local" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="search">Search action</Label>
              <Input id="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="e.g. delete" />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button size="sm" onClick={() => { setPage(0); fetchLogs(); }} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Apply filters
            </Button>
            <Button size="sm" variant="ghost" onClick={() => {
              setAction("all"); setActorQuery(""); setTargetId(""); setFrom(""); setTo(""); setSearch(""); setPage(0);
              setTimeout(fetchLogs, 0);
            }}>
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">Time (UTC)</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Metadata</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && (
                  <TableRow><TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin inline mr-2" /> Loading…
                  </TableCell></TableRow>
                )}
                {!loading && logs.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                    No audit events match the current filters.
                  </TableCell></TableRow>
                )}
                {!loading && logs.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-mono text-xs whitespace-nowrap">
                      {format(new Date(l.created_at), "yyyy-MM-dd HH:mm:ss")}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{l.action}</Badge>
                    </TableCell>
                    <TableCell className="text-xs">
                      <div>{l.actor_email || <span className="text-muted-foreground">system</span>}</div>
                      {l.actor_id && (
                        <div className="font-mono text-muted-foreground truncate max-w-[180px]" title={l.actor_id}>
                          {l.actor_id}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-xs">
                      {l.target_type && <Badge variant="outline" className="mr-1">{l.target_type}</Badge>}
                      {l.target_id && (
                        <span className="font-mono text-muted-foreground" title={l.target_id}>
                          {l.target_id.slice(0, 8)}…
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs max-w-md">
                      <pre className="whitespace-pre-wrap break-words font-mono text-[11px] text-muted-foreground">
                        {JSON.stringify(l.metadata ?? {}, null, 0)}
                      </pre>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between text-sm">
        <div className="text-muted-foreground">
          {total.toLocaleString()} events · Page {page + 1} of {totalPages}
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0 || loading}>
            <ChevronLeft className="h-4 w-4" /> Prev
          </Button>
          <Button size="sm" variant="outline" onClick={() => setPage((p) => (p + 1 < totalPages ? p + 1 : p))} disabled={page + 1 >= totalPages || loading}>
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

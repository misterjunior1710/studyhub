import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  AlertTriangle, Eye, EyeOff, Flag, Check, X, Loader2, 
  FileWarning, UserX, AlertCircle, Ban 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface FlaggedPost {
  id: string;
  title: string;
  content: string;
  user_id: string;
  is_hidden: boolean;
  is_flagged: boolean;
  flag_reason: string | null;
  flagged_at: string | null;
  created_at: string;
  profiles: { username: string } | null;
}

interface Report {
  id: string;
  post_id: string;
  reporter_id: string;
  reason: string;
  details: string | null;
  status: string;
  created_at: string;
  posts: { title: string; user_id: string } | null;
  reporter: { username: string } | null;
}

interface UserWarning {
  id: string;
  user_id: string;
  warning_type: string;
  reason: string;
  is_active: boolean;
  created_at: string;
  profiles: { username: string; strike_count: number } | null;
}

const AdminModerationPanel = () => {
  const [posts, setPosts] = useState<FlaggedPost[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [warnings, setWarnings] = useState<UserWarning[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([loadFlaggedPosts(), loadReports(), loadWarnings()]);
    setLoading(false);
  };

  const loadFlaggedPosts = async () => {
    const { data, error } = await supabase
      .from("posts")
      .select("id, title, content, user_id, is_hidden, is_flagged, flag_reason, flagged_at, created_at, profiles(username)")
      .or("is_flagged.eq.true,is_hidden.eq.true")
      .order("flagged_at", { ascending: false, nullsFirst: false });

    if (!error) setPosts(data || []);
  };

  const loadReports = async () => {
    const { data, error } = await supabase
      .from("reports")
      .select(`
        id, post_id, reporter_id, reason, details, status, created_at,
        posts!reports_post_id_fkey(title, user_id)
      `)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (!error) {
      // Fetch reporter usernames separately
      const reportsWithReporters = await Promise.all(
        (data || []).map(async (report) => {
          const { data: reporter } = await supabase
            .from("profiles")
            .select("username")
            .eq("id", report.reporter_id)
            .single();
          return { ...report, reporter };
        })
      );
      setReports(reportsWithReporters);
    }
  };

  const loadWarnings = async () => {
    const { data, error } = await supabase
      .from("user_warnings")
      .select("id, user_id, warning_type, reason, is_active, created_at")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (!error) {
      // Fetch user profiles
      const warningsWithProfiles = await Promise.all(
        (data || []).map(async (warning) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("username, strike_count")
            .eq("id", warning.user_id)
            .single();
          return { ...warning, profiles: profile };
        })
      );
      setWarnings(warningsWithProfiles);
    }
  };

  const handleHidePost = async (postId: string, hide: boolean) => {
    setActionLoading(postId);
    try {
      const { error } = await supabase
        .from("posts")
        .update({ 
          is_hidden: hide,
          is_flagged: false,
          flag_reason: hide ? "Hidden by admin" : null
        })
        .eq("id", postId);

      if (error) throw error;
      toast.success(hide ? "Post hidden" : "Post restored");
      loadFlaggedPosts();
    } catch (error: any) {
      toast.error("Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprovePost = async (postId: string) => {
    setActionLoading(postId);
    try {
      const { error } = await supabase
        .from("posts")
        .update({ 
          is_flagged: false,
          is_hidden: false,
          flag_reason: null
        })
        .eq("id", postId);

      if (error) throw error;
      toast.success("Post approved");
      loadFlaggedPosts();
    } catch (error: any) {
      toast.error("Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeletePost = async (postId: string) => {
    setActionLoading(postId);
    try {
      const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", postId);

      if (error) throw error;
      toast.success("Post deleted permanently");
      loadFlaggedPosts();
    } catch (error: any) {
      toast.error("Delete failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleResolveReport = async (reportId: string, action: "approve" | "hide" | "dismiss", postId: string) => {
    setActionLoading(reportId);
    try {
      if (action === "hide") {
        await supabase
          .from("posts")
          .update({ is_hidden: true, flag_reason: "Hidden after report review" })
          .eq("id", postId);
      }

      await supabase
        .from("reports")
        .update({ 
          status: action === "dismiss" ? "dismissed" : "resolved",
          reviewed_at: new Date().toISOString()
        })
        .eq("id", reportId);

      toast.success(`Report ${action === "dismiss" ? "dismissed" : "resolved"}`);
      loadReports();
      loadFlaggedPosts();
    } catch (error: any) {
      toast.error("Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleIssueWarning = async (userId: string, warningType: string, reason: string, postId?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Create warning
      const { error: warningError } = await supabase
        .from("user_warnings")
        .insert({
          user_id: userId,
          warning_type: warningType,
          reason,
          post_id: postId,
          issued_by: user?.id
        });

      if (warningError) throw warningError;

      // Increment strike count
      const { data: profile } = await supabase
        .from("profiles")
        .select("strike_count")
        .eq("id", userId)
        .single();

      const newStrikeCount = (profile?.strike_count || 0) + 1;

      // Auto-ban after 3 strikes (7-day ban)
      const updateData: any = { strike_count: newStrikeCount };
      if (newStrikeCount >= 3) {
        updateData.is_banned = true;
        updateData.banned_until = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      }

      await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", userId);

      toast.success(`Warning issued. User now has ${newStrikeCount} strike(s).${newStrikeCount >= 3 ? " User has been banned for 7 days." : ""}`);
      loadWarnings();
    } catch (error: any) {
      toast.error("Failed to issue warning");
    }
  };

  const handleBanUser = async (userId: string, days: number) => {
    try {
      const banUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
      
      await supabase
        .from("profiles")
        .update({ 
          is_banned: true, 
          banned_until: banUntil 
        })
        .eq("id", userId);

      toast.success(`User banned for ${days} days`);
      loadWarnings();
    } catch (error: any) {
      toast.error("Failed to ban user");
    }
  };

  const flaggedPosts = posts.filter(p => p.is_flagged && !p.is_hidden);
  const hiddenPosts = posts.filter(p => p.is_hidden);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          Content Moderation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="reports">
          <TabsList className="mb-4">
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileWarning className="h-4 w-4" />
              Reports ({reports.length})
            </TabsTrigger>
            <TabsTrigger value="flagged" className="flex items-center gap-2">
              <Flag className="h-4 w-4" />
              Flagged ({flaggedPosts.length})
            </TabsTrigger>
            <TabsTrigger value="hidden" className="flex items-center gap-2">
              <EyeOff className="h-4 w-4" />
              Hidden ({hiddenPosts.length})
            </TabsTrigger>
            <TabsTrigger value="warnings" className="flex items-center gap-2">
              <UserX className="h-4 w-4" />
              Warnings ({warnings.length})
            </TabsTrigger>
          </TabsList>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-4">
            {reports.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No pending reports</p>
            ) : (
              reports.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  actionLoading={actionLoading}
                  onResolve={(action) => handleResolveReport(report.id, action, report.post_id)}
                  onIssueWarning={(type, reason) => 
                    report.posts?.user_id && handleIssueWarning(report.posts.user_id, type, reason, report.post_id)
                  }
                />
              ))
            )}
          </TabsContent>

          {/* Flagged Posts Tab */}
          <TabsContent value="flagged" className="space-y-4">
            {flaggedPosts.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No flagged posts</p>
            ) : (
              flaggedPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  actionLoading={actionLoading}
                  onApprove={() => handleApprovePost(post.id)}
                  onHide={() => handleHidePost(post.id, true)}
                  onDelete={() => handleDeletePost(post.id)}
                  onIssueWarning={(type, reason) => handleIssueWarning(post.user_id, type, reason, post.id)}
                />
              ))
            )}
          </TabsContent>

          {/* Hidden Posts Tab */}
          <TabsContent value="hidden" className="space-y-4">
            {hiddenPosts.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No hidden posts</p>
            ) : (
              hiddenPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  actionLoading={actionLoading}
                  onRestore={() => handleHidePost(post.id, false)}
                  onDelete={() => handleDeletePost(post.id)}
                  isHidden
                />
              ))
            )}
          </TabsContent>

          {/* Warnings Tab */}
          <TabsContent value="warnings" className="space-y-4">
            {warnings.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No active warnings</p>
            ) : (
              warnings.map((warning) => (
                <WarningCard
                  key={warning.id}
                  warning={warning}
                  onBan={(days) => handleBanUser(warning.user_id, days)}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

// Report Card Component
interface ReportCardProps {
  report: Report;
  actionLoading: string | null;
  onResolve: (action: "approve" | "hide" | "dismiss") => void;
  onIssueWarning: (type: string, reason: string) => void;
}

const ReportCard = ({ report, actionLoading, onResolve, onIssueWarning }: ReportCardProps) => {
  const isLoading = actionLoading === report.id;
  const [warningDialogOpen, setWarningDialogOpen] = useState(false);
  const [warningType, setWarningType] = useState("");
  const [warningReason, setWarningReason] = useState("");

  const handleIssueWarning = () => {
    if (warningType && warningReason) {
      onIssueWarning(warningType, warningReason);
      setWarningDialogOpen(false);
      setWarningType("");
      setWarningReason("");
    }
  };

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-medium">{report.posts?.title || "Deleted Post"}</h4>
          <p className="text-sm text-muted-foreground">
            Reported by {report.reporter?.username || "Unknown"} • {format(new Date(report.created_at), "MMM d, yyyy")}
          </p>
        </div>
        <Badge variant="outline" className="capitalize">{report.reason}</Badge>
      </div>
      
      {report.details && (
        <p className="text-sm bg-muted p-2 rounded">{report.details}</p>
      )}
      
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={() => onResolve("dismiss")} disabled={isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4 mr-1" />}
          Dismiss
        </Button>
        <Button size="sm" variant="outline" onClick={() => onResolve("hide")} disabled={isLoading}>
          <EyeOff className="h-4 w-4 mr-1" />
          Hide Post
        </Button>
        <Dialog open={warningDialogOpen} onOpenChange={setWarningDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="destructive">
              <AlertCircle className="h-4 w-4 mr-1" />
              Issue Warning
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Issue Warning to User</DialogTitle>
              <DialogDescription>
                This will add a strike to the user's account. 3 strikes = 7-day ban.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Warning Type</Label>
                <Select value={warningType} onValueChange={setWarningType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inappropriate">Inappropriate Content</SelectItem>
                    <SelectItem value="spam">Spam</SelectItem>
                    <SelectItem value="harassment">Harassment</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Reason</Label>
                <Textarea 
                  value={warningReason} 
                  onChange={(e) => setWarningReason(e.target.value)}
                  placeholder="Explain why this warning is being issued..."
                />
              </div>
              <Button onClick={handleIssueWarning} className="w-full" disabled={!warningType || !warningReason}>
                Issue Warning
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

// Post Card Component
interface PostCardProps {
  post: FlaggedPost;
  actionLoading: string | null;
  onApprove?: () => void;
  onHide?: () => void;
  onRestore?: () => void;
  onDelete: () => void;
  onIssueWarning?: (type: string, reason: string) => void;
  isHidden?: boolean;
}

const PostCard = ({ post, actionLoading, onApprove, onHide, onRestore, onDelete, onIssueWarning, isHidden }: PostCardProps) => {
  const isLoading = actionLoading === post.id;

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-medium">{post.title}</h4>
          <p className="text-sm text-muted-foreground">
            by {post.profiles?.username || "Unknown"} • {format(new Date(post.created_at), "MMM d, yyyy")}
          </p>
        </div>
        {post.flag_reason && (
          <Badge variant="destructive" className="text-xs">
            {post.flag_reason}
          </Badge>
        )}
      </div>
      
      <p className="text-sm line-clamp-3" dangerouslySetInnerHTML={{ __html: post.content }} />
      
      <div className="flex gap-2">
        {onApprove && (
          <Button size="sm" variant="outline" onClick={onApprove} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 mr-1" />}
            Approve
          </Button>
        )}
        {onHide && (
          <Button size="sm" variant="outline" onClick={onHide} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <EyeOff className="h-4 w-4 mr-1" />}
            Hide
          </Button>
        )}
        {onRestore && (
          <Button size="sm" variant="outline" onClick={onRestore} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4 mr-1" />}
            Restore
          </Button>
        )}
        <Button size="sm" variant="destructive" onClick={onDelete} disabled={isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4 mr-1" />}
          Delete
        </Button>
      </div>
    </div>
  );
};

// Warning Card Component
interface WarningCardProps {
  warning: UserWarning;
  onBan: (days: number) => void;
}

const WarningCard = ({ warning, onBan }: WarningCardProps) => {
  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-medium flex items-center gap-2">
            {warning.profiles?.username || "Unknown User"}
            <Badge variant="outline">{warning.profiles?.strike_count || 0} strikes</Badge>
          </h4>
          <p className="text-sm text-muted-foreground capitalize">
            {warning.warning_type} • {format(new Date(warning.created_at), "MMM d, yyyy")}
          </p>
        </div>
      </div>
      
      <p className="text-sm bg-muted p-2 rounded">{warning.reason}</p>
      
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => onBan(1)}>
          <Ban className="h-4 w-4 mr-1" />
          Ban 1 Day
        </Button>
        <Button size="sm" variant="outline" onClick={() => onBan(7)}>
          <Ban className="h-4 w-4 mr-1" />
          Ban 7 Days
        </Button>
        <Button size="sm" variant="destructive" onClick={() => onBan(30)}>
          <Ban className="h-4 w-4 mr-1" />
          Ban 30 Days
        </Button>
      </div>
    </div>
  );
};

export default AdminModerationPanel;

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Eye, EyeOff, Flag, Check, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface FlaggedPost {
  id: string;
  title: string;
  content: string;
  is_hidden: boolean;
  is_flagged: boolean;
  flag_reason: string | null;
  flagged_at: string | null;
  created_at: string;
  profiles: { username: string } | null;
}

const AdminModerationPanel = () => {
  const [posts, setPosts] = useState<FlaggedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadFlaggedPosts();
  }, []);

  const loadFlaggedPosts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("id, title, content, is_hidden, is_flagged, flag_reason, flagged_at, created_at, profiles(username)")
        .or("is_flagged.eq.true,is_hidden.eq.true")
        .order("flagged_at", { ascending: false, nullsFirst: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error: any) {
      toast.error("Failed to load flagged posts");
      console.error(error);
    } finally {
      setLoading(false);
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
        <Tabs defaultValue="flagged">
          <TabsList className="mb-4">
            <TabsTrigger value="flagged" className="flex items-center gap-2">
              <Flag className="h-4 w-4" />
              Flagged ({flaggedPosts.length})
            </TabsTrigger>
            <TabsTrigger value="hidden" className="flex items-center gap-2">
              <EyeOff className="h-4 w-4" />
              Hidden ({hiddenPosts.length})
            </TabsTrigger>
          </TabsList>

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
                />
              ))
            )}
          </TabsContent>

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
        </Tabs>
      </CardContent>
    </Card>
  );
};

interface PostCardProps {
  post: FlaggedPost;
  actionLoading: string | null;
  onApprove?: () => void;
  onHide?: () => void;
  onRestore?: () => void;
  onDelete: () => void;
  isHidden?: boolean;
}

const PostCard = ({ post, actionLoading, onApprove, onHide, onRestore, onDelete, isHidden }: PostCardProps) => {
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

export default AdminModerationPanel;

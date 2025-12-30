import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check, X, UserPlus } from "lucide-react";
import { toast } from "sonner";

interface JoinRequest {
  id: string;
  user_id: string;
  group_id: string;
  status: string;
  created_at: string;
  user?: {
    username: string | null;
    avatar_url: string | null;
  };
}

interface GroupJoinRequestsProps {
  groupId: string;
  isAdmin: boolean;
}

const GroupJoinRequests = ({ groupId, isAdmin }: GroupJoinRequestsProps) => {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["group-join-requests", groupId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("group_join_requests")
        .select("*")
        .eq("group_id", groupId)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch user profiles for each request
      const requestsWithUsers = await Promise.all(
        (data || []).map(async (request) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("username, avatar_url")
            .eq("id", request.user_id)
            .single();

          return {
            ...request,
            user: profile || { username: null, avatar_url: null },
          };
        })
      );

      return requestsWithUsers;
    },
    enabled: isAdmin,
    staleTime: 10 * 1000,
  });

  const handleRequest = async (requestId: string, userId: string, accept: boolean) => {
    setProcessingId(requestId);
    try {
      if (accept) {
        // Add user to group
        const { error: memberError } = await supabase
          .from("group_members")
          .insert({
            group_id: groupId,
            user_id: userId,
            role: "member",
          });

        if (memberError) throw memberError;
      }

      // Update request status
      const { error: updateError } = await supabase
        .from("group_join_requests")
        .update({ status: accept ? "accepted" : "rejected", updated_at: new Date().toISOString() })
        .eq("id", requestId);

      if (updateError) throw updateError;

      toast.success(accept ? "Request accepted!" : "Request rejected");
      queryClient.invalidateQueries({ queryKey: ["group-join-requests", groupId] });
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    } catch (error) {
      console.error("Error processing request:", error);
      toast.error("Failed to process request");
    } finally {
      setProcessingId(null);
    }
  };

  if (!isAdmin) return null;

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  if (requests.length === 0) return null;

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-primary" />
          <CardTitle className="text-base">Join Requests</CardTitle>
          <Badge variant="secondary">{requests.length}</Badge>
        </div>
        <CardDescription>Users waiting to join this group</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {requests.map((request) => (
          <div
            key={request.id}
            className="flex items-center justify-between gap-3 p-3 rounded-lg bg-background border"
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                {request.user?.avatar_url && (
                  <AvatarImage src={request.user.avatar_url} />
                )}
                <AvatarFallback>
                  {request.user?.username?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">
                  {request.user?.username || "Unknown User"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Requested {new Date(request.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleRequest(request.id, request.user_id, false)}
                disabled={processingId === request.id}
                className="h-8 w-8 p-0"
              >
                {processingId === request.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <X className="h-4 w-4" />
                )}
              </Button>
              <Button
                size="sm"
                onClick={() => handleRequest(request.id, request.user_id, true)}
                disabled={processingId === request.id}
                className="h-8 w-8 p-0"
              >
                {processingId === request.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default GroupJoinRequests;

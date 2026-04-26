import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "").trim();

    if (!token) {
      return jsonResponse({ error: "Authentication required" }, 401);
    }

    const { confirmation } = await req.json().catch(() => ({}));
    if (confirmation !== "DELETE_MY_ACCOUNT") {
      return jsonResponse({ error: "Invalid confirmation" }, 400);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      return jsonResponse({ error: "Server configuration error" }, 500);
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: userData, error: userError } = await adminClient.auth.getUser(token);
    if (userError || !userData.user) {
      return jsonResponse({ error: "Invalid session" }, 401);
    }

    const userId = userData.user.id;
    const deleteOperations = [
      adminClient.from("notifications").delete().eq("user_id", userId),
      adminClient.from("bookmarks").delete().eq("user_id", userId),
      adminClient.from("votes").delete().eq("user_id", userId),
      adminClient.from("comment_helpful_votes").delete().eq("user_id", userId),
      adminClient.from("comments").delete().eq("user_id", userId),
      adminClient.from("reports").delete().eq("reporter_id", userId),
      adminClient.from("posts").delete().eq("user_id", userId),
      adminClient.from("group_members").delete().eq("user_id", userId),
      adminClient.from("group_join_requests").delete().eq("user_id", userId),
      adminClient.from("direct_messages").delete().eq("sender_id", userId),
      adminClient.from("friends").delete().or(`user_id.eq.${userId},friend_id.eq.${userId}`),
      adminClient.from("follows").delete().or(`follower_id.eq.${userId},following_id.eq.${userId}`),
      adminClient.from("notes").delete().eq("user_id", userId),
      adminClient.from("study_sessions").delete().eq("user_id", userId),
      adminClient.from("reading_sessions").delete().eq("user_id", userId),
      adminClient.from("user_badges").delete().eq("user_id", userId),
      adminClient.from("user_missions").delete().eq("user_id", userId),
      adminClient.from("user_powerups").delete().eq("user_id", userId),
      adminClient.from("user_roles").delete().eq("user_id", userId),
      adminClient.from("user_wallet").delete().eq("user_id", userId),
      adminClient.from("user_xp_totals").delete().eq("user_id", userId),
      adminClient.from("profiles").delete().eq("id", userId),
    ];

    const results = await Promise.all(deleteOperations);
    const failedDelete = results.find((result) => result.error);
    if (failedDelete?.error) {
      console.error("Account data deletion failed", failedDelete.error);
      return jsonResponse({ error: "Failed to delete account data" }, 500);
    }

    const { error: deleteUserError } = await adminClient.auth.admin.deleteUser(userId);
    if (deleteUserError) {
      console.error("Auth user deletion failed", deleteUserError);
      return jsonResponse({ error: "Failed to delete account" }, 500);
    }

    return jsonResponse({ success: true });
  } catch (error) {
    console.error("Unexpected delete-account error", error);
    return jsonResponse({ error: "Failed to delete account" }, 500);
  }
});
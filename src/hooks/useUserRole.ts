import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useUserRole = (userId?: string) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isVerifier, setIsVerifier] = useState(false);
  const [isModerator, setIsModerator] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkRoles = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const { data: roles, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId);

        if (error) throw error;

        const roleSet = new Set(roles?.map((r) => r.role) || []);
        setIsAdmin(roleSet.has("admin"));
        setIsVerifier(roleSet.has("verifier"));
        setIsModerator(roleSet.has("moderator"));
      } catch (error) {
        console.error("Error checking roles:", error);
      } finally {
        setLoading(false);
      }
    };

    checkRoles();
  }, [userId]);

  return {
    isAdmin,
    isVerifier,
    isModerator,
    canVerify: isAdmin || isVerifier,
    loading,
  };
};

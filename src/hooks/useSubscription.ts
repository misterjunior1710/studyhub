import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type SubscriptionPlan = "pro_monthly" | "pro_yearly" | null;
export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "renewed"
  | "cancelled"
  | "on_hold"
  | "expired"
  | "failed"
  | "paused"
  | null;

export interface SubscriptionState {
  isPro: boolean;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  loading: boolean;
  refetch: () => Promise<void>;
}

const ACTIVE_STATUSES: SubscriptionStatus[] = ["active", "trialing", "renewed"];

function computeIsPro(plan: SubscriptionPlan, status: SubscriptionStatus, periodEnd: string | null) {
  if (plan !== "pro_monthly" && plan !== "pro_yearly") return false;
  if (ACTIVE_STATUSES.includes(status)) {
    if (!periodEnd) return true;
    return new Date(periodEnd).getTime() > Date.now();
  }
  if ((status === "cancelled" || status === "on_hold") && periodEnd) {
    return new Date(periodEnd).getTime() > Date.now();
  }
  return false;
}

export function useSubscription(): SubscriptionState {
  const { user } = useAuth();
  const [plan, setPlan] = useState<SubscriptionPlan>(null);
  const [status, setStatus] = useState<SubscriptionStatus>(null);
  const [currentPeriodEnd, setCurrentPeriodEnd] = useState<string | null>(null);
  const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) {
      setPlan(null);
      setStatus(null);
      setCurrentPeriodEnd(null);
      setCancelAtPeriodEnd(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("subscriptions")
      .select("plan, status, current_period_end, cancel_at_period_end, updated_at, created_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!error && data) {
      setPlan((data.plan as SubscriptionPlan) ?? null);
      setStatus((data.status as SubscriptionStatus) ?? null);
      setCurrentPeriodEnd(data.current_period_end ?? null);
      setCancelAtPeriodEnd(!!data.cancel_at_period_end);
    } else {
      setPlan(null);
      setStatus(null);
      setCurrentPeriodEnd(null);
      setCancelAtPeriodEnd(false);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  // Realtime updates — switches the UI the moment the webhook lands
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`subscriptions:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "subscriptions",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          load();
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, load]);

  const isPro = computeIsPro(plan, status, currentPeriodEnd);

  return {
    isPro,
    plan,
    status,
    currentPeriodEnd,
    cancelAtPeriodEnd,
    loading,
    refetch: load,
  };
}

export const useIsPro = () => useSubscription().isPro;

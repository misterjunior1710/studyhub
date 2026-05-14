import { useState } from "react";
import { Link } from "react-router-dom";
import { Crown, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { getStripeEnvironment } from "@/lib/stripe";
import { ProBadge } from "./ProBadge";
import { toast } from "sonner";

export function SubscriptionManager() {
  const { subscription, isPro, loading } = useSubscription();
  const [busy, setBusy] = useState(false);

  const planLabel = subscription?.price_id === "pro_yearly"
    ? "StudyHub Pro — Yearly"
    : subscription?.price_id === "pro_monthly"
      ? "StudyHub Pro — Monthly"
      : "StudyHub Pro";

  const renewDate = subscription?.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString()
    : null;

  const isPromo = subscription?.stripe_subscription_id?.startsWith("promo_");

  const openPortal = async () => {
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-portal-session", {
        body: {
          environment: getStripeEnvironment(),
          returnUrl: `${window.location.origin}/settings`,
        },
      });
      if (error || !data?.url) throw new Error(error?.message || "Could not open billing portal");
      window.open(data.url, "_blank", "noopener,noreferrer");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to open billing portal");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6 flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </Card>
    );
  }

  if (!isPro) {
    return (
      <Card className="p-6 bg-gradient-to-br from-primary/5 via-background to-accent/5 border-primary/30">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-primary to-accent shrink-0">
            <Crown className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">You're on the Free plan</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Unlock unlimited AI, premium themes, and advanced study tools.
            </p>
            <Button asChild variant="gradient" size="sm" className="mt-3">
              <Link to="/pricing">Upgrade to Pro</Link>
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{planLabel}</h3>
            <ProBadge />
          </div>
          <p className="text-sm text-muted-foreground mt-1 capitalize">
            Status: {subscription?.status}
            {renewDate && (
              <>
                {" · "}
                {subscription?.cancel_at_period_end ? "Ends" : "Renews"} {renewDate}
              </>
            )}
          </p>
          {isPromo && (
            <p className="text-xs text-orange-500 mt-2">
              Test-mode access via internal promo code.
            </p>
          )}
        </div>
        {!isPromo && (
          <Button variant="outline" size="sm" onClick={openPortal} disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
            Manage billing
          </Button>
        )}
      </div>
    </Card>
  );
}

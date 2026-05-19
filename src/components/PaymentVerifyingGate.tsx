import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, ShieldCheck, AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  expectedPlan: "pro_monthly" | "pro_yearly";
  retryHref: string;
  children: React.ReactNode;
}

const TIMEOUT_MS = 60_000;

/**
 * Gates a success page on backend webhook confirmation.
 * - Reads subscription via useSubscription (realtime updates).
 * - Falls back to active polling (refetch every 2.5s) in case realtime is slow.
 * - Stops the moment isPro + plan match.
 */
export default function PaymentVerifyingGate({ expectedPlan, retryHref, children }: Props) {
  const { user } = useAuth();
  const { isPro, plan, status, refetch } = useSubscription();
  const [timedOut, setTimedOut] = useState(false);

  const confirmed = isPro && plan === expectedPlan;

  // Active poll fallback — stops immediately once confirmed or timed out
  useEffect(() => {
    if (confirmed || timedOut) return;
    const start = Date.now();
    const interval = window.setInterval(() => {
      if (Date.now() - start >= TIMEOUT_MS) {
        setTimedOut(true);
        window.clearInterval(interval);
        return;
      }
      refetch();
    }, 2500);
    return () => window.clearInterval(interval);
  }, [confirmed, timedOut, refetch]);

  if (confirmed) return <>{children}</>;

  if (!user) {
    return (
      <div className="container mx-auto max-w-md px-4 py-24 text-center">
        <Card className="rounded-2xl p-8 bg-card/80 backdrop-blur border-border/60">
          <AlertCircle className="mx-auto mb-3 h-8 w-8 text-primary" />
          <h2 className="text-xl font-semibold">Sign in to confirm your payment</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Log in with the email you used at checkout so we can link the subscription to your account.
          </p>
          <Button asChild className="mt-5 w-full">
            <Link to="/auth">Sign in</Link>
          </Button>
        </Card>
      </div>
    );
  }

  if (timedOut && !confirmed) {
    const failedStatus = status === "failed" || status === "expired";
    return (
      <div className="container mx-auto max-w-lg px-4 py-20 text-center">
        <Card className="rounded-2xl p-8 bg-card/80 backdrop-blur border-border/60">
          <AlertCircle className="mx-auto mb-3 h-9 w-9 text-amber-500" />
          <h2 className="text-xl font-semibold">
            {failedStatus ? "Payment didn't go through" : "Still confirming your payment"}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {failedStatus
              ? "Your bank reported an issue. No worries — you can try again with the same or a different card."
              : "Your payment may still be processing. This usually clears within a few minutes."}
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <Button asChild>
              <Link to={retryHref}>
                Retry payment
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/support">Contact support</Link>
            </Button>
          </div>
          <button
            type="button"
            onClick={() => {
              setTimedOut(false);
              refetch();
            }}
            className="mt-5 text-xs text-muted-foreground underline hover:text-foreground"
          >
            Check again
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-md px-4 py-24 text-center">
      <Card className="rounded-2xl p-8 bg-card/80 backdrop-blur border-border/60">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 ring-1 ring-primary/30">
          <Loader2 className="h-7 w-7 text-primary animate-spin" />
        </div>
        <h2 className="text-xl font-semibold">Confirming your payment securely…</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          We're waiting on our payment provider to confirm your subscription. This usually takes just a few seconds — no need to refresh.
        </p>
        <div className="mt-5 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-primary" />
          Verified server-side · webhook secured
        </div>
      </Card>
    </div>
  );
}

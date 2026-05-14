import { useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle2, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/useSubscription";
import Navbar from "@/components/Navbar";
import { Helmet } from "react-helmet-async";

export default function CheckoutReturn() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { refetch, isPro } = useSubscription();

  useEffect(() => {
    // Poll for the webhook to land
    let cancelled = false;
    let tries = 0;
    const tick = async () => {
      if (cancelled) return;
      await refetch();
      tries++;
      if (!isPro && tries < 10) setTimeout(tick, 1500);
    };
    tick();
    return () => {
      cancelled = true;
    };
  }, [refetch, isPro]);

  return (
    <>
      <Helmet>
        <title>Welcome to Pro — StudyHub</title>
      </Helmet>
      <Navbar />
      <main className="container mx-auto px-4 py-16 max-w-xl text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-primary to-accent">
          <CheckCircle2 className="h-8 w-8 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2 justify-center">
          Welcome to Pro <Crown className="h-6 w-6 text-primary" />
        </h1>
        <p className="mt-3 text-muted-foreground">
          {isPro
            ? "Your subscription is active. Time to study smarter."
            : "Payment complete! We're activating your subscription — this usually takes a few seconds."}
        </p>
        {sessionId && (
          <p className="mt-2 text-[11px] text-muted-foreground/70 break-all">
            Reference: {sessionId}
          </p>
        )}
        <div className="mt-8 flex gap-3 justify-center">
          <Button asChild variant="gradient">
            <Link to="/feed">Go to feed</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/settings">Manage subscription</Link>
          </Button>
        </div>
      </main>
    </>
  );
}

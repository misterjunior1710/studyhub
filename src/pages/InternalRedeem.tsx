// Hidden internal route — not linked anywhere in the public UI.
// Used by the StudyHub team to grant test-mode Pro access.
import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { getStripeEnvironment } from "@/lib/stripe";
import { toast } from "sonner";

export default function InternalRedeem() {
  const { user } = useAuth();
  const { refetch, isPro } = useSubscription();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  const env = getStripeEnvironment();
  const isSandbox = env === "sandbox";

  const submit = async () => {
    if (!user) {
      toast.error("Sign in first");
      return;
    }
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("redeem-promo-code", {
        body: { code, environment: env },
      });
      if (error || data?.error) {
        toast.error(data?.error || error?.message || "Invalid code");
        return;
      }
      toast.success("Pro access granted (test mode)");
      await refetch();
      setCode("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to redeem");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Internal Redeem — StudyHub</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      <main className="min-h-screen flex items-center justify-center px-4 py-16">
        <Card className="w-full max-w-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="h-5 w-5 text-muted-foreground" />
            <h1 className="text-lg font-semibold">Internal Test Redemption</h1>
          </div>
          {!isSandbox ? (
            <p className="text-sm text-destructive">
              Promo redemption is disabled in live mode.
            </p>
          ) : isPro ? (
            <p className="text-sm text-muted-foreground">
              You already have Pro access in test mode.
            </p>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                Enter the internal test code to activate Pro for QA. Sandbox only.
              </p>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter code"
                autoComplete="off"
                spellCheck={false}
              />
              <Button
                className="w-full mt-3"
                variant="gradient"
                onClick={submit}
                disabled={busy || !code.trim() || !user}
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Activate Pro (test)"}
              </Button>
              {!user && (
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  Sign in first to redeem.
                </p>
              )}
            </>
          )}
        </Card>
      </main>
    </>
  );
}

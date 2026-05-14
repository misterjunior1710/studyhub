import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Check, Crown, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { StripeEmbeddedCheckout } from "@/components/StripeEmbeddedCheckout";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ProBadge } from "@/components/pro/ProBadge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const FREE_FEATURES = [
  "Core feed, groups & questions",
  "Basic study tools (limited)",
  "Nova AI Assistant (daily limit)",
  "Community support",
];

const PRO_FEATURES = [
  "Unlimited Nova AI Assistant messages",
  "Unlimited AI Content Generator",
  "Unlimited Flashcards, Quizzes & Mind Maps",
  "Collaborative Whiteboards & Docs",
  "Premium themes & customization",
  "Pro badge on your profile",
  "Priority support",
];

export default function Pricing() {
  const { user } = useAuth();
  const { isPro } = useSubscription();
  const navigate = useNavigate();
  const [interval, setInterval] = useState<"monthly" | "yearly">("yearly");
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const handleUpgrade = () => {
    if (!user) {
      toast.info("Sign in to subscribe");
      navigate("/auth?next=/pricing");
      return;
    }
    if (isPro) {
      toast.success("You're already on Pro!");
      navigate("/settings");
      return;
    }
    setCheckoutOpen(true);
  };

  const priceId = interval === "monthly" ? "pro_monthly" : "pro_yearly";

  return (
    <>
      <Helmet>
        <title>StudyHub Pro Pricing — Study Smarter, Ace Everything</title>
        <meta
          name="description"
          content="Upgrade to StudyHub Pro for unlimited AI, advanced study tools, premium themes, and more. Start with a free plan."
        />
      </Helmet>
      <PaymentTestModeBanner />
      <Navbar />
      <main className="container mx-auto px-4 py-10 md:py-16 max-w-6xl">
        <div className="text-center mb-10 md:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
            <Sparkles className="h-3.5 w-3.5" /> StudyHub™ — Study Smarter, Ace Everything
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
            Choose your plan
          </h1>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Start free. Go Pro when you're ready to unlock the full power of StudyHub.
          </p>

          <div className="mt-6 inline-flex">
            <Tabs value={interval} onValueChange={(v) => setInterval(v as "monthly" | "yearly")}>
              <TabsList>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                <TabsTrigger value="yearly" className="gap-2">
                  Yearly
                  <span className="text-[10px] font-bold rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground px-1.5 py-0.5">
                    SAVE 33%
                  </span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Free */}
          <Card className="p-6 md:p-8 flex flex-col">
            <h2 className="text-xl font-semibold">Free</h2>
            <p className="text-sm text-muted-foreground mt-1">Get started with the basics</p>
            <div className="mt-6">
              <span className="text-4xl font-bold">$0</span>
              <span className="text-muted-foreground"> /forever</span>
            </div>
            <ul className="mt-6 space-y-3 flex-1">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Button variant="outline" className="mt-6" disabled>
              Current plan
            </Button>
          </Card>

          {/* Pro */}
          <Card
            className={cn(
              "relative p-6 md:p-8 flex flex-col border-2 border-primary/40",
              "bg-gradient-to-br from-primary/5 via-background to-accent/5",
            )}
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground text-xs font-bold px-3 py-1 inline-flex items-center gap-1">
                <Crown className="h-3 w-3" /> MOST POPULAR
              </span>
            </div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">StudyHub Pro</h2>
              <ProBadge />
            </div>
            <p className="text-sm text-muted-foreground mt-1">Everything unlocked</p>
            <div className="mt-6">
              {interval === "monthly" ? (
                <>
                  <span className="text-4xl font-bold">$4.99</span>
                  <span className="text-muted-foreground"> /month</span>
                </>
              ) : (
                <>
                  <span className="text-4xl font-bold">$39.99</span>
                  <span className="text-muted-foreground"> /year</span>
                  <div className="text-xs text-primary font-medium mt-1">
                    Just $3.33/month — save 33%
                  </div>
                </>
              )}
            </div>
            <ul className="mt-6 space-y-3 flex-1">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Button variant="gradient" className="mt-6" onClick={handleUpgrade} disabled={isPro}>
              {isPro ? "You're Pro ✨" : interval === "monthly" ? "Go Pro Monthly" : "Go Pro Yearly"}
            </Button>
            <p className="text-[11px] text-muted-foreground mt-3 text-center">
              Cancel anytime. Manage from settings.
            </p>
          </Card>
        </div>

        <div className="mt-12 text-center text-xs text-muted-foreground">
          Questions about Pro? Visit our{" "}
          <a href="/support" className="underline hover:text-foreground">support page</a>.
        </div>
      </main>
      <Footer />

      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary" />
              Upgrade to StudyHub Pro
            </DialogTitle>
          </DialogHeader>
          <div className="px-2 pb-2 max-h-[80vh] overflow-y-auto">
            {checkoutOpen && user && (
              <StripeEmbeddedCheckout
                priceId={priceId}
                customerEmail={user.email}
                userId={user.id}
              />
            )}
            {!user && (
              <div className="p-8 text-center">
                <Loader2 className="h-5 w-5 animate-spin mx-auto" />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

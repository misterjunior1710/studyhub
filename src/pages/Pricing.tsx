import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import SEOHead from "@/components/SEOHead";
import {
  Check,
  X,
  Sparkles,
  Crown,
  Zap,
  Users,
  Palette,
  Trophy,
  Brain,
  ShieldCheck,
  Rocket,
  Star,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";

type BillingCycle = "monthly" | "yearly";

interface PlanFeature {
  label: string;
  included: boolean;
}

interface Plan {
  id: "free" | "pro_monthly" | "pro_yearly";
  name: string;
  tagline: string;
  price: string;
  cadence: string;
  cta: string;
  badge?: string;
  highlight?: string;
  icon: React.ElementType;
  features: PlanFeature[];
  popular?: boolean;
  bestValue?: boolean;
}

const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    tagline: "Get started with the essentials",
    price: "$0",
    cadence: "/month",
    cta: "Get Started Free",
    icon: Sparkles,
    features: [
      { label: "Basic StudyHub™ access", included: true },
      { label: "3 Nova AI messages / day", included: true },
      { label: "2 tiny AI feature uses / day", included: true },
      { label: "Basic flashcards & quizzes", included: true },
      { label: "Public groups & feed", included: true },
      { label: "Basic whiteboard access", included: true },
      { label: "Standard themes", included: true },
      { label: "Priority support", included: false },
      { label: "Pro badge", included: false },
    ],
  },
  {
    id: "pro_monthly",
    name: "StudyHub™ Pro",
    tagline: "Unlock your full academic potential",
    price: "$4.99",
    cadence: "/month",
    cta: "Upgrade to Pro",
    badge: "Most Popular",
    icon: Crown,
    popular: true,
    features: [
      { label: "Enhanced Nova AI Assistant", included: true },
      { label: "Enhanced AI generations", included: true },
      { label: "Advanced flashcards, quizzes & mind maps", included: true },
      { label: "Collaborative whiteboards & docs", included: true },
      { label: "Premium themes", included: true },
      { label: "Pro badge on profile", included: true },
      { label: "Priority support", included: true },
      { label: "Advanced productivity tools", included: true },
      { label: "All future Pro features included", included: true },
    ],
  },
  {
    id: "pro_yearly",
    name: "StudyHub™ Pro",
    tagline: "Best value — save 33% annually",
    price: "$39.99",
    cadence: "/year",
    cta: "Get Yearly Pro",
    badge: "Best Value",
    highlight: "Save 33%",
    icon: Trophy,
    bestValue: true,
    features: [
      { label: "Everything in Pro Monthly", included: true },
      { label: "Save 33% vs monthly billing", included: true },
      { label: "Locked-in yearly pricing", included: true },
      { label: "Early access to new Pro features", included: true },
      { label: "Premium yearly-only themes", included: true },
      { label: "Pro badge on profile", included: true },
      { label: "Priority support", included: true },
      { label: "Advanced productivity tools", included: true },
      { label: "Cancel anytime", included: true },
    ],
  },
];

const COMPARISON_ROWS: { label: string; free: string | boolean; monthly: string | boolean; yearly: string | boolean }[] = [
  { label: "Nova AI messages", free: "3 / day", monthly: "Enhanced", yearly: "Enhanced" },
  { label: "AI study tool generations", free: "Limited", monthly: "Enhanced", yearly: "Enhanced" },
  { label: "Flashcards, quizzes, mind maps", free: "Basic", monthly: "Advanced", yearly: "Advanced" },
  { label: "Collaborative whiteboards & docs", free: false, monthly: true, yearly: true },
  { label: "Premium themes", free: false, monthly: true, yearly: true },
  { label: "Pro badge on profile", free: false, monthly: true, yearly: true },
  { label: "Priority support", free: false, monthly: true, yearly: true },
  { label: "Advanced productivity tools", free: false, monthly: true, yearly: true },
  { label: "Save 33%", free: false, monthly: false, yearly: true },
];

const TRUST_POINTS = [
  {
    icon: Brain,
    title: "AI-powered learning",
    body: "Nova AI helps you understand tough topics, generate study material, and revise faster.",
  },
  {
    icon: Users,
    title: "Built for collaboration",
    body: "Study Squads, shared whiteboards, and live docs make group study actually productive.",
  },
  {
    icon: Rocket,
    title: "Productivity that sticks",
    body: "Pomodoro, tasks, calendar, missions, and streaks keep your study routine consistent.",
  },
  {
    icon: ShieldCheck,
    title: "Safe for students 13+",
    body: "Moderated community, age-gated access, and student-first privacy from day one.",
  },
];

const FAQ_ITEMS = [
  {
    q: "Can I cancel anytime?",
    a: "Yes. You can cancel your StudyHub™ Pro subscription at any time from your account settings. You'll keep Pro access until the end of your current billing period.",
  },
  {
    q: "Is this in test mode?",
    a: "Right now, checkout is in preview / test mode while we finish our payments setup. CTA buttons are placeholders and won't charge you. We'll switch on live payments before launch.",
  },
  {
    q: "What payment methods are supported?",
    a: "Once live, we'll support major credit and debit cards, plus regional payment methods (Apple Pay, Google Pay, and more) through our payments provider.",
  },
  {
    q: "Do students get a discount?",
    a: "StudyHub™ Pro is already priced for students — under $5/month, or just over $3/month on the yearly plan. The yearly plan saves you 33% automatically.",
  },
  {
    q: "What features are included in Pro?",
    a: "Enhanced Nova AI access, advanced flashcards/quizzes/mind maps, collaborative whiteboards & docs, premium themes, a Pro badge, priority support, and all future Pro features as we ship them.",
  },
  {
    q: "What happens to my Free account if I upgrade?",
    a: "Everything stays — your posts, notes, friends, groups, missions, and streaks are unchanged. Pro just unlocks more usage and features on top.",
  },
];

const Pricing = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { isPro: userIsPro, plan: currentPlan } = useSubscription();
  const [cycle, setCycle] = useState<BillingCycle>("yearly");
  const [loadingPlan, setLoadingPlan] = useState<Plan["id"] | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  // Handle canceled-from-checkout return
  useEffect(() => {
    if (searchParams.get("canceled") === "1") {
      toast("Checkout canceled", {
        description: "No charge was made. You can try again anytime.",
      });
    }
  }, [searchParams]);

  const handleSelectPlan = async (plan: Plan) => {
    if (plan.id === "free") {
      if (!user) {
        navigate("/auth");
      } else {
        navigate("/feed");
      }
      return;
    }

    // Already subscribed to this plan
    if (userIsPro && currentPlan === plan.id) {
      navigate("/settings#billing");
      return;
    }

    if (!user) {
      navigate(`/auth?next=${encodeURIComponent(`/pricing?cycle=${cycle}`)}`);
      return;
    }

    setLoadingPlan(plan.id);
    try {
      const { data, error } = await supabase.functions.invoke("dodo-create-checkout", {
        body: { plan: plan.id, origin: window.location.origin },
      });
      if (error) throw error;
      if (!data?.url) throw new Error("No checkout URL returned");
      // Hosted Dodo checkout — full-page redirect feels smoothest on mobile
      window.location.href = data.url as string;
    } catch (e: any) {
      console.error("Checkout error", e);
      setLoadingPlan(null);
      toast.error("Couldn't start checkout", {
        description: e?.message ?? "Please try again in a moment.",
        action: { label: "Retry", onClick: () => handleSelectPlan(plan) },
      });
    }
  };

  const visiblePlans = PLANS.filter((p) => {
    if (p.id === "free") return true;
    if (cycle === "monthly") return p.id === "pro_monthly";
    return p.id === "pro_yearly";
  });

  // For comparison table we always show all three columns
  const allPlans = PLANS;

  return (
    <>
      <SEOHead
        title="StudyHub™ Pricing — Free & Pro Plans for Students"
        description="Affordable StudyHub™ plans for students. Start free, or upgrade to Pro for enhanced Nova AI, advanced study tools, premium themes & priority support."
        canonical="https://studyhub.world/pricing"
      />

      <Navbar />

      <div className="min-h-screen bg-background text-foreground">
        {/* HERO */}
        <section className="relative overflow-hidden">
          {/* background glow */}
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-[-10%] h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px] opacity-60" />
            <div className="absolute right-[10%] top-[20%] h-[260px] w-[260px] rounded-full bg-accent/20 blur-[100px] opacity-50" />
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)",
                backgroundSize: "28px 28px",
              }}
            />
          </div>

          <div className="container mx-auto px-4 pt-14 pb-10 sm:pt-20 sm:pb-14 max-w-6xl">
            <div className="mx-auto max-w-3xl text-center">
              <Badge
                variant="secondary"
                className="mb-5 gap-1.5 rounded-full border border-border/60 bg-card/70 px-3 py-1 text-xs font-medium backdrop-blur"
              >
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Simple, student-friendly pricing
              </Badge>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.05]">
                Unlock your full{" "}
                <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
                  academic potential
                </span>
              </h1>
              <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                Start free and upgrade when you're ready. StudyHub™ Pro gives you enhanced AI,
                advanced study tools, and premium collaboration — all designed for students.
              </p>

              {/* Hero CTAs */}
              <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  size="lg"
                  onClick={() => handleSelectPlan(PLANS[1])}
                  disabled={loadingPlan === "pro_monthly"}
                  className="h-11 px-6 rounded-md font-semibold shadow-[0_10px_30px_-12px_hsl(var(--primary)/0.6)] hover:shadow-[0_14px_36px_-12px_hsl(var(--primary)/0.7)] transition-all hover:-translate-y-0.5"
                >
                  {loadingPlan === "pro_monthly" ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Crown className="mr-2 h-4 w-4" />
                  )}
                  Try Pro
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate("/auth")}
                  className="h-11 px-6 rounded-md font-medium"
                >
                  Continue free
                </Button>
              </div>

              {/* billing toggle */}
              <div className="mt-9 inline-flex items-center rounded-full border border-border/70 bg-card/60 p-1 backdrop-blur">
                <button
                  type="button"
                  onClick={() => setCycle("monthly")}
                  className={cn(
                    "relative h-9 px-5 rounded-full text-sm font-medium transition-all",
                    cycle === "monthly"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  aria-pressed={cycle === "monthly"}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setCycle("yearly")}
                  className={cn(
                    "relative h-9 px-5 rounded-full text-sm font-medium transition-all flex items-center gap-2",
                    cycle === "yearly"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  aria-pressed={cycle === "yearly"}
                >
                  Yearly
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                      cycle === "yearly"
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-primary/15 text-primary",
                    )}
                  >
                    Save 33%
                  </span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* PLAN CARDS */}
        <section className="container mx-auto px-4 pb-16 sm:pb-24 max-w-6xl">
          <div className="grid gap-5 sm:gap-6 md:grid-cols-2 items-stretch">
            {/* Always render Free + the selected Pro plan */}
            {visiblePlans.map((plan) => {
              const Icon = plan.icon;
              const isPro = plan.id !== "free";
              return (
                <Card
                  key={plan.id}
                  className={cn(
                    "group relative flex flex-col overflow-hidden rounded-2xl border bg-card/80 backdrop-blur transition-all duration-300",
                    "hover:-translate-y-1 hover:shadow-2xl",
                    isPro
                      ? "border-primary/50 shadow-[0_0_0_1px_hsl(var(--primary)/0.25),0_20px_60px_-30px_hsl(var(--primary)/0.5)]"
                      : "border-border/70",
                  )}
                >
                  {isPro && (
                    <div
                      className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary to-transparent"
                      aria-hidden
                    />
                  )}

                  {plan.badge && (
                    <div className="absolute right-4 top-4 z-10">
                      <Badge className="gap-1 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground border-0 shadow-md">
                        <Star className="h-3 w-3 fill-current" />
                        {plan.badge}
                      </Badge>
                    </div>
                  )}

                  <div className="p-6 sm:p-7">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-xl",
                          isPro
                            ? "bg-gradient-to-br from-primary/20 to-accent/20 text-primary"
                            : "bg-muted text-foreground/80",
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold tracking-tight">{plan.name}</h3>
                        <p className="text-xs text-muted-foreground">{plan.tagline}</p>
                      </div>
                    </div>

                    <div className="mt-6 flex items-end gap-1.5">
                      <span className="text-4xl sm:text-5xl font-bold tracking-tight">{plan.price}</span>
                      <span className="mb-1.5 text-sm text-muted-foreground">{plan.cadence}</span>
                    </div>
                    {plan.highlight && (
                      <div className="mt-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                          <Zap className="h-3 w-3" />
                          {plan.highlight}
                        </span>
                      </div>
                    )}

                    <Button
                      onClick={() => handleSelectPlan(plan)}
                      size="lg"
                      variant={isPro ? "default" : "outline"}
                      disabled={loadingPlan === plan.id}
                      className={cn(
                        "mt-6 w-full h-11 rounded-md font-semibold transition-all",
                        isPro &&
                          "shadow-[0_10px_30px_-12px_hsl(var(--primary)/0.6)] hover:shadow-[0_14px_36px_-12px_hsl(var(--primary)/0.7)] hover:-translate-y-0.5",
                      )}
                    >
                      {loadingPlan === plan.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Redirecting…
                        </>
                      ) : userIsPro && currentPlan === plan.id ? (
                        "Manage subscription"
                      ) : (
                        plan.cta
                      )}
                    </Button>

                    <ul className="mt-6 space-y-3">
                      {plan.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm">
                          {f.included ? (
                            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                              <Check className="h-3 w-3" strokeWidth={3} />
                            </span>
                          ) : (
                            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                              <X className="h-3 w-3" />
                            </span>
                          )}
                          <span className={cn(f.included ? "text-foreground/90" : "text-muted-foreground line-through")}>
                            {f.label}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>
              );
            })}
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Prices shown in USD. Cancel anytime. Pro features unlock instantly after upgrade.
          </p>
        </section>

        {/* COMPARISON TABLE */}
        <section className="container mx-auto px-4 pb-16 sm:pb-24 max-w-6xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
              Compare every plan
            </h2>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
              See exactly what's included so you can pick the plan that fits how you study.
            </p>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card/60 backdrop-blur overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/70 bg-muted/40">
                    <th className="text-left font-medium text-muted-foreground px-4 sm:px-6 py-4 w-[42%]">
                      Features
                    </th>
                    {allPlans.map((p) => (
                      <th key={p.id} className="text-center px-3 sm:px-4 py-4 font-semibold">
                        <div className="flex flex-col items-center gap-1">
                          <span>
                            {p.id === "free"
                              ? "Free"
                              : p.id === "pro_monthly"
                                ? "Pro Monthly"
                                : "Pro Yearly"}
                          </span>
                          <span className="text-xs font-normal text-muted-foreground">
                            {p.price}
                            {p.cadence}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map((row, i) => (
                    <tr
                      key={i}
                      className={cn(
                        "border-b border-border/40 last:border-0 transition-colors hover:bg-muted/20",
                      )}
                    >
                      <td className="px-4 sm:px-6 py-3.5 font-medium text-foreground/90">{row.label}</td>
                      {[row.free, row.monthly, row.yearly].map((val, j) => (
                        <td key={j} className="text-center px-3 sm:px-4 py-3.5">
                          {typeof val === "boolean" ? (
                            val ? (
                              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-primary">
                                <Check className="h-3.5 w-3.5" strokeWidth={3} />
                              </span>
                            ) : (
                              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground">
                                <X className="h-3.5 w-3.5" />
                              </span>
                            )
                          ) : (
                            <span className="text-foreground/80">{val}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* TRUST / BENEFITS */}
        <section className="container mx-auto px-4 pb-16 sm:pb-24 max-w-6xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
              Built to help students actually succeed
            </h2>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
              Every feature on StudyHub™ is designed around real student workflows — not corporate dashboards.
            </p>
          </div>

          <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {TRUST_POINTS.map((t) => {
              const Icon = t.icon;
              return (
                <Card
                  key={t.title}
                  className="group rounded-2xl border-border/70 bg-card/70 backdrop-blur p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 text-primary mb-4 transition-transform group-hover:scale-110">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-semibold">{t.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{t.body}</p>
                </Card>
              );
            })}
          </div>
        </section>

        {/* FAQ */}
        <section className="container mx-auto px-4 pb-20 sm:pb-28 max-w-3xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
              Frequently asked questions
            </h2>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground">
              Everything you need to know before upgrading.
            </p>
          </div>

          <Card className="rounded-2xl border-border/70 bg-card/70 backdrop-blur p-2 sm:p-4">
            <Accordion type="single" collapsible className="w-full">
              {FAQ_ITEMS.map((item, i) => (
                <AccordionItem key={i} value={`item-${i}`} className="border-border/50">
                  <AccordionTrigger className="text-left text-sm sm:text-base font-medium hover:no-underline px-2 sm:px-3">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed px-2 sm:px-3">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>

          {/* Final CTA */}
          <div className="mt-12 relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card/60 to-accent/10 p-8 sm:p-10 text-center">
            <div className="absolute -inset-1 -z-10 opacity-40 blur-3xl bg-gradient-to-r from-primary/30 to-accent/30" />
            <Palette className="mx-auto mb-3 h-7 w-7 text-primary" />
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
              Ready to study smarter?
            </h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
              Join thousands of students already leveling up with StudyHub™ Pro.
            </p>
            <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                size="lg"
                onClick={() => handleSelectPlan(PLANS[2])}
                className="h-11 px-6 rounded-md font-semibold shadow-[0_10px_30px_-12px_hsl(var(--primary)/0.6)] hover:shadow-[0_14px_36px_-12px_hsl(var(--primary)/0.7)] transition-all hover:-translate-y-0.5"
              >
                <Crown className="mr-2 h-4 w-4" />
                Get Yearly Pro
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/auth")}
                className="h-11 px-6 rounded-md font-medium"
              >
                Start free
              </Button>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default Pricing;

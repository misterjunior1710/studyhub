import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Crown, ArrowRight, Sparkles, Star } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PaymentVerifyingGate from "@/components/PaymentVerifyingGate";

const SuccessPro = () => {
  const [params] = useSearchParams();
  const cycle = params.get("cycle") === "yearly" ? "yearly" : "monthly";
  const priceLabel = cycle === "yearly" ? "$39.99/year" : "$4.99/month";

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  return (
    <>
      <SEOHead
        title="Welcome to StudyHub Pro"
        description="Your StudyHub Pro plan is active. Unlock enhanced Nova AI, advanced study tools, premium themes, and more."
        canonical="https://studyhub.world/success/pro"
        noIndex
      />
      <Navbar />

      <div className="min-h-screen bg-background text-foreground">
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-[-10%] h-[460px] w-[900px] -translate-x-1/2 rounded-full bg-primary/25 blur-[130px] opacity-70" />
            <div className="absolute right-[10%] top-[20%] h-[260px] w-[260px] rounded-full bg-accent/25 blur-[100px] opacity-60" />
          </div>

          <div className="container mx-auto max-w-3xl px-4 pt-20 pb-16 sm:pt-28 sm:pb-24 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/25 to-accent/25 ring-1 ring-primary/40 animate-soft-in">
              <Crown className="h-10 w-10 text-primary" strokeWidth={2.2} />
            </div>

            <Badge className="mb-4 gap-1.5 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground border-0 shadow-md">
              <Star className="h-3 w-3 fill-current" />
              Pro membership active
            </Badge>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[1.1]">
              Welcome to{" "}
              <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
                StudyHub Pro
              </span>
              <span aria-hidden> 🎉</span>
            </h1>

            <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
              Payment confirmed — thank you for upgrading! Your{" "}
              <span className="font-semibold text-foreground">{priceLabel}</span> plan is now
              active. Enjoy advanced productivity tools, enhanced collaboration, expanded
              workspace capabilities, and every premium feature we ship next.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button asChild size="lg" className="h-11 px-6 rounded-md font-semibold shadow-[0_10px_30px_-12px_hsl(var(--primary)/0.6)] hover:shadow-[0_14px_36px_-12px_hsl(var(--primary)/0.7)] hover:-translate-y-0.5 transition-all">
                <Link to="/feed">
                  Start using Pro
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-11 px-6 rounded-md font-medium">
                <Link to="/assistant">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Try enhanced Nova AI
                </Link>
              </Button>
            </div>

            <Card className="mt-12 rounded-2xl border-primary/40 bg-card/80 backdrop-blur p-6 sm:p-8 text-left shadow-[0_0_0_1px_hsl(var(--primary)/0.2),0_20px_60px_-30px_hsl(var(--primary)/0.5)]">
              <h2 className="text-lg font-semibold tracking-tight">Your Pro perks</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2 text-sm text-foreground/90">
                <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-primary shrink-0" /> Enhanced Nova AI Assistant</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-primary shrink-0" /> Advanced flashcards, quizzes & mind maps</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-primary shrink-0" /> Collaborative whiteboards & docs</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-primary shrink-0" /> Premium themes & Pro badge</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-primary shrink-0" /> Priority support</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-primary shrink-0" /> All future Pro features included</li>
              </ul>

              <div className="mt-6 rounded-xl border border-border/60 bg-muted/30 p-4 text-xs text-muted-foreground">
                A receipt has been sent to your email. You can manage or cancel your
                subscription anytime from{" "}
                <Link to="/settings" className="underline hover:text-foreground">Settings</Link>.
                See our{" "}
                <Link to="/refund" className="underline hover:text-foreground">Refund Policy</Link>{" "}
                for details.
              </div>
            </Card>

            <p className="mt-6 text-xs text-muted-foreground">
              Questions? <Link to="/support" className="underline hover:text-foreground">Contact support</Link>
            </p>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default SuccessPro;

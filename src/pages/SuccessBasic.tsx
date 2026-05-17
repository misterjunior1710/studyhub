import { useEffect } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Sparkles, ArrowRight, Crown } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const SuccessBasic = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  return (
    <>
      <SEOHead
        title="Welcome to StudyHub Basic"
        description="Your StudyHub Basic plan is active. Start collaborating, organizing, and studying smarter today."
        canonical="https://studyhub.world/success/basic"
        noIndex
      />
      <Navbar />

      <div className="min-h-screen bg-background text-foreground">
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-[-10%] h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px] opacity-60" />
          </div>

          <div className="container mx-auto max-w-3xl px-4 pt-20 pb-16 sm:pt-28 sm:pb-24 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/15 ring-1 ring-primary/30 animate-soft-in">
              <CheckCircle2 className="h-10 w-10 text-primary" strokeWidth={2.2} />
            </div>

            <Badge
              variant="secondary"
              className="mb-4 gap-1.5 rounded-full border border-border/60 bg-card/70 px-3 py-1 text-xs font-medium backdrop-blur"
            >
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              StudyHub Basic activated
            </Badge>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[1.1]">
              You're all set, welcome to{" "}
              <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
                StudyHub Basic
              </span>
            </h1>

            <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
              Your free plan is active. You now have access to essential StudyHub features —
              group collaboration, academic organization tools, productivity features, and your
              student workspace.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button asChild size="lg" className="h-11 px-6 rounded-md font-semibold">
                <Link to="/feed">
                  Go to your feed
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-11 px-6 rounded-md font-medium">
                <Link to="/study">Open Study Mode</Link>
              </Button>
            </div>

            <Card className="mt-12 rounded-2xl border-border/70 bg-card/80 backdrop-blur p-6 sm:p-8 text-left">
              <h2 className="text-lg font-semibold tracking-tight">What's included</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2 text-sm text-foreground/90">
                <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-primary shrink-0" /> Group collaboration & Study Squads</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-primary shrink-0" /> Academic organization tools</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-primary shrink-0" /> Productivity features (Tasks, Calendar, Pomodoro)</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-primary shrink-0" /> Student workspace access</li>
              </ul>

              <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4">
                <div className="flex items-start gap-3">
                  <Crown className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold">Want more? Try StudyHub Pro</p>
                    <p className="text-xs text-muted-foreground">Enhanced Nova AI, advanced study tools, premium themes & more.</p>
                  </div>
                </div>
                <Button asChild size="sm" className="rounded-md">
                  <Link to="/pricing">See Pro</Link>
                </Button>
              </div>
            </Card>

            <p className="mt-6 text-xs text-muted-foreground">
              Need help? <Link to="/support" className="underline hover:text-foreground">Contact support</Link>
            </p>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default SuccessBasic;

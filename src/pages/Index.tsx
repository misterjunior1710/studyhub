import { memo, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CookieConsent from "@/components/CookieConsent";
import SEOHead, { StructuredData, getOrganizationSchema, getCommunitySchema } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  BookOpen,
  Users,
  Trophy,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  MessageSquare,
  Brain,
  Calendar,
  Bookmark,
  TrendingUp,
  Zap,
  Rss,
} from "lucide-react";
import { lazy, Suspense } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { shouldSkipHeavyVisuals } from "@/lib/networkAware";
const SplineScene = lazy(() => import("@/components/ui/splite").then((m) => ({ default: m.SplineScene })));
const skipHeavy3D = shouldSkipHeavyVisuals();
import { Spotlight } from "@/components/ui/spotlight";
import { HeroGeometric } from "@/components/ui/shape-landing-hero";
import { ReactLenis } from "lenis/react";

import { useAuth } from "@/contexts/AuthContext";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import GamificationDashboard from "@/components/gamification/GamificationDashboard";
import LeaderboardPreview from "@/components/gamification/LeaderboardPreview";
import { TasksWidget } from "@/components/tasks/TasksWidget";

const Index = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { isOnboardingComplete, tasks } = useOnboarding();
  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;
  const showContinueSetup = !!user && !isOnboardingComplete && totalCount > 0;

  const structuredData = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@graph": [getOrganizationSchema(), getCommunitySchema()],
    }),
    [],
  );

  const [featuresRef, featuresVisible] = useScrollReveal<HTMLDivElement>();
  const [stepsRef, stepsVisible] = useScrollReveal<HTMLDivElement>();
  const [ctaRef, ctaVisible] = useScrollReveal<HTMLDivElement>();
  const [quickActionsRef, quickActionsVisible] = useScrollReveal<HTMLDivElement>();
  const [showcaseRef, showcaseVisible] = useScrollReveal<HTMLDivElement>({ threshold: 0.15 });
  const [trustRef, trustVisible] = useScrollReveal<HTMLDivElement>();
  const [aboutRef, aboutVisible] = useScrollReveal<HTMLDivElement>();
  const [testimonialsRef, testimonialsVisible] = useScrollReveal<HTMLDivElement>();

  const handleGetStarted = () => {
    if (user) {
      navigate("/feed");
    } else {
      navigate("/auth");
    }
  };

  // Quick action cards - different for logged in vs logged out users
  const quickActions = user
    ? [
        { icon: TrendingUp, label: "My Feed", href: "/feed", color: "from-primary to-accent" },
        { icon: MessageSquare, label: "Ask a Question", href: "/questions", color: "from-accent to-primary" },
        { icon: Users, label: "Your Groups", href: "/groups", color: "from-info to-primary" },
        { icon: Sparkles, label: "AI Tools", href: "/content-generator", color: "from-warning to-accent" },
        { icon: Brain, label: "Study Tools", href: "/study", color: "from-success to-info" },
        { icon: Calendar, label: "Calendar", href: "/calendar", color: "from-primary to-success" },
      ]
    : [
        { icon: TrendingUp, label: "Browse Feed", href: "/feed", color: "from-primary to-accent" },
        { icon: MessageSquare, label: "Browse Questions", href: "/questions", color: "from-accent to-primary" },
        { icon: Users, label: "Study Groups", href: "/groups", color: "from-info to-primary" },
        { icon: Trophy, label: "Leaderboard", href: "/leaderboard", color: "from-warning to-primary" },
        { icon: Brain, label: "AI Study Tools", href: "/content-generator", color: "from-success to-info" },
        { icon: Sparkles, label: "Nova AI", href: "/assistant", color: "from-warning to-accent" },
        { icon: BookOpen, label: "Study Mode", href: "/study", color: "from-info to-primary" },
        { icon: Bookmark, label: "Saved Posts", href: "/saved", color: "from-accent to-info" },
      ];

  return (
    <ReactLenis root>
      <div className="min-h-screen bg-background flex flex-col">
        <SEOHead
          title="StudyHub — Official Student-Only Discussion Platform"
          description="Official website of StudyHub (https://studyhub.world). StudyHub™, A student-only discussion platform focused on school life, questions, and studying!"
          canonical="https://studyhub.world/"
        />
        <StructuredData data={structuredData} />

        <Navbar />

        {/* Hero Section */}
        <header className="relative">
          <HeroGeometric
            badge="StudyHub™"
            title1="Study Smarter"
            title2="Ace Everything."
            description="Ask questions, share answers, and learn together. A student-powered academic community — with study tools built in."
          >
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                size="lg"
                onClick={() => navigate(user ? "/questions" : "/auth")}
                className="gap-2 text-base px-8 py-6 btn-bounce hover-glow"
              >
                <MessageSquare className="h-4 w-4" />
                {user ? "Ask your question" : "Ask your first question"}
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/questions")}
                className="gap-2 text-base px-8 py-6 btn-bounce"
              >
                See questions getting answered
              </Button>
            </div>
            <p className="mt-5 text-center text-sm text-muted-foreground">
              Get your homework questions answered in minutes — by real students, for free.
            </p>
          </HeroGeometric>
        </header>

        {/* Continue Setup banner — logged-in users with incomplete onboarding */}
        {showContinueSetup && (
          <section className="container mx-auto px-4 max-w-5xl pt-6 -mt-4 relative z-10">
            <button
              type="button"
              onClick={() => navigate("/profile-onboarding")}
              className="w-full text-left rounded-xl border border-primary/30 bg-gradient-to-r from-primary/10 to-accent/10 p-4 flex items-center gap-3 hover:border-primary/50 transition-colors"
              aria-label={`Continue setup, ${completedCount} of ${totalCount} steps complete`}
            >
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm sm:text-base">Finish setting up your account</p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {completedCount} of {totalCount} steps complete — keep going to unlock everything.
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-primary flex-shrink-0" aria-hidden="true" />
            </button>
          </section>
        )}

        {/* Gamification Dashboard - logged-in users only */}
        {user && (
          <section className="container mx-auto px-4 max-w-5xl pt-6 -mt-4 relative z-10 space-y-4">
            <GamificationDashboard />
            <TasksWidget />
            <LeaderboardPreview />
          </section>
        )}

        {/* Quick Actions Section */}
        <section ref={quickActionsRef} className="py-8 sm:py-12 -mt-8 relative z-10">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
              {quickActions.map((action, index) => (
                <Card
                  key={action.label}
                  className={`card-interactive border-border/50 overflow-hidden group w-[calc(50%-0.375rem)] sm:w-[calc(33.333%-0.667rem)] lg:w-[calc(16.666%-0.834rem)] ${quickActionsVisible ? "opacity-0 animate-stagger-in" : "opacity-0"}`}
                  style={{ animationDelay: `${index * 60}ms` }}
                  onClick={() => navigate(action.href)}
                >
                  <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                    <div
                      className={`w-10 h-10 rounded-full bg-gradient-to-br ${action.color} flex items-center justify-center transition-transform duration-200 group-hover:scale-110`}
                    >
                      <action.icon className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-sm font-medium">{action.label}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Interactive 3D Showcase */}
        <section ref={showcaseRef} className="py-16 sm:py-24">
          <div className="container mx-auto px-4 max-w-6xl">
            <Card
              className={`w-full h-[500px] bg-black/[0.96] relative overflow-hidden border-border/50 transition-all duration-500 ease-out hover:shadow-2xl hover:-translate-y-1 ${showcaseVisible ? "animate-soft-in" : "opacity-0"}`}
            >
              <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="hsl(var(--primary))" />
              <div className="flex flex-col md:flex-row h-full">
                <div className="flex-1 p-8 sm:p-10 relative z-10 flex flex-col justify-center">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                    Stuck on a question? Post it.
                  </h2>
                  <p className="mt-4 text-white/70 max-w-md text-sm sm:text-base">
                    Snap a photo, type it out, or paste the problem. Students from your grade jump in with worked-out answers — usually within minutes.
                  </p>
                  <div className="mt-6">
                    <Button onClick={() => navigate(user ? "/questions" : "/auth")} className="gap-2 btn-bounce hover-glow">
                      <MessageSquare className="h-4 w-4" />
                      {user ? "Post a question" : "Ask your first question"}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="hidden md:block flex-1 relative min-h-[280px]">
                  {!isMobile && !skipHeavy3D && (
                    <Suspense fallback={<div className="w-full h-full" aria-hidden />}>
                      <SplineScene
                        scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                        className="w-full h-full"
                      />
                    </Suspense>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Trust Section */}
        <section ref={trustRef} className="border-y border-border bg-muted/30">
          <div className="container mx-auto px-4 py-8 sm:py-12">
            <p
              className={`text-center text-muted-foreground text-sm sm:text-base ${trustVisible ? "animate-soft-in" : "opacity-0"}`}
            >
              Most homework questions get a first answer in under 10 minutes — from students across 16+ countries 🌍
            </p>
          </div>
        </section>

        {/* What is StudyHub Section */}
        <section ref={featuresRef} className="py-16 sm:py-24">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center mb-12">
              <h2
                className={`text-2xl sm:text-3xl font-bold mb-4 ${featuresVisible ? "opacity-0 animate-hero-fade-up" : "opacity-0"}`}
              >
                What's StudyHub?
              </h2>
              <p
                className={`text-muted-foreground max-w-2xl mx-auto ${featuresVisible ? "opacity-0 animate-hero-fade-up" : "opacity-0"}`}
                style={{ animationDelay: "100ms" }}
              >
                Think of it as your study buddy that never sleeps. No distractions, no nonsense — just students helping
                students crush their goals.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: MessageSquare,
                  title: "Ask & Answer",
                  description:
                    "Stuck on homework? Post your question and get answers from students worldwide — usually within minutes.",
                },
                {
                  icon: Rss,
                  title: "Live Study Feed",
                  description:
                    "Scroll through discussions, notes, and exam prep from your grade and subjects. The smartest feed in studying.",
                },
                {
                  icon: Users,
                  title: "Study Squads",
                  description: "Team up in groups for real-time discussions, group study sessions, and exam prep.",
                },
                {
                  icon: BookOpen,
                  title: "Share Knowledge",
                  description:
                    "Drop your notes, summaries, and study guides. Help classmates and build your reputation.",
                },
                {
                  icon: Brain,
                  title: "Smart Study Tools",
                  description:
                    "Flashcards, AI summaries, mind maps, and quizzes — all powered by the community's best content.",
                },
                {
                  icon: Trophy,
                  title: "Earn & Level Up",
                  description: "Build streaks, earn XP, and climb the leaderboard — consistency is the real flex. 😏",
                },
              ].map((feature, index) => (
                <div
                  key={feature.title}
                  className={`p-6 rounded-xl bg-card border border-border hover-lift ${featuresVisible ? "opacity-0 animate-reveal-up" : "opacity-0"}`}
                  style={{ animationDelay: `${200 + index * 100}ms` }}
                >
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section ref={stepsRef} className="py-16 sm:py-24 bg-muted/30">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="text-center mb-12">
              <h2
                className={`text-2xl sm:text-3xl font-bold mb-4 ${stepsVisible ? "opacity-0 animate-hero-fade-up" : "opacity-0"}`}
              >
                How It Works
              </h2>
            </div>

            <div className="space-y-6">
              {[
                { step: "1", text: "Sign up (takes 30 seconds) and pick your grade, subjects, and goals" },
                { step: "2", text: "Ask doubts or scroll through questions from students worldwide" },
                { step: "3", text: "Help others out, rack up points, and level up together 🚀" },
              ].map((item, index) => (
                <div
                  key={item.step}
                  className={`flex items-start gap-4 ${stepsVisible ? "opacity-0 animate-reveal-up" : "opacity-0"}`}
                  style={{ animationDelay: `${100 + index * 100}ms` }}
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center transition-transform duration-200 hover:scale-110">
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  </div>
                  <div className="pt-2">
                    <p className="text-foreground">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        {/* Testimonials Section */}
        <section ref={testimonialsRef} className="py-16 sm:py-24">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center mb-12">
              <h2
                className={`text-2xl sm:text-3xl font-bold mb-4 ${testimonialsVisible ? "opacity-0 animate-hero-fade-up" : "opacity-0"}`}
              >
                What Students Say
              </h2>
              <p
                className={`text-muted-foreground max-w-2xl mx-auto ${testimonialsVisible ? "opacity-0 animate-hero-fade-up" : "opacity-0"}`}
                style={{ animationDelay: "100ms" }}
              >
                Don't just take our word for it — hear from the students already using StudyHub.
              </p>
            </div>
            <div
              className={`flex justify-center ${testimonialsVisible ? "opacity-0 animate-reveal-up" : "opacity-0"}`}
              style={{ animationDelay: "200ms" }}
            >
              <div className="bg-card border border-border rounded-xl p-8 max-w-xl w-full relative hover-lift">
                <div
                  className="text-6xl leading-none text-primary/20 font-serif absolute top-4 left-6 select-none"
                  aria-hidden="true"
                >
                  &ldquo;
                </div>
                <blockquote className="mt-5 text-sm sm:text-base text-foreground leading-relaxed italic">
                  The StudyHub site has completely transformed the way I learn history. For instance, the flashcards on
                  the site have made my history board exams easier to prepare for. Additionally, what I really like
                  about StudyHub is that it allows customization such that I can make use of the application as per my
                  requirements. In terms of efficiency, StudyHub is Really Good – there are absolutely no lags at all.
                  If you are a beginner, then StudyHub is definitely for you!
                </blockquote>
                <div className="mt-6 pt-5 border-t border-border flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-accent/20 flex items-center justify-center font-semibold text-primary text-sm flex-shrink-0">
                    R
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Rachel</p>
                    <p className="text-xs text-muted-foreground">Undergraduate, 1st Year </p>
                  </div>
                  <div className="ml-auto flex gap-0.5" aria-label="5 out of 5 stars">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className="h-4 w-4 text-yellow-500 fill-yellow-500"
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Transparency / About Section — required for Google OAuth verification */}
        <section ref={aboutRef} id="about" className="py-12 sm:py-16 bg-muted/20 border-y border-border">
          <div
            className={`container mx-auto px-4 max-w-3xl space-y-6 ${aboutVisible ? "animate-soft-in" : "opacity-0"}`}
          >
            <div className="text-center space-y-3">
              <h2 className="text-2xl sm:text-3xl font-bold">About StudyHub</h2>
              <p className="text-muted-foreground">
                This is the <strong>official website of StudyHub™</strong> (
                <a href="https://studyhub.world" className="underline hover:text-primary">
                  https://studyhub.world
                </a>
                ) — a student-only discussion platform for school life, questions, study notes, AI study tools,
                flashcards, group chats, and exam prep. Built and maintained by the StudyHub Team.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card/60 p-5 sm:p-6 text-left space-y-3">
              <h3 className="font-semibold text-lg">Why we ask for your Google account info</h3>
              <p className="text-sm text-muted-foreground">
                When you choose <strong>Sign in with Google</strong>, StudyHub requests only the basic profile
                information Google provides by default:
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>
                  <strong>Email address</strong> — to create and identify your StudyHub account and send essential
                  service notifications.
                </li>
                <li>
                  <strong>Name and profile picture</strong> — to personalize your profile so classmates can recognize
                  you in discussions and study groups.
                </li>
                <li>
                  <strong>Google account ID (OpenID)</strong> — to securely sign you in on future visits without needing
                  a separate password.
                </li>
              </ul>
              <p className="text-sm text-muted-foreground">
                We do <strong>not</strong> read your Gmail, contacts, Drive, or any other Google data. We do not sell
                your information. You can revoke access at any time from your{" "}
                <a
                  href="https://myaccount.google.com/permissions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-primary"
                >
                  Google Account permissions page
                </a>{" "}
                or by deleting your StudyHub account in Settings.
              </p>
              <p className="text-sm text-muted-foreground">
                Full details are in our{" "}
                <a href="/privacy" className="underline hover:text-primary font-medium">
                  Privacy Policy
                </a>{" "}
                and{" "}
                <a href="/terms" className="underline hover:text-primary font-medium">
                  Terms &amp; Conditions
                </a>
                . Questions? Contact{" "}
                <a href="mailto:studyhub.community.web@gmail.com" className="underline hover:text-primary">
                  studyhub.community.web@gmail.com
                </a>
                .
              </p>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section ref={ctaRef} className="py-16 sm:py-24">
          <div className="container mx-auto px-4 text-center">
            <div
              className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 mb-6 animate-float ${ctaVisible ? "opacity-0 animate-reveal-up" : "opacity-0"}`}
            >
              <Sparkles className="h-8 w-8 text-primary" />
            </div>

            <h2
              className={`text-2xl sm:text-3xl font-bold mb-4 ${ctaVisible ? "opacity-0 animate-reveal-up" : "opacity-0"}`}
              style={{ animationDelay: "100ms" }}
            >
              Ready to stop stressing and start studying?
            </h2>

            <p
              className={`text-muted-foreground mb-8 max-w-md mx-auto ${ctaVisible ? "opacity-0 animate-reveal-up" : "opacity-0"}`}
              style={{ animationDelay: "150ms" }}
            >
              Thousands of students are already here helping each other out. Your turn.
            </p>

            <div
              className={`flex flex-col sm:flex-row gap-3 justify-center ${ctaVisible ? "opacity-0 animate-reveal-up" : "opacity-0"}`}
              style={{ animationDelay: "200ms" }}
            >
              <Button size="lg" onClick={handleGetStarted} className="gap-2 btn-bounce hover-glow">
                {user ? "Back to Feed" : "Join StudyHub — Free Forever"}
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="ghost" onClick={() => navigate("/content-generator")} className="gap-2">
                <Brain className="h-4 w-4" />
                Try AI Study Tools
              </Button>
            </div>
          </div>
        </section>

        <Footer />
        <CookieConsent />
      </div>
    </ReactLenis>
  );
};

export default memo(Index);

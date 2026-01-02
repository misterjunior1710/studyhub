import { memo, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CookieConsent from "@/components/CookieConsent";
import SEOHead, { StructuredData, getOrganizationSchema, getCommunitySchema } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  BookOpen, Users, Trophy, Sparkles, ArrowRight, CheckCircle2, 
  MessageSquare, Brain, Calendar, Bookmark, TrendingUp, Zap
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useParallax } from "@/hooks/useParallax";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const parallaxOffset = useParallax(0.3, 80);

  const structuredData = useMemo(() => ({
    "@context": "https://schema.org",
    "@graph": [getOrganizationSchema(), getCommunitySchema()],
  }), []);

  const [featuresRef, featuresVisible] = useScrollReveal<HTMLDivElement>();
  const [stepsRef, stepsVisible] = useScrollReveal<HTMLDivElement>();
  const [ctaRef, ctaVisible] = useScrollReveal<HTMLDivElement>();
  const [quickActionsRef, quickActionsVisible] = useScrollReveal<HTMLDivElement>();

  const handleGetStarted = () => {
    if (user) {
      navigate("/feed");
    } else {
      navigate("/auth");
    }
  };

  // Quick action cards - different for logged in vs logged out users
  const quickActions = user ? [
    { icon: MessageSquare, label: "Ask a Question", href: "/questions", color: "from-primary to-accent" },
    { icon: Users, label: "Your Groups", href: "/groups", color: "from-accent to-primary" },
    { icon: Bookmark, label: "Saved Posts", href: "/saved", color: "from-info to-primary" },
    { icon: Brain, label: "Study Mode", href: "/study", color: "from-success to-info" },
    { icon: Calendar, label: "Calendar", href: "/calendar", color: "from-warning to-destructive" },
    { icon: TrendingUp, label: "Leaderboard", href: "/leaderboard", color: "from-primary to-success" },
  ] : [
    { icon: MessageSquare, label: "Browse Questions", href: "/questions", color: "from-primary to-accent" },
    { icon: Users, label: "Study Groups", href: "/groups", color: "from-accent to-primary" },
    { icon: Brain, label: "AI Study Tools", href: "/content-generator", color: "from-success to-info" },
    { icon: TrendingUp, label: "Leaderboard", href: "/leaderboard", color: "from-primary to-success" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title="StudyHub - Free Online Student Community for Homework Help & Study Groups"
        description="Join StudyHub, the free global student community. Ask homework questions, get answers from peers worldwide, join study groups, use AI study tools, and track your progress on leaderboards. Study Smarter, Win Harder."
        canonical="https://studyhub.world/"
      />
      <StructuredData data={structuredData} />
      
      <Navbar />
      
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        {/* Soft gradient background with parallax */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-primary/8 via-accent/5 to-background"
          style={{ transform: `translateY(${parallaxOffset}px)` }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.1),transparent_50%)]" />
        
        <div className="relative container mx-auto px-4 py-16 sm:py-24 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight opacity-0 animate-hero-fade-up">
              Study Smarter,{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Win Harder
              </span>
            </h1>
            
            <p className="text-muted-foreground text-base sm:text-lg md:text-xl mb-8 max-w-2xl mx-auto opacity-0 animate-hero-fade-up" style={{ animationDelay: "100ms" }}>
              A calm space for students to connect, share knowledge, and help each other succeed. 
              Join a global community focused on learning together.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center opacity-0 animate-hero-fade-up" style={{ animationDelay: "200ms" }}>
              <Button 
                size="lg" 
                onClick={handleGetStarted}
                className="gap-2 text-base px-8 py-6 btn-bounce hover-glow"
              >
                {user ? "Go to Feed" : "Get Started"}
                <ArrowRight className="h-4 w-4" />
              </Button>
              {!user && (
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => navigate("/questions")}
                  className="gap-2 text-base px-8 py-6 btn-bounce"
                >
                  <Zap className="h-4 w-4" />
                  Explore First
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Quick Actions Section */}
      <section ref={quickActionsRef} className="py-8 sm:py-12 -mt-8 relative z-10">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-${user ? '6' : '4'} gap-3 sm:gap-4`}>
            {quickActions.map((action, index) => (
              <Card
                key={action.label}
                className={`card-interactive border-border/50 overflow-hidden group ${quickActionsVisible ? "opacity-0 animate-stagger-in" : "opacity-0"}`}
                style={{ animationDelay: `${index * 60}ms` }}
                onClick={() => navigate(action.href)}
              >
                <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${action.color} flex items-center justify-center transition-transform duration-200 group-hover:scale-110`}>
                    <action.icon className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-sm font-medium">{action.label}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="border-y border-border bg-muted/30">
        <div className="container mx-auto px-4 py-8 sm:py-12">
          <p className="text-center text-muted-foreground text-sm sm:text-base">
            Trusted by students from around the world
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
              What is StudyHub?
            </h2>
            <p 
              className={`text-muted-foreground max-w-2xl mx-auto ${featuresVisible ? "opacity-0 animate-hero-fade-up" : "opacity-0"}`}
              style={{ animationDelay: "100ms" }}
            >
              A platform designed for focused learning and genuine peer support. 
              No distractions, just students helping students.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: BookOpen,
                title: "Share Knowledge",
                description: "Post questions, share study materials, and learn from peers across all subjects."
              },
              {
                icon: Users,
                title: "Study Groups",
                description: "Join or create groups for collaborative learning and real-time discussions."
              },
              {
                icon: Trophy,
                title: "Stay Motivated",
                description: "Track your progress, earn points, and maintain study streaks."
              }
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
              { step: "1", text: "Sign up and set your grade, subjects, and learning goals" },
              { step: "2", text: "Ask questions or browse posts from students worldwide" },
              { step: "3", text: "Help others, earn points, and grow together" }
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
            Ready to start learning?
          </h2>
          
          <p 
            className={`text-muted-foreground mb-8 max-w-md mx-auto ${ctaVisible ? "opacity-0 animate-reveal-up" : "opacity-0"}`}
            style={{ animationDelay: "150ms" }}
          >
            Join thousands of students who are already helping each other succeed.
          </p>
          
          <div 
            className={`flex flex-col sm:flex-row gap-3 justify-center ${ctaVisible ? "opacity-0 animate-reveal-up" : "opacity-0"}`}
            style={{ animationDelay: "200ms" }}
          >
            <Button 
              size="lg" 
              onClick={handleGetStarted}
              className="gap-2 btn-bounce hover-glow"
            >
              {user ? "Browse Feed" : "Join StudyHub"}
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button 
              size="lg" 
              variant="ghost"
              onClick={() => navigate("/content-generator")}
              className="gap-2"
            >
              <Brain className="h-4 w-4" />
              Try AI Study Tools
            </Button>
          </div>
        </div>
      </section>

      <Footer />
      <CookieConsent />
    </div>
  );
};

export default memo(Index);

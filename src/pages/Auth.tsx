import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";
import { z } from "zod";
import AgeVerificationDialog from "@/components/AgeVerificationDialog";
import EmailVerificationDialog from "@/components/EmailVerificationDialog";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";

// List of allowed email domains (popular providers + educational)
const allowedDomains = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "live.com", "icloud.com", "protonmail.com", "aol.com", "mail.com", "zoho.com", "edu", "ac.in", "edu.in", "ac.uk", "edu.au", "edu.sg"];
const isValidEmailDomain = (email: string): boolean => {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return false;

  // Check if domain matches any allowed domain or ends with educational TLDs
  return allowedDomains.some(allowed => domain === allowed || domain.endsWith(`.${allowed}`));
};
const emailSchema = z.string().email("That email doesn't look right — double-check it!").refine(isValidEmailDomain, {
  message: "Use a real email (Gmail, Yahoo, Outlook, school email, etc.) — we need to verify it!"
});
const passwordSchema = z.string().min(6, "Your password needs at least 6 characters — make it strong!").max(72, "Whoa, that's too long! Keep it under 72 characters");
const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendEmail, setResendEmail] = useState("");
  const [showResendForm, setShowResendForm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [country, setCountry] = useState("");
  const [grade, setGrade] = useState("");
  const [stream, setStream] = useState("");
  const [showAgeVerification, setShowAgeVerification] = useState(false);
  const [pendingAdultGrade, setPendingAdultGrade] = useState("");
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [activeTab, setActiveTab] = useState("login");
  const tabsRef = useRef<HTMLDivElement>(null);
  const countries = ["United States", "United Kingdom", "India", "Canada", "Australia", "Germany", "France", "Spain", "Italy", "Netherlands", "Sweden", "Poland", "Switzerland", "Belgium", "Austria", "Other"];
  const isAdult = grade === "Adult (18+)" || grade === "Working Professional";
  const grades = ["Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12", "Undergraduate", "Postgraduate", "Adult (18+)", "Working Professional"];
  const streams = isAdult ? ["Not Applicable", "Self-Learning", "Professional Development", "Other"] : ["CBSE", "IGCSE", "IB", "AP", "A-Levels", "GCSE", "State Board", "Cambridge", "Edexcel", "German Abitur", "French Baccalauréat", "Dutch VWO", "Other"];
  const handleGradeChange = (value: string) => {
    const isNewAdult = value === "Adult (18+)" || value === "Working Professional";
    const wasAdult = grade === "Adult (18+)" || grade === "Working Professional";
    if (isNewAdult && !wasAdult) {
      setPendingAdultGrade(value);
      setShowAgeVerification(true);
    } else {
      if (wasAdult !== isNewAdult) setStream("");
      setGrade(value);
    }
  };
  const handleAgeVerificationConfirm = () => {
    setGrade(pendingAdultGrade);
    setStream("");
    setShowAgeVerification(false);
    setPendingAdultGrade("");
  };
  const handleAgeVerificationCancel = () => {
    setShowAgeVerification(false);
    setPendingAdultGrade("");
  };
  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({
      data: {
        session
      }
    }) => {
      if (session) {
        navigate("/");
      }
    });
  }, [navigate]);
  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!country || !grade || !stream) {
      toast.error("You're so close! Just fill in all the fields to continue.");
      return;
    }

    // Validate email
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      toast.error(emailResult.error.errors[0].message);
      return;
    }

    // Validate password
    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      toast.error(passwordResult.error.errors[0].message);
      return;
    }
    setLoading(true);
    try {
      const {
        error
      } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            username,
            country,
            grade,
            stream
          }
        }
      });
      if (error) throw error;
      setVerificationEmail(email);
      setShowEmailVerification(true);
      setEmail("");
      setPassword("");
      setUsername("");
      setCountry("");
      setGrade("");
      setStream("");
    } catch (error: any) {
      toast.error(error.message || "Oops — something went wrong. Give it another try!");
    } finally {
      setLoading(false);
    }
  };
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate Turnstile token
    const turnstileToken = document.querySelector<HTMLInputElement>('[name="cf-turnstile-response"]')?.value;
    if (!turnstileToken) {
      toast.error("Hold up — complete the CAPTCHA first so we know you're human! 🤖");
      return;
    }

    // Validate email format
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      toast.error(emailResult.error.errors[0].message);
      return;
    }
    setLoading(true);
    try {
      const {
        error
      } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      toast.success("You're back! Time to hit the books 📚");
      navigate("/");
    } catch (error: any) {
      if (error.message?.includes("Email not confirmed")) {
        toast.error("You haven't verified your email yet! Check your inbox for the confirmation link.");
      } else {
        toast.error(error.message || "Wrong email or password — try again!");
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleResendVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailResult = emailSchema.safeParse(resendEmail);
    if (!emailResult.success) {
      toast.error(emailResult.error.errors[0].message);
      return;
    }
    
    setResendLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: resendEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });
      if (error) throw error;
      toast.success("Email sent! Check your inbox — and peek in spam just in case 👀");
      setResendEmail("");
      setShowResendForm(false);
    } catch (error: any) {
      toast.error(error.message || "Hmm, that didn't work. Wait a sec and try again.");
    } finally {
      setResendLoading(false);
    }
  };
  
  const handleGoogleSignIn = async () => {
    try {
      const {
        error
      } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || "Google sign-in hit a snag. Try again?");
    }
  };
  return <main className="min-h-screen flex flex-col">
      <SEOHead
        title="Sign Up Free | Student Login | StudyHub"
        description="Join thousands of students. Sign up free, ask questions, join study groups, and ace your exams. No credit card needed — ever."
        canonical="https://studyhub.world/auth"
      />
      
      {/* SEO Content Section */}
      <header className="sr-only">
        <h1>Sign In to StudyHub — Your Study Crew Awaits</h1>
        <p>
          Join StudyHub — the place where students help students ace their exams. 
          Create your free account or sign in to ask questions, join study squads, 
          earn XP, and connect with learners worldwide. From Grade 6 to postgrad, 
          we've got your back.
        </p>
      </header>
      
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-accent/20 p-4">
        <article className="w-full max-w-md">
          <Card className="animate-fade-in shadow-xl border-primary/10">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-2">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center animate-bounce-soft">
                  <Sparkles className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                StudyHub
              </CardTitle>
              <CardDescription>Your study crew is waiting — let's go 📚</CardDescription>
            </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full" ref={tabsRef}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Log In</TabsTrigger>
                <TabsTrigger value="signup">Join Free</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleEmailSignIn} className="space-y-4">
                <div className="space-y-2">
                   <Label htmlFor="login-email">Email</Label>
                  <Input id="login-email" type="email" placeholder="you@school.edu" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input id="login-password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                </div>
                <div className="cf-turnstile" data-sitekey="0x4AAAAAACiGuBHNKghgkkXH"></div>
                <Button type="submit" className="w-full btn-bounce" disabled={loading}>
                   {loading ? <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging you in...
                    </> : "Log In & Study"}
                </Button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                     <span className="bg-card px-2 text-muted-foreground">or use</span>
                  </div>
                </div>

                <Button 
                  type="button"
                  variant="outline" 
                  className="w-full gap-2 btn-bounce" 
                  onClick={handleGoogleSignIn}
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </Button>
              </form>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">or</span>
                </div>
              </div>

              {!showResendForm ? (
                <Button 
                  variant="ghost" 
                  className="w-full text-sm" 
                  onClick={() => setShowResendForm(true)}
                >
                  Didn't get the verification email? Tap here
                </Button>
              ) : (
                <form onSubmit={handleResendVerification} className="space-y-3 p-3 rounded-lg bg-muted/50 border border-border animate-fade-in">
                   <p className="text-sm text-muted-foreground">
                    Enter your email and we'll fire off another verification link ✉️
                  </p>
                  <Input 
                    type="email" 
                    placeholder="you@example.com" 
                    value={resendEmail} 
                    onChange={e => setResendEmail(e.target.value)} 
                    required 
                  />
                  <div className="flex gap-2">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setShowResendForm(false);
                        setResendEmail("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      size="sm"
                      className="flex-1"
                      disabled={resendLoading}
                    >
                      {resendLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        "Resend Email"
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleEmailSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-username">Username</Label>
                  <Input id="signup-username" type="text" placeholder="studyking99" value={username} onChange={e => setUsername(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input id="signup-email" type="email" placeholder="you@school.edu" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input id="signup-password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-country">Country</Label>
                    <Select value={country} onValueChange={setCountry} required>
                      <SelectTrigger id="signup-country">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map(c => <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-grade">Grade</Label>
                    <Select value={grade} onValueChange={handleGradeChange} required>
                      <SelectTrigger id="signup-grade">
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent>
                        {grades.map(g => <SelectItem key={g} value={g}>
                            {g}
                          </SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-stream">Stream</Label>
                  <Select value={stream} onValueChange={setStream} required>
                    <SelectTrigger id="signup-stream">
                      <SelectValue placeholder="Select stream" />
                    </SelectTrigger>
                    <SelectContent>
                      {streams.map(s => <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" className="w-full btn-bounce" disabled={loading}>
                  {loading ? <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                       Setting you up...
                    </> : "Create Account"}
                </Button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">or jump in with</span>
                  </div>
                </div>

                <Button 
                  type="button"
                  variant="outline" 
                  className="w-full gap-2 btn-bounce" 
                  onClick={handleGoogleSignIn}
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign up with Google
                </Button>
              </form>

              <p className="text-center text-xs text-muted-foreground mt-4">
                By signing up, you agree to our{" "}
                <Link to="/terms" className="text-primary hover:underline">Terms</Link>
                {" "}and{" "}
                <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
        
          {/* Additional SEO content below card */}
          <aside className="mt-6 text-center text-sm text-muted-foreground">
            <p className="mb-3">
              Got questions already? <Link to="/" className="text-primary hover:underline font-medium">Check out what others are asking</Link> or 
              see who's at the <Link to="/leaderboard" className="text-primary hover:underline font-medium">top of the leaderboard</Link>.
            </p>
            <p>
              Stuck? Hit up our <Link to="/support" className="text-primary hover:underline">Support page</Link>.
            </p>
          </aside>
        </article>
      </div>
      <Footer />
      <AgeVerificationDialog open={showAgeVerification} onConfirm={handleAgeVerificationConfirm} onCancel={handleAgeVerificationCancel} />
      <EmailVerificationDialog 
        open={showEmailVerification} 
        email={verificationEmail} 
        onGoToLogin={() => {
          setShowEmailVerification(false);
          setActiveTab("login");
        }} 
      />
    </main>;
};
export default Auth;
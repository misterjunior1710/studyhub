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
const emailSchema = z.string().email("Please enter a valid email address").refine(isValidEmailDomain, {
  message: "Please use a valid email from a known provider (Gmail, Yahoo, Outlook, etc.) or educational institution"
});
const passwordSchema = z.string().min(6, "Password must be at least 6 characters").max(72, "Password must be less than 72 characters");
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
      toast.error("Please fill in all fields");
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
      toast.error(error.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

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
      toast.success("Welcome back!");
      navigate("/");
    } catch (error: any) {
      if (error.message?.includes("Email not confirmed")) {
        toast.error("Please verify your email before signing in. Check your inbox for the verification link.");
      } else {
        toast.error(error.message || "Failed to sign in");
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
      toast.success("Verification email sent! Please check your inbox and spam folder.");
      setResendEmail("");
      setShowResendForm(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to resend verification email");
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
      toast.error(error.message || "Failed to sign in with Google");
    }
  };
  return <div className="min-h-screen flex flex-col">
      <SEOHead
        title="Sign In"
        description="Join StudyHub to connect with students worldwide. Sign in or create an account to ask questions, share knowledge, and join study groups."
        canonical="https://studyhub-studentportal.lovable.app/auth"
      />
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-accent/20 p-4">
        <Card className="w-full max-w-md animate-fade-in shadow-xl border-primary/10">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-2">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center animate-bounce-soft">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              StudyHub
            </CardTitle>
            <CardDescription>Join the study community ✨</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full" ref={tabsRef}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleEmailSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input id="login-email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input id="login-password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </> : "Sign In"}
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
                  variant="outline" 
                  className="w-full" 
                  onClick={() => setShowResendForm(true)}
                >
                  Didn't receive verification email?
                </Button>
              ) : (
                <form onSubmit={handleResendVerification} className="space-y-3 p-3 rounded-lg bg-muted/50 border border-border">
                  <p className="text-sm text-muted-foreground">
                    Enter your email to resend the verification link
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
                  <Input id="signup-username" type="text" placeholder="johndoe" value={username} onChange={e => setUsername(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input id="signup-email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
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

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </> : "Create Account"}
                </Button>
              </form>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  
                </div>
              </div>

              
              
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
    </div>;
};
export default Auth;
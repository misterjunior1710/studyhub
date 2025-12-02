import { useState, useEffect } from "react";
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
import Footer from "@/components/Footer";

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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [country, setCountry] = useState("");
  const [grade, setGrade] = useState("");
  const [stream, setStream] = useState("");
  const [showAgeVerification, setShowAgeVerification] = useState(false);
  const [pendingAdultGrade, setPendingAdultGrade] = useState("");
  
  const countries = ["United States", "United Kingdom", "India", "Canada", "Australia", "Germany", "France", "Spain", "Italy", "Netherlands", "Sweden", "Poland", "Switzerland", "Belgium", "Austria", "Other"];
  
  const isAdult = grade === "Adult (18+)" || grade === "Working Professional";
  const grades = ["Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12", "Undergraduate", "Postgraduate", "Adult (18+)", "Working Professional"];
  const streams = isAdult 
    ? ["Not Applicable", "Self-Learning", "Professional Development", "Other"]
    : ["CBSE", "IGCSE", "IB", "AP", "A-Levels", "GCSE", "State Board", "Cambridge", "Edexcel", "German Abitur", "French Baccalauréat", "Dutch VWO", "Other"];
  
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
      toast.success("Account created! You can now log in.");
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
      toast.error(error.message || "Failed to sign in");
    } finally {
      setLoading(false);
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
  return (
    <div className="min-h-screen flex flex-col">
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
            <Tabs defaultValue="login" className="w-full">
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
                  
                </div>
              </div>

              
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
                  <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <Button type="button" variant="outline" className="w-full" onClick={handleGoogleSignIn}>
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </Button>
              
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
      <AgeVerificationDialog
        open={showAgeVerification}
        onConfirm={handleAgeVerificationConfirm}
        onCancel={handleAgeVerificationCancel}
      />
    </div>
  );
};
export default Auth;
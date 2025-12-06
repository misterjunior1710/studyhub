import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import AgeVerificationDialog from "@/components/AgeVerificationDialog";

const allowedDomains = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "live.com", "icloud.com", "protonmail.com", "aol.com", "mail.com", "zoho.com", "edu", "ac.in", "edu.in", "ac.uk", "edu.au", "edu.sg"];

const isValidEmailDomain = (email: string): boolean => {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return false;
  return allowedDomains.some(allowed => domain === allowed || domain.endsWith(`.${allowed}`));
};

const emailSchema = z.string().email("Please enter a valid email address").refine(isValidEmailDomain, {
  message: "Please use a valid email from a known provider or educational institution"
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
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/");
    });
  }, [navigate]);

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!country || !grade || !stream) {
      toast.error("Please fill in all fields");
      return;
    }

    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      toast.error(emailResult.error.errors[0].message);
      return;
    }

    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      toast.error(passwordResult.error.errors[0].message);
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: { username, country, grade, stream }
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
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      toast.error(emailResult.error.errors[0].message);
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("Welcome back!");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-border">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">S</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground">studyhub</h1>
          <p className="text-muted-foreground text-sm">Join the study community</p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login">Log In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleEmailSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input 
                    id="login-email" 
                    type="email" 
                    placeholder="you@example.com" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input 
                    id="login-password" 
                    type="password" 
                    placeholder="••••••••" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    required 
                  />
                </div>
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Log In"
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleEmailSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-username">Username</Label>
                  <Input 
                    id="signup-username" 
                    type="text" 
                    placeholder="johndoe" 
                    value={username} 
                    onChange={e => setUsername(e.target.value)} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input 
                    id="signup-email" 
                    type="email" 
                    placeholder="you@example.com" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input 
                    id="signup-password" 
                    type="password" 
                    placeholder="••••••••" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    required 
                    minLength={6} 
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="signup-country">Country</Label>
                    <Select value={country} onValueChange={setCountry} required>
                      <SelectTrigger id="signup-country">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-grade">Grade</Label>
                    <Select value={grade} onValueChange={handleGradeChange} required>
                      <SelectTrigger id="signup-grade">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {grades.map(g => (
                          <SelectItem key={g} value={g}>{g}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-stream">Stream/Board</Label>
                  <Select value={stream} onValueChange={setStream} required>
                    <SelectTrigger id="signup-stream">
                      <SelectValue placeholder="Select your stream" />
                    </SelectTrigger>
                    <SelectContent>
                      {streams.map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Sign Up"
                  )}
                </Button>
                
                <p className="text-center text-xs text-muted-foreground">
                  By signing up, you agree to our{" "}
                  <Link to="/terms" className="text-primary hover:underline">Terms</Link>
                  {" "}and{" "}
                  <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <AgeVerificationDialog 
        open={showAgeVerification} 
        onConfirm={handleAgeVerificationConfirm} 
        onCancel={handleAgeVerificationCancel} 
      />
    </div>
  );
};

export default Auth;

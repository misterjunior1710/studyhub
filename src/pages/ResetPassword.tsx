import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import StudyHubLogo from "@/components/StudyHubLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Lock, Mail, CheckCircle } from "lucide-react";
import SEOHead from "@/components/SEOHead";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"request" | "update" | "success">("request");

  // Detect recovery hash in URL
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("type=recovery") || hash.includes("access_token")) {
      setMode("update");

      // Give Supabase time to process the recovery hash, then verify a session was established
      const timer = setTimeout(async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          toast.error("Link expired — request a new one", {
            description: "This reset link is no longer valid. Please request a fresh link below.",
            duration: 6000,
          });
          setMode("request");
        }
      }, 1200);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Enter your email so we can send you a reset link.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success("Check your inbox — we sent you a reset link! 📬");
    } catch (error: any) {
      toast.error(error.message || "Couldn't send reset link. Try again!");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Your password needs at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords don't match — double-check them!");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setMode("success");
      toast.success("Password updated! You're all set. 🔐");
    } catch (error: any) {
      toast.error(error.message || "Couldn't update password. Try again!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col">
      <SEOHead
        title="Reset Password — StudyHub"
        description="Reset your StudyHub password quickly and securely."
        canonical="https://studyhub.world/reset-password"
      />

      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-background">
        <article className="w-full max-w-md">
          <button
            type="button"
            onClick={() => navigate("/auth")}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </button>

          <div className="text-center mb-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/25 to-accent/25 border border-primary/10 mx-auto mb-2">
              <StudyHubLogo className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              StudyHub™
            </h1>
          </div>

          <Card className="animate-fade-in shadow-xl border-primary/10 bg-card/80 backdrop-blur-xl">
            <CardHeader className="text-center">
              {mode === "request" && (
                <>
                  <div className="flex justify-center mb-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold">Reset your password</CardTitle>
                  <CardDescription>
                    Enter your email and we'll send you a link to set a new password.
                  </CardDescription>
                </>
              )}
              {mode === "update" && (
                <>
                  <div className="flex justify-center mb-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Lock className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold">Create a new password</CardTitle>
                  <CardDescription>Choose a strong password to keep your account secure.</CardDescription>
                </>
              )}
              {mode === "success" && (
                <>
                  <div className="flex justify-center mb-3">
                    <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold">Password updated!</CardTitle>
                  <CardDescription>Your password has been reset successfully.</CardDescription>
                </>
              )}
            </CardHeader>
            <CardContent>
              {mode === "request" && (
                <form onSubmit={handleRequestReset} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email">Email</Label>
                    <Input
                      id="reset-email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      placeholder="you@school.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-11"
                    />
                  </div>
                  <Button type="submit" className="w-full btn-bounce" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending link...
                      </>
                    ) : (
                      "Send Reset Link"
                    )}
                  </Button>
                </form>
              )}

              {mode === "update" && (
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      autoComplete="new-password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      autoComplete="new-password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="h-11"
                    />
                  </div>
                  <Button type="submit" className="w-full btn-bounce" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Password"
                    )}
                  </Button>
                </form>
              )}

              {mode === "success" && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground text-center">
                    Your account is now secured with your new password. Ready to dive back in?
                  </p>
                  <Button
                    type="button"
                    className="w-full btn-bounce"
                    onClick={() => navigate("/auth")}
                  >
                    Log In & Study
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </article>
      </div>
    </main>
  );
};

export default ResetPassword;

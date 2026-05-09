import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { COUNTRIES, ALL_GRADES, getStreamsForGrade, isAdultGrade, getSubjectsForGrade } from "@/lib/constants";
import { Checkbox } from "@/components/ui/checkbox";
import { useCountryDetect } from "@/hooks/useCountryDetect";
import { getStreamsForCountry } from "@/lib/countryEducation";
import { Loader2, Sparkles, GraduationCap, ArrowLeft, ArrowRight, Check } from "lucide-react";

const STEP_LABELS = ["About you", "Your studies", "Subjects"];
const TOTAL_STEPS = 3;

const ProfileOnboarding = () => {
  const navigate = useNavigate();
  const { user, session, isLoading: authLoading } = useAuth();

  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState("");
  const [country, setCountry] = useState("");
  const [grade, setGrade] = useState("");
  const [stream, setStream] = useState("");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const { detectedCountry } = useCountryDetect();

  const draftKey = user ? `studyhub_onboarding_draft_${user.id}` : "";

  const availableStreams = grade
    ? isAdultGrade(grade)
      ? getStreamsForGrade(grade)
      : country
        ? getStreamsForCountry(country)
        : getStreamsForGrade(grade)
    : [];

  // Pre-fill name from Google
  useEffect(() => {
    if (user?.user_metadata) {
      const googleName = user.user_metadata.full_name || user.user_metadata.name || "";
      if (googleName && !fullName) setFullName(googleName);
    }
  }, [user]);

  // Auto-detect country
  useEffect(() => {
    if (detectedCountry && !country) setCountry(detectedCountry);
  }, [detectedCountry]);

  // Restore draft from localStorage
  useEffect(() => {
    if (!draftKey) return;
    try {
      const raw = localStorage.getItem(draftKey);
      if (raw) {
        const d = JSON.parse(raw);
        if (d.fullName) setFullName(d.fullName);
        if (d.country) setCountry(d.country);
        if (d.grade) setGrade(d.grade);
        if (d.stream) setStream(d.stream);
        if (Array.isArray(d.subjects)) setSubjects(d.subjects);
        if (d.step) setStep(d.step);
      }
    } catch {}
  }, [draftKey]);

  // Auto-save draft
  useEffect(() => {
    if (!draftKey || checkingProfile) return;
    try {
      localStorage.setItem(
        draftKey,
        JSON.stringify({ fullName, country, grade, stream, subjects, step })
      );
    } catch {}
  }, [draftKey, fullName, country, grade, stream, subjects, step, checkingProfile]);

  // Profile completeness check
  useEffect(() => {
    const checkProfile = async () => {
      if (!user) {
        setCheckingProfile(false);
        return;
      }
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("username, country, grade, stream, subjects")
          .eq("id", user.id)
          .maybeSingle();

        if (profile?.username && profile?.country && profile?.grade && profile?.stream) {
          navigate("/", { replace: true });
          return;
        }

        if (profile?.username) setFullName((p) => p || profile.username!);
        if (profile?.country) setCountry((p) => p || profile.country!);
        if (profile?.grade) setGrade((p) => p || profile.grade!);
        if (profile?.stream) setStream((p) => p || profile.stream!);
        if (profile?.subjects) setSubjects((p) => (p.length ? p : (profile.subjects as string[])));
      } catch (e) {
        console.error("Profile check error:", e);
      } finally {
        setCheckingProfile(false);
      }
    };
    if (!authLoading) checkProfile();
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!authLoading && !session) navigate("/auth", { replace: true });
  }, [authLoading, session, navigate]);

  // Reset stream when invalid for new grade/country
  useEffect(() => {
    if (grade && stream && !availableStreams.includes(stream)) setStream("");
  }, [grade, country, availableStreams]);

  // Validation
  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!fullName.trim()) e.fullName = "Please enter your full name.";
    else if (fullName.trim().length < 2) e.fullName = "Name is too short.";
    if (!country) e.country = "Please select your country.";
    if (!grade) e.grade = "Please select your grade.";
    if (!stream) e.stream = "Please select your curriculum.";
    return e;
  }, [fullName, country, grade, stream]);

  const stepValid = (s: number): boolean => {
    if (s === 1) return !errors.fullName && !errors.country;
    if (s === 2) return !errors.grade && !errors.stream;
    return true;
  };

  const handleNext = () => {
    if (step === 1) {
      setTouched((t) => ({ ...t, fullName: true, country: true }));
      if (!stepValid(1)) return;
    }
    if (step === 2) {
      setTouched((t) => ({ ...t, grade: true, stream: true }));
      if (!stepValid(2)) return;
    }
    setStep((s) => Math.min(TOTAL_STEPS, s + 1));
  };

  const handleBack = () => setStep((s) => Math.max(1, s - 1));

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setTouched({ fullName: true, country: true, grade: true, stream: true });
    if (Object.keys(errors).length > 0) {
      toast.error("Please complete all required fields.");
      if (errors.fullName || errors.country) setStep(1);
      else if (errors.grade || errors.stream) setStep(2);
      return;
    }
    if (!user) {
      toast.error("You must be logged in.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          username: fullName.trim(),
          country,
          grade,
          stream,
          subjects,
        })
        .eq("id", user.id);

      if (error) throw error;

      try { localStorage.removeItem(draftKey); } catch {}
      toast.success("Profile completed! Welcome to StudyHub");
      window.location.href = "/";
    } catch (err: any) {
      console.error("Save profile error:", err);
      toast.error(err?.message || "Failed to save profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || checkingProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-3">
            <Skeleton className="h-12 w-12 rounded-full mx-auto" />
            <Skeleton className="h-6 w-3/4 mx-auto" />
            <Skeleton className="h-4 w-1/2 mx-auto" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const progressValue = (step / TOTAL_STEPS) * 100;
  const showError = (key: string) => touched[key] && errors[key];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-start sm:items-center justify-center p-4 pb-28 sm:pb-4">
      <Card className="w-full max-w-md animate-fade-in shadow-xl border-primary/10">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <GraduationCap className="w-8 h-8 text-primary" aria-hidden="true" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
              Welcome to StudyHub
              <Sparkles className="w-5 h-5 text-primary animate-pulse" aria-hidden="true" />
            </CardTitle>
            <CardDescription className="text-base">
              Step {step} of {TOTAL_STEPS} — {STEP_LABELS[step - 1]}
            </CardDescription>
          </div>
          <div className="space-y-1.5">
            <Progress value={progressValue} aria-label={`Onboarding progress: step ${step} of ${TOTAL_STEPS}`} />
            <p className="text-xs text-muted-foreground">Your progress is saved automatically.</p>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* STEP 1: About you */}
            {step === 1 && (
              <div className="space-y-5 animate-fade-in">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium">
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    autoComplete="name"
                    enterKeyHint="next"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, fullName: true }))}
                    className="h-12"
                    aria-invalid={!!showError("fullName")}
                    aria-describedby={showError("fullName") ? "err-fullName" : undefined}
                    required
                  />
                  {showError("fullName") && (
                    <p id="err-fullName" className="text-xs text-destructive" role="alert">{errors.fullName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country" className="text-sm font-medium">
                    Country <span className="text-destructive">*</span>
                  </Label>
                  <Select value={country} onValueChange={(v) => { setCountry(v); setTouched((t) => ({ ...t, country: true })); }}>
                    <SelectTrigger id="country" className="h-12" aria-invalid={!!showError("country")} aria-describedby={showError("country") ? "err-country" : undefined}>
                      <SelectValue placeholder="Select your country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {showError("country") && (
                    <p id="err-country" className="text-xs text-destructive" role="alert">{errors.country}</p>
                  )}
                </div>
              </div>
            )}

            {/* STEP 2: Studies */}
            {step === 2 && (
              <div className="space-y-5 animate-fade-in">
                <div className="space-y-2">
                  <Label htmlFor="grade" className="text-sm font-medium">
                    Grade/Level <span className="text-destructive">*</span>
                  </Label>
                  <Select value={grade} onValueChange={(v) => { setGrade(v); setTouched((t) => ({ ...t, grade: true })); }}>
                    <SelectTrigger id="grade" className="h-12" aria-invalid={!!showError("grade")} aria-describedby={showError("grade") ? "err-grade" : undefined}>
                      <SelectValue placeholder="Select your grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {ALL_GRADES.map((g) => (
                        <SelectItem key={g} value={g}>{g}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {showError("grade") && (
                    <p id="err-grade" className="text-xs text-destructive" role="alert">{errors.grade}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stream" className="text-sm font-medium">
                    Stream/Curriculum <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={stream}
                    onValueChange={(v) => { setStream(v); setTouched((t) => ({ ...t, stream: true })); }}
                    disabled={!grade}
                  >
                    <SelectTrigger id="stream" className="h-12" aria-invalid={!!showError("stream")} aria-describedby={showError("stream") ? "err-stream" : undefined}>
                      <SelectValue placeholder={grade ? "Select your curriculum" : "Select grade first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableStreams.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {showError("stream") && (
                    <p id="err-stream" className="text-xs text-destructive" role="alert">{errors.stream}</p>
                  )}
                </div>
              </div>
            )}

            {/* STEP 3: Subjects (optional) */}
            {step === 3 && (
              <div className="space-y-3 animate-fade-in">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">
                    Subjects of Interest <span className="text-muted-foreground text-xs">(optional)</span>
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Pick subjects to auto-join global communities. You can change these later.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto rounded-md border p-3">
                  {getSubjectsForGrade(grade).map((s) => (
                    <label key={s} className="flex items-center gap-2 text-sm cursor-pointer min-h-[40px]">
                      <Checkbox
                        checked={subjects.includes(s)}
                        onCheckedChange={(checked) => {
                          setSubjects((prev) => (checked ? [...prev, s] : prev.filter((x) => x !== s)));
                        }}
                      />
                      <span>{s}</span>
                    </label>
                  ))}
                </div>
                {subjects.length > 0 && (
                  <p className="text-xs text-muted-foreground">{subjects.length} selected</p>
                )}
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Sticky action bar (mobile-first; inline-feeling on desktop) */}
      <div className="fixed bottom-0 left-0 right-0 sm:absolute sm:bottom-auto sm:left-auto sm:right-auto sm:relative sm:mt-4 z-30 bg-background/95 backdrop-blur border-t sm:border-t-0 sm:bg-transparent sm:backdrop-blur-0 p-4 sm:p-0 sm:max-w-md sm:w-full">
        <div className="max-w-md mx-auto flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={step === 1 || isSubmitting}
            className="h-12 flex-1 sm:flex-none sm:w-28"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          {step < TOTAL_STEPS ? (
            <Button
              type="button"
              onClick={handleNext}
              className="h-12 flex-1 font-medium"
            >
              Continue <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => handleSubmit()}
              disabled={isSubmitting}
              className="h-12 flex-1 font-medium"
            >
              {isSubmitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
              ) : (
                <><Check className="w-4 h-4 mr-1" /> Complete Setup</>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileOnboarding;

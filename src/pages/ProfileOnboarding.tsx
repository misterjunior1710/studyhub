import { useState, useEffect } from "react";
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
import { COUNTRIES, ALL_GRADES, getStreamsForGrade, isAdultGrade } from "@/lib/constants";
import { useCountryDetect } from "@/hooks/useCountryDetect";
import { getStreamsForCountry } from "@/lib/countryEducation";
import { Loader2, Sparkles, GraduationCap } from "lucide-react";

const ProfileOnboarding = () => {
  const navigate = useNavigate();
  const { user, session, isLoading: authLoading } = useAuth();
  
  const [fullName, setFullName] = useState("");
  const [country, setCountry] = useState("");
  const [grade, setGrade] = useState("");
  const [stream, setStream] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const { detectedCountry } = useCountryDetect();

  // Get streams based on selected grade AND country
  const availableStreams = grade 
    ? isAdultGrade(grade) 
      ? getStreamsForGrade(grade) 
      : country 
        ? getStreamsForCountry(country) 
        : getStreamsForGrade(grade)
    : [];

  // Pre-fill name from Google profile if available
  useEffect(() => {
    if (user?.user_metadata) {
      const googleName = user.user_metadata.full_name || user.user_metadata.name || "";
      if (googleName) {
        setFullName(googleName);
      }
    }
  }, [user]);

  // Auto-detect country
  useEffect(() => {
    if (detectedCountry && !country) {
      setCountry(detectedCountry);
    }
  }, [detectedCountry]);

  // Check if profile is already complete
  useEffect(() => {
    const checkProfile = async () => {
      if (!user) {
        setCheckingProfile(false);
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("username, country, grade, stream")
          .eq("id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Error checking profile:", error);
          setCheckingProfile(false);
          return;
        }

        // If profile is complete, redirect to home
        if (profile?.username && profile?.country && profile?.grade && profile?.stream) {
          navigate("/", { replace: true });
          return;
        }

        // Pre-fill existing data if any
        if (profile?.username) setFullName(profile.username);
        if (profile?.country) setCountry(profile.country);
        if (profile?.grade) setGrade(profile.grade);
        if (profile?.stream) setStream(profile.stream);

        setCheckingProfile(false);
      } catch (error) {
        console.error("Error checking profile:", error);
        setCheckingProfile(false);
      }
    };

    if (!authLoading) {
      checkProfile();
    }
  }, [user, authLoading, navigate]);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !session) {
      navigate("/auth", { replace: true });
    }
  }, [authLoading, session, navigate]);

  // Reset stream when grade or country changes
  useEffect(() => {
    if (grade && stream && !availableStreams.includes(stream)) {
      setStream("");
    }
  }, [grade, country, availableStreams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!fullName.trim()) {
      toast.error("Please enter your full name");
      return;
    }
    if (!country) {
      toast.error("Please select your country");
      return;
    }
    if (!grade) {
      toast.error("Please select your grade");
      return;
    }
    if (!stream) {
      toast.error("Please select your stream/curriculum");
      return;
    }

    if (!user) {
      toast.error("You must be logged in");
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
        })
        .eq("id", user.id);

      if (error) {
        console.error("Error updating profile:", error);
        toast.error("Failed to save profile. Please try again.");
        return;
      }

      toast.success("Profile completed! Welcome to StudyHub");
      
      // Force a page reload to refresh auth context with new profile data
      window.location.href = "/";
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading while checking auth or profile
  if (authLoading || checkingProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md animate-fade-in shadow-xl border-primary/10">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <GraduationCap className="w-8 h-8 text-primary" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
              Welcome to StudyHub
              <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            </CardTitle>
            <CardDescription className="text-base">
              Help us personalize your StudyHub experience
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-medium">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-11"
                required
              />
            </div>

            {/* Country */}
            <div className="space-y-2">
              <Label htmlFor="country" className="text-sm font-medium">
                Country <span className="text-destructive">*</span>
              </Label>
              <Select value={country} onValueChange={setCountry} required>
                <SelectTrigger id="country" className="h-11">
                  <SelectValue placeholder="Select your country" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Grade */}
            <div className="space-y-2">
              <Label htmlFor="grade" className="text-sm font-medium">
                Grade/Level <span className="text-destructive">*</span>
              </Label>
              <Select value={grade} onValueChange={setGrade} required>
                <SelectTrigger id="grade" className="h-11">
                  <SelectValue placeholder="Select your grade" />
                </SelectTrigger>
                <SelectContent>
                  {ALL_GRADES.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Stream - only show when grade is selected */}
            <div className="space-y-2">
              <Label htmlFor="stream" className="text-sm font-medium">
                Stream/Curriculum <span className="text-destructive">*</span>
              </Label>
              <Select 
                value={stream} 
                onValueChange={setStream} 
                required
                disabled={!grade}
              >
                <SelectTrigger id="stream" className="h-11">
                  <SelectValue placeholder={grade ? "Select your curriculum" : "Select grade first"} />
                </SelectTrigger>
                <SelectContent>
                  {availableStreams.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              type="submit" 
              className="w-full h-11 text-base font-medium mt-6"
              disabled={isSubmitting || !fullName.trim() || !country || !grade || !stream}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Complete Setup"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileOnboarding;

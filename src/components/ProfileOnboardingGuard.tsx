import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface ProfileOnboardingGuardProps {
  children: React.ReactNode;
}

const ProfileOnboardingGuard = ({ children }: ProfileOnboardingGuardProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, session, isLoading: authLoading, profileLoading } = useAuth();
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);
  const [profileComplete, setProfileComplete] = useState(false);

  // Pages that don't require profile completion
  const exemptPaths = ["/auth", "/profile-onboarding", "/privacy", "/terms", "/support"];
  const isExemptPath = exemptPaths.some(path => location.pathname.startsWith(path));

  useEffect(() => {
    const checkProfileCompletion = async () => {
      // Skip check for exempt paths
      if (isExemptPath) {
        setIsCheckingProfile(false);
        setProfileComplete(true);
        return;
      }

      // If not logged in, no need to check profile
      if (!session || !user) {
        setIsCheckingProfile(false);
        setProfileComplete(true);
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("username, country, grade, stream")
          .eq("id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Error checking profile completion:", error);
          setIsCheckingProfile(false);
          setProfileComplete(true); // Allow access on error to prevent blocking
          return;
        }

        // Check if all required fields are filled
        const isComplete = !!(
          profile?.username?.trim() &&
          profile?.country?.trim() &&
          profile?.grade?.trim() &&
          profile?.stream?.trim()
        );

        if (!isComplete) {
          // Redirect to onboarding
          navigate("/profile-onboarding", { replace: true });
          return;
        }

        setProfileComplete(true);
      } catch (error) {
        console.error("Error in profile check:", error);
        setProfileComplete(true); // Allow access on error
      } finally {
        setIsCheckingProfile(false);
      }
    };

    // Wait for auth to be ready
    if (!authLoading && !profileLoading) {
      checkProfileCompletion();
    }
  }, [user, session, authLoading, profileLoading, navigate, isExemptPath]);

  // Show nothing while checking (the page loader will handle this)
  if (authLoading || (session && isCheckingProfile)) {
    return null;
  }

  // Render children if profile is complete or path is exempt
  if (profileComplete || isExemptPath) {
    return <>{children}</>;
  }

  return null;
};

export default ProfileOnboardingGuard;

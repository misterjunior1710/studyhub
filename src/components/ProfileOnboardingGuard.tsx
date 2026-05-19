import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProfileOnboardingGuardProps {
  children: React.ReactNode;
}

const EXEMPT_PATHS = ["/auth", "/profile-onboarding", "/privacy", "/terms", "/support", "/success", "/refund", "/pricing"];

const ProfileOnboardingGuard = ({ children }: ProfileOnboardingGuardProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, session, isLoading: authLoading, profileLoading, username, profileData } = useAuth();

  const isExemptPath = EXEMPT_PATHS.some((p) => location.pathname.startsWith(p));

  const isComplete = !!(
    username?.trim() &&
    profileData?.country?.trim() &&
    profileData?.grade?.trim() &&
    profileData?.stream?.trim()
  );

  useEffect(() => {
    if (isExemptPath) return;
    if (authLoading || profileLoading) return;
    if (!session || !user) return;
    if (!isComplete) {
      navigate("/profile-onboarding", { replace: true });
    }
  }, [isExemptPath, authLoading, profileLoading, session, user, isComplete, navigate]);

  if (authLoading || (session && profileLoading && !username)) return null;
  if (isExemptPath || !session || isComplete) return <>{children}</>;
  return null;
};

export default ProfileOnboardingGuard;

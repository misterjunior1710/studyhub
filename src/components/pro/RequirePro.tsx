import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import UpgradeWall from "./UpgradeWall";
import AnimatedLoadingSkeleton from "@/components/ui/animated-loading-skeleton";

interface RequireProProps {
  feature: string;
  description?: string;
  highlights?: string[];
  children: ReactNode;
}

/**
 * Route-level Pro guard. Free users see a polished upgrade wall instead of
 * the premium page. Unauthenticated users are sent to /auth.
 *
 * NOTE: This is UI gating. All Pro logic is also enforced server-side
 * (edge functions check `is_pro_user`, RLS on whiteboards requires Pro, etc.).
 */
const RequirePro = ({ feature, description, highlights, children }: RequireProProps) => {
  const { user, loading: authLoading } = useAuth();
  const { isPro, loading: subLoading } = useSubscription();
  const location = useLocation();

  if (authLoading || (user && subLoading)) {
    return <AnimatedLoadingSkeleton />;
  }
  if (!user) {
    return (
      <Navigate
        to={`/auth?next=${encodeURIComponent(location.pathname + location.search)}`}
        replace
      />
    );
  }
  if (!isPro) {
    return (
      <UpgradeWall
        feature={feature}
        description={description}
        highlights={highlights}
      />
    );
  }
  return <>{children}</>;
};

export default RequirePro;

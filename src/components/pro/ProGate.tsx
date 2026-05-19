import { ReactNode } from "react";
import { Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useSubscription } from "@/hooks/useSubscription";

interface ProGateProps {
  /** If true, render children but blur + lock-overlay them. If false, render `fallback` or default lock. */
  blur?: boolean;
  feature?: string;
  className?: string;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Inline gate for sub-features (e.g. a premium theme tile, a Pro-only button).
 * Free users get a locked overlay that links to /pricing.
 */
const ProGate = ({ blur = true, feature = "Pro feature", className, children, fallback }: ProGateProps) => {
  const { isPro, loading } = useSubscription();
  if (loading) return <div className={cn("opacity-60", className)}>{children}</div>;
  if (isPro) return <>{children}</>;

  if (fallback) return <>{fallback}</>;

  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "pointer-events-none select-none",
          blur && "blur-[2px] opacity-60",
        )}
        aria-hidden
      >
        {children}
      </div>
      <Link
        to="/pricing"
        className="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-md bg-background/40 backdrop-blur-sm hover:bg-background/60 transition-colors"
        aria-label={`${feature} — upgrade to StudyHub Pro`}
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-primary">
          <Lock className="h-4 w-4" />
        </span>
        <span className="text-xs font-semibold text-foreground">Pro feature</span>
        <span className="text-[10px] text-muted-foreground">Tap to upgrade</span>
      </Link>
    </div>
  );
};

export default ProGate;

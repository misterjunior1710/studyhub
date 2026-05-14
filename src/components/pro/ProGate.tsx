import { ReactNode } from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { UpgradeCard } from "./UpgradeCard";
import { Loader2 } from "lucide-react";

interface ProGateProps {
  children: ReactNode;
  title?: string;
  description?: string;
  fallback?: ReactNode;
  compact?: boolean;
}

/**
 * Wraps premium content. Renders children for Pro users, otherwise an
 * upgrade prompt (or custom fallback).
 */
export function ProGate({ children, title, description, fallback, compact }: ProGateProps) {
  const { isPro, loading } = useSubscription();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isPro) return <>{children}</>;

  if (fallback) return <>{fallback}</>;

  return <UpgradeCard title={title} description={description} compact={compact} />;
}

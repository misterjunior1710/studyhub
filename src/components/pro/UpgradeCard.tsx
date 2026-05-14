import { Lock, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface UpgradeCardProps {
  title?: string;
  description?: string;
  className?: string;
  compact?: boolean;
}

export function UpgradeCard({
  title = "Unlock with StudyHub Pro",
  description = "Get unlimited access to AI tools, premium themes, and more.",
  className,
  compact,
}: UpgradeCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 via-background to-accent/10 text-center",
        compact ? "p-4" : "p-8",
        className,
      )}
    >
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-primary to-accent">
        {compact ? <Lock className="h-5 w-5 text-primary-foreground" /> : <Sparkles className="h-6 w-6 text-primary-foreground" />}
      </div>
      <h3 className={cn("font-bold tracking-tight", compact ? "text-base" : "text-xl")}>{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">{description}</p>
      <Button asChild variant="gradient" size={compact ? "sm" : "default"} className="mt-4">
        <Link to="/pricing">Upgrade to Pro</Link>
      </Button>
    </div>
  );
}

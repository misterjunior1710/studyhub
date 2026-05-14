import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProBadgeProps {
  className?: string;
  size?: "sm" | "md";
}

export function ProBadge({ className, size = "sm" }: ProBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold leading-none",
        size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-1 text-xs",
        className,
      )}
      aria-label="StudyHub Pro member"
      title="StudyHub Pro"
    >
      <Crown className={size === "sm" ? "h-2.5 w-2.5" : "h-3 w-3"} />
      PRO
    </span>
  );
}

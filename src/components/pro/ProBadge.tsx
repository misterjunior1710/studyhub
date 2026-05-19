import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ProBadgeProps {
  className?: string;
  /** "icon" = just the crown; "pill" = crown + "Pro" label */
  variant?: "icon" | "pill";
}

/**
 * Visual marker shown next to a Pro user's name. Purely cosmetic — actual
 * Pro entitlements are enforced server-side.
 */
const ProBadge = ({ className, variant = "icon" }: ProBadgeProps) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn(
            "inline-flex items-center gap-1 align-middle text-primary",
            variant === "pill" &&
              "rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
            className,
          )}
          aria-label="StudyHub Pro member"
        >
          <Crown
            className={cn(
              "fill-current",
              variant === "pill" ? "h-3 w-3" : "h-3.5 w-3.5",
            )}
            aria-hidden
          />
          {variant === "pill" && <span>Pro</span>}
        </span>
      </TooltipTrigger>
      <TooltipContent side="top">StudyHub Pro member</TooltipContent>
    </Tooltip>
  );
};

export default ProBadge;

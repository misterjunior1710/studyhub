import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ProFeatureTagProps {
  className?: string;
  /** Name of the feature, used for the tooltip and screen readers. */
  feature?: string;
  /** "pill" shows the crown + "Pro"; "icon" shows only the crown. */
  variant?: "pill" | "icon";
}

/**
 * Consistent marker for a feature that requires StudyHub Pro.
 * Distinct from ProBadge, which marks a Pro *member*.
 */
const ProFeatureTag = ({ className, feature, variant = "pill" }: ProFeatureTagProps) => {
  const label = feature ? `${feature} — included with StudyHub Pro` : "Included with StudyHub Pro";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn(
            "inline-flex items-center gap-0.5 align-middle rounded-full bg-primary/15 text-primary font-semibold uppercase tracking-wide",
            variant === "pill" ? "px-1.5 py-0.5 text-[9px]" : "h-5 w-5 justify-center",
            className,
          )}
          aria-label={label}
        >
          <Crown className="h-3 w-3 fill-current" aria-hidden />
          {variant === "pill" && <span>Pro</span>}
        </span>
      </TooltipTrigger>
      <TooltipContent side="top">{label}</TooltipContent>
    </Tooltip>
  );
};

export default ProFeatureTag;

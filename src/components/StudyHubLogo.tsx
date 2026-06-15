import { cn } from "@/lib/utils";
import logoUrl from "@/assets/studyhub-logo.png";

interface StudyHubLogoProps {
  className?: string;
  /** When true, renders the original PNG as-is instead of theme-tinted. */
  original?: boolean;
  title?: string;
}

/**
 * Theme-adaptive StudyHub logo.
 * Uses the original PNG as a CSS mask and fills it with a gradient built from
 * the active theme tokens (--primary -> --accent), so the logo automatically
 * recolors with every theme.
 */
const StudyHubLogo = ({ className, original = false, title = "StudyHub logo" }: StudyHubLogoProps) => {
  if (original) {
    return (
      <img
        src={logoUrl}
        alt={title}
        width={512}
        height={512}
        className={cn("object-contain shrink-0", className)}
      />
    );
  }

  return (
    <span
      role="img"
      aria-label={title}
      className={cn("inline-block shrink-0 align-middle", className)}
      style={{
        backgroundImage:
          "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))",
        WebkitMaskImage: `url(${logoUrl})`,
        maskImage: `url(${logoUrl})`,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        WebkitMaskSize: "contain",
        maskSize: "contain",
      }}
    />
  );
};

export default StudyHubLogo;

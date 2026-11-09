import { cn } from "@/lib/utils";
import logoAsset from "@/assets/studyhub-logo.webp.asset.json";

const logoUrl = logoAsset.url;

interface StudyHubLogoProps {
  className?: string;
  /** When true, renders the original colors instead of theme-tinted. */
  original?: boolean;
  title?: string;
}

/**
 * Theme-adaptive StudyHub logo.
 * Uses the optimized logo as a CSS mask and fills it with a gradient built from
 * the active theme tokens (--primary -> --accent), so the logo automatically
 * recolors with every theme.
 */
const StudyHubLogo = ({ className, original = false, title = "StudyHub logo" }: StudyHubLogoProps) => {
  if (original) {
    return (
      <img
        src={logoUrl}
        alt={title}
        width={256}
        height={209}
        loading="eager"
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

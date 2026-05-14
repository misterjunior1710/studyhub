import { cn } from "@/lib/utils";

interface StudyHubLogoProps {
  className?: string;
  /** Pixel size for width and height. Defaults to inherited size from className. */
  size?: number;
  title?: string;
}

/**
 * Theme-adaptive StudyHub logo.
 * Uses CSS variables --primary and --accent so it automatically follows the active theme.
 * Crisp at any size (vector) and works on light + dark backgrounds.
 */
const StudyHubLogo = ({ className, size, title = "StudyHub logo" }: StudyHubLogoProps) => {
  const gradientId = "studyhub-logo-gradient";
  const glowId = "studyhub-logo-glow";

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      role="img"
      aria-label={title}
      width={size}
      height={size}
      className={cn("shrink-0", className)}
    >
      <title>{title}</title>
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--primary))" />
          <stop offset="100%" stopColor="hsl(var(--accent))" />
        </linearGradient>
        <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Rounded badge */}
      <rect
        x="2"
        y="2"
        width="60"
        height="60"
        rx="16"
        fill={`url(#${gradientId})`}
      />

      {/* Inner highlight for depth */}
      <rect
        x="2"
        y="2"
        width="60"
        height="30"
        rx="16"
        fill="hsl(var(--primary-foreground))"
        opacity="0.08"
      />

      {/* Stylized "S" + graduation accent */}
      <g filter={`url(#${glowId})`}>
        <path
          d="M42 22c-2.4-2.7-6-4-10-4-6.6 0-11 3.4-11 8.5 0 4.6 3.5 6.6 9.6 7.8l2.7.5c3.5.7 5 1.5 5 3.2 0 2-2 3.3-5.5 3.3-3.5 0-6.2-1.3-8.4-3.8l-3.6 4c2.7 3.2 7 5 11.8 5 7.4 0 12-3.5 12-9 0-4.7-3.3-7-9.8-8.2l-2.7-.5c-3.4-.6-4.8-1.4-4.8-3 0-1.9 1.9-3 5-3 2.7 0 5 .9 7 2.7l2.7-3.5z"
          fill="hsl(var(--primary-foreground))"
        />
      </g>
    </svg>
  );
};

export default StudyHubLogo;

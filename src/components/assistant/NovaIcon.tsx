import { SVGProps } from "react";

/**
 * Nova — StudyHub's AI assistant icon.
 * Modern outlined robot mark. Uses currentColor so it inherits theme.
 * Optional `pulse` adds a subtle reactive glow on the core.
 */
export const NovaIcon = ({
  pulse = false,
  ...props
}: SVGProps<SVGSVGElement> & { pulse?: boolean }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.6}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    {/* Antenna */}
    <path d="M12 2v2" />
    <circle cx="12" cy="1.6" r="0.9" fill="currentColor" stroke="none" />

    {/* Head capsule */}
    <rect x="4" y="5" width="16" height="12" rx="4" />

    {/* Side ears */}
    <path d="M4 10v2" />
    <path d="M20 10v2" />

    {/* Eyes */}
    <circle cx="9" cy="11" r="1.1" fill="currentColor" stroke="none">
      {pulse && (
        <animate attributeName="opacity" values="1;0.4;1" dur="2.4s" repeatCount="indefinite" />
      )}
    </circle>
    <circle cx="15" cy="11" r="1.1" fill="currentColor" stroke="none">
      {pulse && (
        <animate attributeName="opacity" values="1;0.4;1" dur="2.4s" begin="0.3s" repeatCount="indefinite" />
      )}
    </circle>

    {/* Smile / signal line */}
    <path d="M9.5 14h5" />

    {/* Shoulders / base */}
    <path d="M8 17v2a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2" />
  </svg>
);

export default NovaIcon;

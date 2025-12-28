import { ReactNode, MouseEvent } from "react";
import { openExternalLink, isExternalUrl } from "@/lib/externalLink";
import { cn } from "@/lib/utils";

interface ExternalLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  title?: string;
}

/**
 * ExternalLink component that opens URLs in system browser when in WebView
 * Falls back to regular _blank behavior in normal browsers
 */
const ExternalLink = ({ href, children, className, title }: ExternalLinkProps) => {
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    // Only handle external URLs
    if (isExternalUrl(href)) {
      e.preventDefault();
      openExternalLink(href);
    }
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        className
      )}
      title={title}
    >
      {children}
    </a>
  );
};

export default ExternalLink;

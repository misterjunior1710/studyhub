import { ReactNode, useEffect, useRef, useState } from "react";

interface LazyMountProps {
  children: ReactNode;
  /** Placeholder rendered while children are not yet mounted */
  fallback?: ReactNode;
  /** Pixel margin around the viewport to start mounting earlier (default 200px) */
  rootMargin?: string;
  /** Visibility ratio to trigger mount (default 0.01) */
  threshold?: number;
  /** Minimum height reserved before mount to avoid layout shift */
  minHeight?: number | string;
  className?: string;
  /** If true, also unmounts when scrolled away (default false — mount once) */
  unmountOnExit?: boolean;
}

/**
 * Defers rendering of `children` until the wrapper enters (or nears) the viewport.
 * Useful for lazy-loading heavy sections, animations, charts, embeds, or long text blocks.
 */
const LazyMount = ({
  children,
  fallback = null,
  rootMargin = "200px",
  threshold = 0.01,
  minHeight,
  className,
  unmountOnExit = false,
}: LazyMountProps) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          setVisible(true);
          if (!unmountOnExit) io.disconnect();
        } else if (unmountOnExit) {
          setVisible(false);
        }
      },
      { rootMargin, threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin, threshold, unmountOnExit]);

  return (
    <div
      ref={ref}
      className={className}
      style={minHeight !== undefined ? { minHeight } : undefined}
    >
      {visible ? children : fallback}
    </div>
  );
};

export default LazyMount;

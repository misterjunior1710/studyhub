import { ReactNode, useRef, useState, useLayoutEffect, useEffect, memo } from "react";
import { useWindowVirtualizer } from "@tanstack/react-virtual";

interface VirtualListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  estimateSize?: number;
  overscan?: number;
  gap?: number;
  getKey?: (item: T, index: number) => string | number;
  className?: string;
}

/**
 * Window virtual list with a "self-building bridge":
 * - Tracks the container's offset reactively (resize/scroll/layout shifts)
 *   so virtualized items align with real page geometry.
 * - Generous overscan keeps a buffer of rendered rows above and below the
 *   viewport, so the scroll never hits an unmeasured/blank region.
 * - Measures each row on mount via ResizeObserver, then caches the size
 *   so subsequent passes don't re-layout.
 * - Cleans up all observers on unmount; stable `getItemKey` prevents
 *   row remounts (avoids leaked timers / observers inside row children).
 */
function VirtualListImpl<T>({
  items,
  renderItem,
  estimateSize = 320,
  overscan = 6,
  gap = 16,
  getKey,
  className,
}: VirtualListProps<T>) {
  const parentRef = useRef<HTMLDivElement | null>(null);
  const [offsetTop, setOffsetTop] = useState(0);

  // Track the parent's offset relative to the document so the virtualizer
  // can convert window scroll to list-local coordinates accurately.
  useLayoutEffect(() => {
    const el = parentRef.current;
    if (!el) return;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      const next = rect.top + window.scrollY;
      setOffsetTop((prev) => (Math.abs(prev - next) > 0.5 ? next : prev));
    };

    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(el);
    if (el.parentElement) ro.observe(el.parentElement);

    window.addEventListener("resize", measure, { passive: true });
    // One more pass after fonts/images load (layout shift safety net).
    const raf = requestAnimationFrame(measure);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
      cancelAnimationFrame(raf);
    };
  }, []);

  const virtualizer = useWindowVirtualizer({
    count: items.length,
    estimateSize: () => estimateSize,
    overscan,
    gap,
    getItemKey: getKey ? (index) => getKey(items[index], index) : undefined,
    scrollMargin: offsetTop,
  });

  // When items change length significantly, re-measure so heights stay accurate.
  useEffect(() => {
    virtualizer.measure();
  }, [items.length, virtualizer]);

  const virtualItems = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();

  return (
    <div
      ref={parentRef}
      className={className}
      style={{
        position: "relative",
        width: "100%",
        height: totalSize,
        // Hint the browser to isolate this subtree for paint/layout.
        contain: "layout paint style",
      }}
    >
      {virtualItems.map((vi) => (
        <div
          key={vi.key}
          data-index={vi.index}
          ref={virtualizer.measureElement}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            transform: `translate3d(0, ${vi.start - offsetTop}px, 0)`,
            willChange: "transform",
            contain: "layout paint style",
          }}
        >
          {renderItem(items[vi.index], vi.index)}
        </div>
      ))}
    </div>
  );
}

const VirtualList = memo(VirtualListImpl) as typeof VirtualListImpl;
export default VirtualList;

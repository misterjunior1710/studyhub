import { ReactNode, useRef, useEffect, CSSProperties } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

interface VirtualListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  estimateSize?: number;
  overscan?: number;
  gap?: number;
  getKey?: (item: T, index: number) => string | number;
  className?: string;
  style?: CSSProperties;
}

/**
 * Window-based virtual list. Keeps ~overscan*2 + visible items in the DOM
 * (typically <= 12) and recycles nodes as the user scrolls.
 *
 * Avoids memory leaks via proper cleanup of ResizeObserver in useVirtualizer
 * and a stable `getKey` to prevent unnecessary React re-mounts.
 */
function VirtualList<T>({
  items,
  renderItem,
  estimateSize = 320,
  overscan = 3,
  gap = 16,
  getKey,
  className,
  style,
}: VirtualListProps<T>) {
  const parentRef = useRef<HTMLDivElement | null>(null);

  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => (typeof window !== "undefined" ? (document.scrollingElement as HTMLElement) : null),
    estimateSize: () => estimateSize,
    overscan,
    gap,
    getItemKey: getKey ? (index) => getKey(items[index], index) : undefined,
    measureElement:
      typeof window !== "undefined" && "ResizeObserver" in window
        ? (el) => el?.getBoundingClientRect().height ?? estimateSize
        : undefined,
  });

  // Recompute offset when the list mounts at a different scroll position
  useEffect(() => {
    rowVirtualizer.measure();
  }, [items.length, rowVirtualizer]);

  const virtualItems = rowVirtualizer.getVirtualItems();
  const offsetTop = parentRef.current?.getBoundingClientRect().top
    ? window.scrollY + (parentRef.current?.getBoundingClientRect().top ?? 0)
    : 0;

  return (
    <div
      ref={parentRef}
      className={className}
      style={{
        position: "relative",
        height: rowVirtualizer.getTotalSize(),
        width: "100%",
        ...style,
      }}
    >
      {virtualItems.map((vi) => (
        <div
          key={vi.key}
          data-index={vi.index}
          ref={rowVirtualizer.measureElement}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            transform: `translateY(${vi.start}px)`,
          }}
        >
          {renderItem(items[vi.index], vi.index)}
        </div>
      ))}
      {/* offsetTop reference kept to silence unused warnings in some build modes */}
      <span style={{ display: "none" }} aria-hidden>{offsetTop}</span>
    </div>
  );
}

export default VirtualList;

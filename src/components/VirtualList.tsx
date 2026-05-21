import { ReactNode, useRef } from "react";
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
 * Window-based virtual list. Keeps only a small slice of items in the DOM
 * (visible + overscan, typically <= 12) and recycles nodes as the user scrolls.
 * Uses the page's natural window scroll, so it composes with sticky navbars
 * and existing layout without nested scroll containers.
 *
 * Memory-leak safe: useWindowVirtualizer cleans up its scroll + resize
 * listeners on unmount. A stable `getKey` keeps React from re-mounting
 * recycled rows, preventing accidental observer/event leaks in children.
 */
function VirtualList<T>({
  items,
  renderItem,
  estimateSize = 320,
  overscan = 3,
  gap = 16,
  getKey,
  className,
}: VirtualListProps<T>) {
  const parentRef = useRef<HTMLDivElement | null>(null);

  const virtualizer = useWindowVirtualizer({
    count: items.length,
    estimateSize: () => estimateSize,
    overscan,
    gap,
    getItemKey: getKey ? (index) => getKey(items[index], index) : undefined,
    scrollMargin: parentRef.current?.offsetTop ?? 0,
  });

  const virtualItems = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();

  return (
    <div
      ref={parentRef}
      className={className}
      style={{ position: "relative", width: "100%", height: totalSize }}
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
            transform: `translateY(${vi.start - (parentRef.current?.offsetTop ?? 0)}px)`,
          }}
        >
          {renderItem(items[vi.index], vi.index)}
        </div>
      ))}
    </div>
  );
}

export default VirtualList;

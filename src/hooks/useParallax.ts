import { useState, useEffect, useCallback, useRef } from "react";

export const useParallax = (speed = 0.3, maxOffset = 100) => {
  const [offset, setOffset] = useState(0);
  const ticking = useRef(false);

  const handleScroll = useCallback(() => {
    if (!ticking.current) {
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const newOffset = Math.min(scrollY * speed, maxOffset);
        setOffset(newOffset);
        ticking.current = false;
      });
      ticking.current = true;
    }
  }, [speed, maxOffset]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return offset;
};

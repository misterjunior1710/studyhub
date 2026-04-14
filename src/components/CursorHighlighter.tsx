import { useEffect, useRef } from "react";

const CursorHighlighter = () => {
  const circleRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });
  const raf = useRef<number>(0);

  useEffect(() => {
    const circle = circleRef.current;
    if (!circle) return;

    const lerp = () => {
      pos.current.x += (target.current.x - pos.current.x) * 0.15;
      pos.current.y += (target.current.y - pos.current.y) * 0.15;
      circle.style.transform = `translate(${pos.current.x - 20}px, ${pos.current.y - 20}px)`;
      raf.current = requestAnimationFrame(lerp);
    };

    const onMove = (e: MouseEvent) => {
      target.current.x = e.clientX;
      target.current.y = e.clientY;
      circle.style.opacity = "1";
    };

    const onDown = () => circle.classList.add("cursor-click");
    const onUp = () => circle.classList.remove("cursor-click");
    const onLeave = () => (circle.style.opacity = "0");

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    document.addEventListener("mouseleave", onLeave);
    raf.current = requestAnimationFrame(lerp);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <div
      ref={circleRef}
      className="cursor-highlight-circle"
      style={{ opacity: 0 }}
    />
  );
};

export default CursorHighlighter;

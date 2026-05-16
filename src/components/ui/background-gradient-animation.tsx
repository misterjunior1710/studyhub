import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface Props {
  gradientBackgroundStart?: string;
  gradientBackgroundEnd?: string;
  firstColor?: string;
  secondColor?: string;
  thirdColor?: string;
  fourthColor?: string;
  fifthColor?: string;
  pointerColor?: string;
  size?: string;
  blendingValue?: string;
  interactive?: boolean;
  className?: string;
  containerClassName?: string;
  children?: React.ReactNode;
}

/**
 * Site-wide animated gradient background.
 * Defaults are tuned to StudyHub's dark theme: deep navy → near-black base,
 * with primary/accent-tinted blobs at low opacity.
 */
export const BackgroundGradientAnimation = ({
  // Dark, near-black canvas
  gradientBackgroundStart = "rgb(8, 10, 20)",
  gradientBackgroundEnd = "rgb(2, 4, 12)",
  // Brand-leaning RGB (primary blue, accent violet, mint, magenta, gold)
  firstColor = "59, 130, 246",
  secondColor = "139, 92, 246",
  thirdColor = "34, 211, 238",
  fourthColor = "236, 72, 153",
  fifthColor = "234, 179, 8",
  pointerColor = "99, 102, 241",
  size = "70%",
  blendingValue = "soft-light",
  interactive = false,
  className,
  containerClassName,
  children,
}: Props) => {
  const interactiveRef = useRef<HTMLDivElement>(null);

  const [curX, setCurX] = useState(0);
  const [curY, setCurY] = useState(0);
  const [tgX, setTgX] = useState(0);
  const [tgY, setTgY] = useState(0);

  useEffect(() => {
    const root = document.body;
    root.style.setProperty("--gradient-background-start", gradientBackgroundStart);
    root.style.setProperty("--gradient-background-end", gradientBackgroundEnd);
    root.style.setProperty("--first-color", firstColor);
    root.style.setProperty("--second-color", secondColor);
    root.style.setProperty("--third-color", thirdColor);
    root.style.setProperty("--fourth-color", fourthColor);
    root.style.setProperty("--fifth-color", fifthColor);
    root.style.setProperty("--pointer-color", pointerColor);
    root.style.setProperty("--size", size);
    root.style.setProperty("--blending-value", blendingValue);
  }, [
    gradientBackgroundStart, gradientBackgroundEnd, firstColor, secondColor,
    thirdColor, fourthColor, fifthColor, pointerColor, size, blendingValue,
  ]);

  useEffect(() => {
    if (!interactive) return;
    let raf = 0;
    const move = () => {
      if (!interactiveRef.current) return;
      setCurX((x) => x + (tgX - x) / 20);
      setCurY((y) => y + (tgY - y) / 20);
      interactiveRef.current.style.transform = `translate(${Math.round(curX)}px, ${Math.round(curY)}px)`;
      raf = requestAnimationFrame(move);
    };
    raf = requestAnimationFrame(move);
    return () => cancelAnimationFrame(raf);
  }, [tgX, tgY, curX, curY, interactive]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!interactive || !interactiveRef.current) return;
    const rect = interactiveRef.current.getBoundingClientRect();
    setTgX(e.clientX - rect.left);
    setTgY(e.clientY - rect.top);
  };

  const [isSafari, setIsSafari] = useState(false);
  useEffect(() => {
    setIsSafari(/^((?!chrome|android).)*safari/i.test(navigator.userAgent));
  }, []);

  const blob =
    "absolute [background:radial-gradient(circle_at_center,_rgba(var(--color),_0.55)_0,_rgba(var(--color),_0)_50%)_no-repeat] [mix-blend-mode:var(--blending-value)] w-[var(--size)] h-[var(--size)] top-[calc(50%-var(--size)/2)] left-[calc(50%-var(--size)/2)] opacity-100";

  return (
    <div
      aria-hidden="true"
      onMouseMove={handleMouseMove}
      className={cn(
        "pointer-events-none overflow-hidden",
        "bg-[linear-gradient(40deg,var(--gradient-background-start),var(--gradient-background-end))]",
        containerClassName,
      )}
    >
      <svg className="hidden">
        <defs>
          <filter id="blurMe">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      <div
        className={cn(
          "gradients-container h-full w-full",
          isSafari ? "blur-2xl" : "[filter:url(#blurMe)_blur(40px)]",
          className,
        )}
      >
        <div
          className={cn(blob, "animate-first [transform-origin:center_center]")}
          style={{ ["--color" as string]: "var(--first-color)" }}
        />
        <div
          className={cn(blob, "animate-second [transform-origin:calc(50%-400px)]")}
          style={{ ["--color" as string]: "var(--second-color)" }}
        />
        <div
          className={cn(blob, "animate-third [transform-origin:calc(50%+400px)]")}
          style={{ ["--color" as string]: "var(--third-color)" }}
        />
        <div
          className={cn(blob, "animate-fourth [transform-origin:calc(50%-200px)] opacity-70")}
          style={{ ["--color" as string]: "var(--fourth-color)" }}
        />
        <div
          className={cn(
            blob,
            "animate-fifth [transform-origin:calc(50%-800px)_calc(50%+800px)] w-[calc(var(--size)*2)] h-[calc(var(--size)*2)] top-[calc(50%-var(--size))] left-[calc(50%-var(--size))]",
          )}
          style={{ ["--color" as string]: "var(--fifth-color)" }}
        />

        {interactive && (
          <div
            ref={interactiveRef}
            className="absolute [background:radial-gradient(circle_at_center,_rgba(var(--pointer-color),_0.6)_0,_rgba(var(--pointer-color),_0)_50%)_no-repeat] [mix-blend-mode:var(--blending-value)] w-full h-full -top-1/2 -left-1/2 opacity-70"
          />
        )}
      </div>

      {children}
    </div>
  );
};

export default BackgroundGradientAnimation;

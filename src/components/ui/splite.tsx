'use client';

import { Suspense, lazy, useEffect, useRef, useState } from 'react';

const Spline = lazy(() => import('@splinetool/react-spline'));

interface SplineSceneProps {
  scene: string;
  className?: string;
}

/**
 * SplineScene defers loading the heavy @splinetool/react-spline chunk until
 * the container is near the viewport, then forwards window-level pointer
 * movement into the Spline canvas so the 3D robot tracks the cursor across
 * the entire page (not just while hovering the canvas).
 */
export function SplineScene({ scene, className }: SplineSceneProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  // Lazy-mount when scrolled near
  useEffect(() => {
    if (shouldLoad) return;
    const el = wrapperRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setShouldLoad(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShouldLoad(true);
          io.disconnect();
        }
      },
      { rootMargin: '400px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [shouldLoad]);

  // Forward global pointermove into the Spline canvas
  useEffect(() => {
    if (!shouldLoad) return;
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    let canvas: HTMLCanvasElement | null = null;
    let raf = 0;
    let lastX = 0;
    let lastY = 0;
    let queued = false;

    const dispatch = () => {
      queued = false;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      // Map the cursor's position within the viewport (0..1) onto the canvas
      // rect, so the robot's look-at target stays inside its sensible range
      // no matter where the cursor is on the page.
      const vw = window.innerWidth || 1;
      const vh = window.innerHeight || 1;
      const nx = Math.min(Math.max(lastX / vw, 0), 1);
      const ny = Math.min(Math.max(lastY / vh, 0), 1);
      const mappedX = rect.left + nx * rect.width;
      const mappedY = rect.top + ny * rect.height;

      canvas.dispatchEvent(
        new PointerEvent('pointermove', {
          clientX: mappedX,
          clientY: mappedY,
          bubbles: false,
          cancelable: true,
          pointerType: 'mouse',
        }),
      );
      canvas.dispatchEvent(
        new MouseEvent('mousemove', {
          clientX: mappedX,
          clientY: mappedY,
          bubbles: false,
          cancelable: true,
        }),
      );
    };

    const onMove = (e: PointerEvent | MouseEvent) => {
      lastX = e.clientX;
      lastY = e.clientY;
      if (!queued) {
        queued = true;
        raf = requestAnimationFrame(dispatch);
      }
    };

    // Wait for canvas to appear (Spline mounts it asynchronously)
    let attempts = 0;
    const findCanvas = () => {
      canvas = wrapper.querySelector('canvas');
      if (canvas) {
        window.addEventListener('pointermove', onMove, { passive: true });
        window.addEventListener('mousemove', onMove, { passive: true });
        return;
      }
      if (attempts++ < 60) {
        setTimeout(findCanvas, 200);
      }
    };
    findCanvas();

    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('mousemove', onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [shouldLoad]);

  return (
    <div ref={wrapperRef} className={className} style={{ width: '100%', height: '100%' }}>
      {shouldLoad ? (
        <Suspense
          fallback={
            <div className="w-full h-full flex items-center justify-center">
              <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          }
        >
          <Spline scene={scene} className={className} />
        </Suspense>
      ) : (
        <div className="w-full h-full" aria-hidden="true" />
      )}
    </div>
  );
}

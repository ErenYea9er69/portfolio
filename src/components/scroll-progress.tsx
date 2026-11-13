"use client";

import React, { useEffect, useRef } from "react";

export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let rafId: number | null = null;
    let currentProgress = 0;
    let targetProgress = 0;

    const onScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      targetProgress = scrollHeight > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollHeight)) : 0;

      if (rafId === null) {
        rafId = requestAnimationFrame(update);
      }
    };

    const update = () => {
      // Smooth lerp to mimic spring feel without any library
      currentProgress += (targetProgress - currentProgress) * 0.25;

      if (Math.abs(targetProgress - currentProgress) < 0.001) {
        currentProgress = targetProgress;
        rafId = null;
      } else {
        rafId = requestAnimationFrame(update);
      }

      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${currentProgress})`;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      ref={barRef}
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 h-[2px] bg-foreground/70 origin-left z-[60] pointer-events-none will-change-transform"
      style={{ transform: "scaleX(0)" }}
    >
      {/* Leading glow dot */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 size-1.5 rounded-full bg-foreground shadow-[0_0_8px_hsl(var(--foreground)/0.5)]" />
    </div>
  );
}

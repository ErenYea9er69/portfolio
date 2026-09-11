"use client";

import { useEffect, useRef, useCallback } from "react";

interface MeteorsProps {
  number?: number;
  className?: string;
}

interface Meteor {
  x: number;
  y: number;
  length: number;
  speed: number;
  opacity: number;
  width: number;
  delay: number;
  elapsed: number;
  active: boolean;
}

/**
 * Canvas-rendered shooting stars with soft glowing heads
 * and tapered luminous trails. Replaces the old CSS-dot meteors.
 */
export const Meteors = ({ number = 15 }: MeteorsProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const meteorsRef = useRef<Meteor[]>([]);
  const animFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  const createMeteor = useCallback(
    (canvasWidth: number, canvasHeight: number): Meteor => {
      return {
        x: Math.random() * canvasWidth * 1.2,
        y: -(Math.random() * canvasHeight * 0.3),
        length: Math.random() * 80 + 40,
        speed: Math.random() * 3 + 1.5,
        opacity: Math.random() * 0.6 + 0.2,
        width: Math.random() * 1.2 + 0.3,
        delay: Math.random() * 8000,
        elapsed: 0,
        active: false,
      };
    },
    []
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener("resize", resize);

    // Initialize meteors
    meteorsRef.current = Array.from({ length: number }, () =>
      createMeteor(window.innerWidth, window.innerHeight)
    );

    // Angle: roughly 215 degrees (matching the original rotate-[215deg])
    const angle = (215 * Math.PI) / 180;
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);

    const draw = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const delta = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      const w = window.innerWidth;
      const h = window.innerHeight;

      ctx.clearRect(0, 0, w, h);

      meteorsRef.current.forEach((m) => {
        m.elapsed += delta;

        // Delay before activating
        if (!m.active) {
          if (m.elapsed >= m.delay) {
            m.active = true;
            m.elapsed = 0;
          }
          return;
        }

        // Move
        m.x += dx * m.speed * (delta * 0.06);
        m.y -= dy * m.speed * (delta * 0.06);

        // Reset when off-screen
        if (m.x < -100 || m.y > h + 100) {
          Object.assign(m, createMeteor(w, h));
          return;
        }

        // Determine if dark mode or light mode is active
        const isDark = document.documentElement.classList.contains("dark");

        // Draw the trail
        const tailX = m.x - dx * m.length;
        const tailY = m.y + dy * m.length;

        const gradient = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
        if (isDark) {
          gradient.addColorStop(0, `rgba(220, 230, 255, ${m.opacity})`);
          gradient.addColorStop(0.3, `rgba(200, 215, 245, ${m.opacity * 0.5})`);
          gradient.addColorStop(1, "rgba(200, 215, 245, 0)");
        } else {
          // Sapphire meteor trails for light mode
          gradient.addColorStop(0, `rgba(29, 78, 216, ${Math.min(m.opacity * 1.3, 0.95)})`); // sapphire-700
          gradient.addColorStop(0.25, `rgba(37, 99, 235, ${m.opacity * 0.85})`); // sapphire-600
          gradient.addColorStop(0.65, `rgba(96, 165, 250, ${m.opacity * 0.45})`); // sapphire-400
          gradient.addColorStop(1, "rgba(191, 219, 254, 0)");
        }

        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(tailX, tailY);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = isDark ? m.width : m.width * 1.4;
        ctx.lineCap = "round";
        ctx.stroke();

        // Draw the glowing head
        const headRadius = m.width * (isDark ? 4 : 5);
        const headGlow = ctx.createRadialGradient(
          m.x,
          m.y,
          0,
          m.x,
          m.y,
          headRadius
        );
        if (isDark) {
          headGlow.addColorStop(0, `rgba(240, 245, 255, ${m.opacity * 0.9})`);
          headGlow.addColorStop(0.5, `rgba(200, 220, 255, ${m.opacity * 0.3})`);
          headGlow.addColorStop(1, "rgba(200, 220, 255, 0)");
        } else {
          // Sapphire nucleus for light mode
          headGlow.addColorStop(0, `rgba(30, 58, 138, ${Math.min(m.opacity * 1.4, 1)})`); // deep sapphire core
          headGlow.addColorStop(0.4, `rgba(37, 99, 235, ${m.opacity * 0.7})`); // sapphire radiant glow
          headGlow.addColorStop(1, "rgba(147, 197, 253, 0)");
        }

        ctx.beginPath();
        ctx.arc(m.x, m.y, headRadius, 0, Math.PI * 2);
        ctx.fillStyle = headGlow;
        ctx.fill();
      });

      animFrameRef.current = requestAnimationFrame(draw);
    };

    // Pause on tab hidden
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        lastTimeRef.current = 0;
        animFrameRef.current = requestAnimationFrame(draw);
      } else {
        cancelAnimationFrame(animFrameRef.current);
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    
    // Defer animation startup so initial paint and hydration are completely unblocked
    let idleId: any;
    if ("requestIdleCallback" in window) {
      idleId = (window as any).requestIdleCallback(() => {
        animFrameRef.current = requestAnimationFrame(draw);
      }, { timeout: 1500 });
    } else {
      idleId = setTimeout(() => {
        animFrameRef.current = requestAnimationFrame(draw);
      }, 500);
    }

    return () => {
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", handleVisibility);
      cancelAnimationFrame(animFrameRef.current);
      if ("cancelIdleCallback" in window && typeof idleId === "number") {
        (window as any).cancelIdleCallback(idleId);
      } else {
        clearTimeout(idleId);
      }
    };
  }, [number, createMeteor]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ width: "100%", height: "100%" }}
    />
  );
};

export default Meteors;

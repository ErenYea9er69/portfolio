"use client";

import React, { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { MeteorsBackground } from "./meteors-background";
import { ThemeCompanions } from "./theme-companions";

export function AmbientFx() {
  const { theme, resolvedTheme } = useTheme();
  const activeTheme = theme || resolvedTheme || "dark";
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mounted, setMounted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setMounted(true);
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(motionQuery.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    motionQuery.addEventListener("change", handler);
    return () => motionQuery.removeEventListener("change", handler);
  }, []);

  // Ambient Canvas Animation for specialized themes
  useEffect(() => {
    if (!mounted || reducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let isRunning = true;
    let rafId = 0;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize, { passive: true });

    // Entities pool
    interface AmbientItem {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      alpha: number;
      rot: number;
      vRot: number;
      phase: number;
    }

    const items: AmbientItem[] = [];
    const count =
      activeTheme === "japanese"
        ? 35
        : activeTheme === "minecraft"
        ? 32
        : activeTheme === "cyberpunk"
        ? 40
        : activeTheme === "e33"
        ? 36
        : 0;

    for (let i = 0; i < count; i++) {
      items.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 20 + (activeTheme === "japanese" ? 18 : 0),
        vy:
          activeTheme === "cyberpunk"
            ? 45 + Math.random() * 65
            : 15 + Math.random() * 25,
        size:
          activeTheme === "minecraft"
            ? 4 + Math.floor(Math.random() * 3) * 2
            : activeTheme === "cyberpunk"
            ? 1.5 + Math.random() * 2.5
            : 5 + Math.random() * 8,
        color:
          activeTheme === "japanese"
            ? Math.random() > 0.4 ? "#c93a2b" : "#d4af37"
            : activeTheme === "minecraft"
            ? Math.random() > 0.5 ? "#38c02b" : "#4deeea"
            : activeTheme === "cyberpunk"
            ? Math.random() > 0.6 ? "#ffe600" : Math.random() > 0.3 ? "#39ff14" : "#ff7700"
            : "#d9453f",
        alpha: 0.2 + Math.random() * 0.4,
        rot: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 1.5,
        phase: Math.random() * Math.PI * 2,
      });
    }

    let lastTimestamp = 0;

    const render = (ts: number) => {
      if (!isRunning) return;
      if (!lastTimestamp) lastTimestamp = ts;
      const dt = Math.min((ts - lastTimestamp) / 1000, 0.05);
      lastTimestamp = ts;

      ctx.clearRect(0, 0, width, height);

      // Cyberpunk background grid scanlines (NO blue, NO purple!)
      if (activeTheme === "cyberpunk") {
        ctx.strokeStyle = "rgba(255, 230, 0, 0.05)";
        ctx.lineWidth = 1;
        const gridSize = 40;
        ctx.beginPath();
        for (let x = 0; x < width; x += gridSize) {
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
        }
        for (let y = 0; y < height; y += gridSize) {
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
        }
        ctx.stroke();

        // Horizontal high-voltage scanning line
        const scanY = (ts * 0.08) % height;
        ctx.strokeStyle = "rgba(57, 255, 20, 0.12)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, scanY);
        ctx.lineTo(width, scanY);
        ctx.stroke();
      }

      // Render floating items
      items.forEach((item) => {
        item.x += (item.vx + Math.sin(ts * 0.002 + item.phase) * 12) * dt;
        item.y += item.vy * dt;
        item.rot += item.vRot * dt;

        // Wrap around boundaries
        if (item.y > height + 20) {
          item.y = -20;
          item.x = Math.random() * width;
        } else if (item.y < -20) {
          item.y = height + 20;
          item.x = Math.random() * width;
        }
        if (item.x > width + 20) item.x = -20;
        else if (item.x < -20) item.x = width + 20;

        ctx.save();
        ctx.globalAlpha = item.alpha;

        if (activeTheme === "minecraft") {
          // Pixel spore / experience particle
          ctx.translate(item.x, item.y);
          ctx.fillStyle = item.color;
          ctx.fillRect(-item.size / 2, -item.size / 2, item.size, item.size);
          ctx.strokeStyle = "rgba(0,0,0,0.4)";
          ctx.lineWidth = 1;
          ctx.strokeRect(-item.size / 2, -item.size / 2, item.size, item.size);
        } else if (activeTheme === "japanese" || activeTheme === "e33") {
          // Drifting sakura / rose petal
          ctx.translate(item.x, item.y);
          ctx.rotate(item.rot);
          ctx.fillStyle = item.color;
          ctx.beginPath();
          ctx.ellipse(0, 0, item.size * 0.4, item.size, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (activeTheme === "cyberpunk") {
          // Electric spark data rain
          ctx.fillStyle = item.color;
          ctx.shadowColor = item.color;
          ctx.shadowBlur = 8;
          ctx.fillRect(item.x, item.y, item.size, item.size * 3.5);
        }

        ctx.restore();
      });

      rafId = requestAnimationFrame(render);
    };

    if (["japanese", "minecraft", "cyberpunk", "e33"].includes(activeTheme)) {
      rafId = requestAnimationFrame(render);
    }

    return () => {
      isRunning = false;
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
    };
  }, [mounted, activeTheme, reducedMotion]);

  if (!mounted) return null;

  // Use meteors & cloud background with Kodama spirits for modern dark/light themes only
  if (activeTheme === "dark" || activeTheme === "light") {
    return <MeteorsBackground />;
  }

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none -z-10"
      />
      <ThemeCompanions theme={activeTheme} />
    </>
  );
}

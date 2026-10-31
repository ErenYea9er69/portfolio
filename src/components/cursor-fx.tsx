/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useTheme } from "next-themes";
import { sound } from "@/lib/sound-fx";

interface Particle {
  type: "spark" | "ink" | "voxel" | "petal";
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  rotation?: number;
  vRot?: number;
  life: number;
  maxLife: number;
  gravity?: number;
}

interface SlashEffect {
  x: number;
  y: number;
  angle: number;
  length: number;
  progress: number;
  color: string;
  glowColor: string;
}

interface LightningBolt {
  points: { x: number; y: number }[];
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

export function CursorFx() {
  const { theme, resolvedTheme } = useTheme();
  const activeTheme = theme || resolvedTheme || "dark";

  const cursorRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isPointerFine, setIsPointerFine] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isHoveringClickable, setIsHoveringClickable] = useState(false);
  const [hoverLabel, setHoverLabel] = useState("");

  const mousePos = useRef({ x: -100, y: -100, px: -100, py: -100, vx: 0, vy: 0 });
  const particles = useRef<Particle[]>([]);
  const slashes = useRef<SlashEffect[]>([]);
  const lightnings = useRef<LightningBolt[]>([]);
  const rafId = useRef<number>(0);
  const lastTime = useRef<number>(0);

  // Setup media query checks
  useEffect(() => {
    const fineQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    setIsPointerFine(fineQuery.matches);
    setReducedMotion(motionQuery.matches);
    if (fineQuery.matches) {
      document.documentElement.classList.add("cursor-fx");
    }

    const handleFineChange = (e: MediaQueryListEvent) => {
      setIsPointerFine(e.matches);
      if (e.matches) document.documentElement.classList.add("cursor-fx");
      else document.documentElement.classList.remove("cursor-fx");
    };
    const handleMotionChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);

    fineQuery.addEventListener("change", handleFineChange);
    motionQuery.addEventListener("change", handleMotionChange);

    return () => {
      document.documentElement.classList.remove("cursor-fx");
      fineQuery.removeEventListener("change", handleFineChange);
      motionQuery.removeEventListener("change", handleMotionChange);
    };
  }, []);

  // Resize canvas
  useEffect(() => {
    if (!isPointerFine || reducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    handleResize();
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, [isPointerFine, reducedMotion]);

  // Spawn Katana Slash Click Effect
  const spawnKatanaSlash = useCallback((x: number, y: number) => {
    const sign = Math.random() > 0.5 ? 1 : -1;
    const angle = (Math.PI / 4 + (Math.random() * 0.2 - 0.1)) * sign;
    const length = 240 + Math.random() * 120;

    slashes.current.push({
      x,
      y,
      angle,
      length,
      progress: 0,
      color: "#ffffff",
      glowColor: "#c93a2b",
    });

    // Splatter ink & crimson droplets along the cut
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const dropletCount = 28;

    for (let i = 0; i < dropletCount; i++) {
      const offset = (Math.random() - 0.5) * length * 0.9;
      const originX = x + cos * offset;
      const originY = y + sin * offset;
      const perpAngle = angle + (Math.PI / 2) * (Math.random() > 0.5 ? 1 : -1) + (Math.random() * 0.4 - 0.2);
      const speed = 70 + Math.random() * 200;

      particles.current.push({
        type: "ink",
        x: originX,
        y: originY,
        vx: Math.cos(perpAngle) * speed,
        vy: Math.sin(perpAngle) * speed,
        size: 2 + Math.random() * 4.5,
        color: Math.random() > 0.35 ? "#c93a2b" : "#0d0b0a",
        alpha: 1,
        life: 0,
        maxLife: 0.5 + Math.random() * 0.4,
        gravity: 120,
      });
    }
  }, []);

  // Spawn Minecraft Voxel Cube Burst
  const spawnMinecraftBurst = useCallback((x: number, y: number) => {
    const voxelColors = ["#737373", "#855b32", "#e72424", "#4deeea", "#38c02b", "#b0b0b0"];
    const count = 30;

    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 90 + Math.random() * 260;
      particles.current.push({
        type: "voxel",
        x,
        y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - 90,
        size: 5 + Math.floor(Math.random() * 4) * 2,
        color: voxelColors[Math.floor(Math.random() * voxelColors.length)],
        alpha: 1,
        rotation: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 8,
        life: 0,
        maxLife: 0.6 + Math.random() * 0.4,
        gravity: 420,
      });
    }
  }, []);

  // Spawn Cyberpunk High-Voltage Electric Arc Discharge (NO blue, NO purple!)
  const spawnElectricLightning = useCallback((x: number, y: number) => {
    const arcColors = ["#ffe600", "#39ff14", "#ff7700", "#ffffff"];
    const boltCount = 6 + Math.floor(Math.random() * 4);

    for (let b = 0; b < boltCount; b++) {
      const mainAngle = (b / boltCount) * Math.PI * 2 + (Math.random() * 0.4 - 0.2);
      const branches = 4 + Math.floor(Math.random() * 4);
      let curX = x;
      let curY = y;
      const stepLen = 24 + Math.random() * 28;
      const pts: { x: number; y: number }[] = [{ x: curX, y: curY }];

      for (let s = 0; s < branches; s++) {
        const segAngle = mainAngle + (Math.random() * 0.9 - 0.45);
        curX += Math.cos(segAngle) * stepLen;
        curY += Math.sin(segAngle) * stepLen;
        pts.push({ x: curX, y: curY });

        if (Math.random() > 0.4) {
          particles.current.push({
            type: "spark",
            x: curX,
            y: curY,
            vx: (Math.random() - 0.5) * 160,
            vy: (Math.random() - 0.5) * 160,
            size: 2 + Math.random() * 3,
            color: arcColors[Math.floor(Math.random() * arcColors.length)],
            alpha: 1,
            life: 0,
            maxLife: 0.3 + Math.random() * 0.3,
            gravity: 40,
          });
        }
      }

      lightnings.current.push({
        points: pts,
        color: arcColors[Math.floor(Math.random() * arcColors.length)],
        alpha: 1,
        life: 0,
        maxLife: 0.25 + Math.random() * 0.15,
      });
    }
  }, []);

  // Spawn Expedition 33 rose petals
  const spawnPetalBurst = useCallback((x: number, y: number) => {
    const petalColors = ["#d9453f", "#e8d08a", "#f3e6bf"];
    for (let i = 0; i < 24; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 50 + Math.random() * 180;
      particles.current.push({
        type: "petal",
        x,
        y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        size: 6 + Math.random() * 8,
        color: petalColors[Math.floor(Math.random() * petalColors.length)],
        alpha: 1,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 4,
        life: 0,
        maxLife: 0.8 + Math.random() * 0.6,
        gravity: 60,
      });
    }
  }, []);

  // Handle click on window (works for both mouse & touch)
  useEffect(() => {
    const handleClick = (e: MouseEvent | TouchEvent) => {
      let clientX = 0;
      let clientY = 0;
      if ("touches" in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ("clientX" in e) {
        clientX = e.clientX;
        clientY = e.clientY;
      } else {
        return;
      }

      sound.playClickForTheme(activeTheme);

      if (reducedMotion) return;

      if (activeTheme === "japanese") {
        spawnKatanaSlash(clientX, clientY);
      } else if (activeTheme === "minecraft") {
        spawnMinecraftBurst(clientX, clientY);
      } else if (activeTheme === "cyberpunk") {
        spawnElectricLightning(clientX, clientY);
      } else if (activeTheme === "e33") {
        spawnPetalBurst(clientX, clientY);
      } else {
        spawnElectricLightning(clientX, clientY);
      }
    };

    window.addEventListener("click", handleClick, { passive: true });
    return () => window.removeEventListener("click", handleClick);
  }, [activeTheme, reducedMotion, spawnKatanaSlash, spawnMinecraftBurst, spawnElectricLightning, spawnPetalBurst]);

  // Track Mouse Movement and hover states
  useEffect(() => {
    if (!isPointerFine) return;

    let trailCounter = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX: x, clientY: y } = e;
      const dx = x - mousePos.current.x;
      const dy = y - mousePos.current.y;
      mousePos.current.px = mousePos.current.x;
      mousePos.current.py = mousePos.current.y;
      mousePos.current.x = x;
      mousePos.current.y = y;
      mousePos.current.vx = dx;
      mousePos.current.vy = dy;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      }

      // Spawn trail particles sparingly
      trailCounter++;
      if (!reducedMotion && trailCounter % 3 === 0 && (Math.abs(dx) > 1 || Math.abs(dy) > 1)) {
        if (activeTheme === "japanese" && particles.current.length < 70) {
          particles.current.push({
            type: "ink",
            x: x + (Math.random() - 0.5) * 4,
            y: y + (Math.random() - 0.5) * 4,
            vx: (Math.random() - 0.5) * 12,
            vy: (Math.random() - 0.5) * 12 + 8,
            size: 1.8 + Math.random() * 2.5,
            color: "#1a1614",
            alpha: 0.65,
            life: 0,
            maxLife: 0.45,
            gravity: 15,
          });
        } else if (activeTheme === "cyberpunk" && particles.current.length < 70) {
          particles.current.push({
            type: "spark",
            x: x + (Math.random() - 0.5) * 6,
            y: y + (Math.random() - 0.5) * 6,
            vx: (Math.random() - 0.5) * 35,
            vy: (Math.random() - 0.5) * 35,
            size: 1.5 + Math.random() * 2,
            color: Math.random() > 0.5 ? "#ffe600" : "#39ff14",
            alpha: 0.9,
            life: 0,
            maxLife: 0.35,
            gravity: 10,
          });
        }
      }

      // Check for clickable hover targets
      const target = e.target as HTMLElement | null;
      if (target) {
        const clickable = target.closest(
          'a, button, [role="button"], input, select, textarea, [data-interactive="true"]'
        );
        if (clickable) {
          setIsHoveringClickable(true);
          const label =
            clickable.getAttribute("aria-label") ||
            clickable.getAttribute("data-cursor-label") ||
            clickable.textContent?.trim().slice(0, 14) ||
            "";
          setHoverLabel(label);
        } else {
          setIsHoveringClickable(false);
          setHoverLabel("");
        }
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isPointerFine, activeTheme, reducedMotion]);

  // Main Canvas Render Loop (Physics & Particles) - Only active on devices with fine pointer
  useEffect(() => {
    if (!isPointerFine || reducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let isRunning = true;

    const render = (timestamp: number) => {
      if (!isRunning) return;

      if (!lastTime.current) lastTime.current = timestamp;
      const dt = Math.min((timestamp - lastTime.current) / 1000, 0.05);
      lastTime.current = timestamp;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // ─── 1. Draw Slashes (Katana Cut) ───
      for (let i = slashes.current.length - 1; i >= 0; i--) {
        const slash = slashes.current[i];
        slash.progress += dt * 3.5;

        if (slash.progress >= 1) {
          slashes.current.splice(i, 1);
          continue;
        }

        const t = slash.progress;
        const cos = Math.cos(slash.angle);
        const sin = Math.sin(slash.angle);
        const halfLen = slash.length / 2;

        const startX = slash.x - cos * halfLen;
        const startY = slash.y - sin * halfLen;
        const curEndLen = slash.length * Math.min(1, t * 1.6);
        const curEndX = startX + cos * curEndLen;
        const curEndY = startY + sin * curEndLen;

        const alpha = t < 0.3 ? 1 : 1 - (t - 0.3) / 0.7;

        ctx.save();
        ctx.globalCompositeOperation = "lighter";

        // Outer glow
        ctx.strokeStyle = slash.glowColor;
        ctx.lineWidth = 10 * (1 - t * 0.7);
        ctx.lineCap = "round";
        ctx.globalAlpha = alpha * 0.75;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(curEndX, curEndY);
        ctx.stroke();

        // White-hot core blade line
        ctx.strokeStyle = slash.color;
        ctx.lineWidth = 3.5 * (1 - t * 0.5);
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(curEndX, curEndY);
        ctx.stroke();

        if (t < 0.25) {
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(slash.x, slash.y, 14 * (1 - t * 4), 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      // ─── 2. Draw Lightning Bolts (Cyberpunk Arc) ───
      for (let i = lightnings.current.length - 1; i >= 0; i--) {
        const bolt = lightnings.current[i];
        bolt.life += dt;
        if (bolt.life >= bolt.maxLife) {
          lightnings.current.splice(i, 1);
          continue;
        }

        const alpha = 1 - bolt.life / bolt.maxLife;
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.strokeStyle = bolt.color;
        ctx.lineWidth = 2.8 * alpha;
        ctx.lineCap = "round";
        ctx.lineJoin = "miter";
        ctx.shadowColor = bolt.color;
        ctx.shadowBlur = 14;
        ctx.globalAlpha = alpha;

        ctx.beginPath();
        bolt.points.forEach((pt, idx) => {
          if (idx === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        });
        ctx.stroke();

        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1 * alpha;
        ctx.stroke();

        ctx.restore();
      }

      // ─── 3. Draw Particles (Ink, Voxels, Sparks, Petals) ───
      for (let i = particles.current.length - 1; i >= 0; i--) {
        const p = particles.current[i];
        p.life += dt;

        if (p.life >= p.maxLife) {
          particles.current.splice(i, 1);
          continue;
        }

        const lifeFrac = p.life / p.maxLife;
        const currentAlpha = p.alpha * (1 - lifeFrac);

        if (p.gravity) p.vy += p.gravity * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vx *= Math.exp(-dt * 1.5);
        p.vy *= Math.exp(-dt * 1.5);

        if (p.rotation !== undefined && p.vRot !== undefined) {
          p.rotation += p.vRot * dt;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, currentAlpha);

        if (p.type === "voxel") {
          ctx.translate(p.x, p.y);
          if (p.rotation !== undefined) ctx.rotate(p.rotation);
          const sz = p.size;
          ctx.fillStyle = p.color;
          ctx.fillRect(-sz / 2, -sz / 2, sz, sz);
          ctx.strokeStyle = "rgba(0,0,0,0.6)";
          ctx.lineWidth = 1.5;
          ctx.strokeRect(-sz / 2, -sz / 2, sz, sz);
          ctx.fillStyle = "rgba(255,255,255,0.4)";
          ctx.fillRect(-sz / 2, -sz / 2, sz, 2);
          ctx.fillRect(-sz / 2, -sz / 2, 2, sz);
        } else if (p.type === "ink") {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * (1 - lifeFrac * 0.3), 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === "petal") {
          ctx.translate(p.x, p.y);
          if (p.rotation !== undefined) ctx.rotate(p.rotation);
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size * 0.5, p.size, 0, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.globalCompositeOperation = "lighter";
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * (1 - lifeFrac * 0.4), 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      rafId.current = requestAnimationFrame(render);
    };

    rafId.current = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      cancelAnimationFrame(rafId.current);
    };
  }, [isPointerFine, reducedMotion]);

  if (!isPointerFine || reducedMotion) {
    return null;
  }

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-[9998]"
      />

      {isPointerFine && (
        <div
          ref={cursorRef}
          aria-hidden="true"
          className="fixed top-0 left-0 pointer-events-none z-[9999] will-change-transform"
        >
          {/* 🗡️ Japanese Katana Sword Cursor (Tip strictly anchored at 0, 0) */}
          {activeTheme === "japanese" && (
            <div className="relative">
              <img
                src={isHoveringClickable ? "/cursors/katana-hover.svg" : "/cursors/katana-sword.svg"}
                alt=""
                width={36}
                height={36}
                className={`origin-top-left transition-transform duration-150 drop-shadow-md ${
                  isHoveringClickable ? "scale-115 rotate-[-4deg]" : "scale-100"
                }`}
              />
              {isHoveringClickable && (
                <div className="absolute left-8 top-1 flex items-center gap-1.5 font-serif text-[11px] font-bold tracking-widest text-[#d4af37] bg-[#141210]/95 px-2 py-0.5 rounded border border-[#d4af37]/50 shadow-md whitespace-nowrap">
                  <span>斬</span>
                  {hoverLabel && <span className="text-[10px] text-[#ebe5d8]/80 font-sans">{hoverLabel}</span>}
                </div>
              )}
            </div>
          )}

          {/* ⛏️ Minecraft Diamond Sword / Pickaxe Cursor (Tip strictly anchored at 0, 0) */}
          {activeTheme === "minecraft" && (
            <div className="relative">
              <img
                src={isHoveringClickable ? "/cursors/minecraft-pickaxe.svg" : "/cursors/minecraft-sword.svg"}
                alt=""
                width={32}
                height={32}
                className={`origin-top-left transition-transform duration-100 image-rendering-pixelated ${
                  isHoveringClickable ? "scale-115" : "scale-100"
                }`}
              />
              {isHoveringClickable && (
                <div className="absolute left-8 top-0 px-2 py-0.5 bg-[#100010] text-[#55ffff] border-2 border-[#2b0055] text-[10px] tracking-wider uppercase font-pixel shadow-[2px_2px_0_#000000] whitespace-nowrap">
                  ⛏ {hoverLabel || "Use"}
                </div>
              )}
            </div>
          )}

          {/* ⚡ 100kV Cyberpunk Industrial Pointer / Reticle (NO blue, NO purple!) */}
          {activeTheme === "cyberpunk" && (
            <div className="relative">
              {isHoveringClickable ? (
                <div className="-translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                  <img
                    src="/cursors/cyberpunk-crosshair.svg"
                    alt=""
                    width={32}
                    height={32}
                    className="origin-center scale-110 drop-shadow-[0_0_10px_rgba(255,230,0,0.8)] animate-pulse"
                  />
                  <div className="absolute left-8 -top-1 flex items-center gap-1.5 text-[10px] font-mono font-bold text-[#ffe600] bg-[#090a07] px-2 py-0.5 border border-[#ffe600] shadow-[0_0_10px_rgba(255,230,0,0.5)] whitespace-nowrap uppercase tracking-widest">
                    <span className="text-[#39ff14]">⚡</span>
                    <span>100kV</span>
                    {hoverLabel && <span className="text-white/80 font-normal">{hoverLabel}</span>}
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src="/cursors/cyberpunk-pointer.svg"
                    alt=""
                    width={32}
                    height={32}
                    className="origin-top-left drop-shadow-[0_0_8px_rgba(255,230,0,0.6)]"
                  />
                </div>
              )}
            </div>
          )}

          {/* 🌹 Expedition 33 Belle Epoque Brush Petal */}
          {activeTheme === "e33" && (
            <div className="relative">
              {isHoveringClickable ? (
                <div className="-translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                  <img
                    src="/cursors/e33-flower.svg"
                    alt=""
                    width={32}
                    height={32}
                    className="origin-center scale-120 drop-shadow-[0_0_10px_rgba(232,208,138,0.7)]"
                  />
                </div>
              ) : (
                <div className="relative">
                  <img
                    src="/cursors/e33-petal.svg"
                    alt=""
                    width={32}
                    height={32}
                    className="origin-top-left drop-shadow-[0_0_8px_rgba(217,69,63,0.5)]"
                  />
                </div>
              )}
            </div>
          )}

          {/* Modern Dark / Light Minimalist Dot */}
          {(activeTheme === "dark" || activeTheme === "light" || !["japanese", "minecraft", "cyberpunk", "e33"].includes(activeTheme)) && (
            <div className="-translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
              <div
                className={`rounded-full transition-all duration-200 flex items-center justify-center ${
                  isHoveringClickable
                    ? "size-8 bg-foreground/15 border border-foreground/30 shadow-xs"
                    : "size-4 bg-foreground/25 border border-foreground/40"
                }`}
              >
                <div className="size-1.5 rounded-full bg-foreground shadow-xs" />
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

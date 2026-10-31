"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useTheme } from "next-themes";
import { sound } from "@/lib/sound-fx";

interface Particle {
  type: "spark" | "ink" | "voxel" | "lightning" | "petal";
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
  extra?: unknown;
}

interface SlashEffect {
  x: number;
  y: number;
  angle: number;
  length: number;
  progress: number; // 0 to 1
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
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    handleResize();
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Spawn Katana Slash Click Effect
  const spawnKatanaSlash = useCallback((x: number, y: number) => {
    // Random angle between -25deg and -50deg or 25deg and 50deg
    const sign = Math.random() > 0.5 ? 1 : -1;
    const angle = (Math.PI / 4 + (Math.random() * 0.2 - 0.1)) * sign;
    const length = 220 + Math.random() * 100;

    slashes.current.push({
      x,
      y,
      angle,
      length,
      progress: 0,
      color: "#ffffff",
      glowColor: "#c93a2b", // Vermilion crimson
    });

    // Splatter ink & crimson droplets along the cut
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const dropletCount = 28;

    for (let i = 0; i < dropletCount; i++) {
      const offset = (Math.random() - 0.5) * length * 0.9;
      const originX = x + cos * offset;
      const originY = y + sin * offset;
      // Perpendicular splatter
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
    // Block colors: Stone, Oak Wood, Redstone, Diamond, Grass/Emerald
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
        vy: Math.sin(ang) * spd - 90, // Upward initial toss
        size: 5 + Math.floor(Math.random() * 4) * 2, // 5, 7, 9, 11px stepped cubes
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
    // Colors: Electric Yellow, Acid Green, Hazard Orange, Stark Tungsten White
    const arcColors = ["#ffe600", "#39ff14", "#ff7700", "#ffffff"];
    const boltCount = 6 + Math.floor(Math.random() * 4);

    for (let b = 0; b < boltCount; b++) {
      const mainAngle = (b / boltCount) * Math.PI * 2 + (Math.random() * 0.4 - 0.2);
      const branches = 4 + Math.floor(Math.random() * 4);
      let curX = x;
      let curY = y;
      const stepLen = 22 + Math.random() * 25;
      const pts: { x: number; y: number }[] = [{ x: curX, y: curY }];

      for (let s = 0; s < branches; s++) {
        const segAngle = mainAngle + (Math.random() * 0.9 - 0.45);
        curX += Math.cos(segAngle) * stepLen;
        curY += Math.sin(segAngle) * stepLen;
        pts.push({ x: curX, y: curY });

        // Spawn high-voltage ionization sparks at arc knuckles
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

  // Spawn Ember sparks
  const spawnEmberBurst = useCallback((x: number, y: number) => {
    const emberColors = ["#ff5722", "#ff9800", "#ffc107", "#f5ead6"];
    for (let i = 0; i < 32; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 60 + Math.random() * 220;
      particles.current.push({
        type: "spark",
        x,
        y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - 60,
        size: 1.5 + Math.random() * 3.5,
        color: emberColors[Math.floor(Math.random() * emberColors.length)],
        alpha: 1,
        life: 0,
        maxLife: 0.7 + Math.random() * 0.5,
        gravity: 120,
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

      // Play matching Web Audio synthesized acoustic feedback
      sound.playClickForTheme(activeTheme);

      if (reducedMotion) return;

      if (activeTheme === "japanese") {
        spawnKatanaSlash(clientX, clientY);
      } else if (activeTheme === "minecraft") {
        spawnMinecraftBurst(clientX, clientY);
      } else if (activeTheme === "cyberpunk") {
        spawnElectricLightning(clientX, clientY);
      } else if (activeTheme === "ember") {
        spawnEmberBurst(clientX, clientY);
      } else if (activeTheme === "e33") {
        spawnPetalBurst(clientX, clientY);
      } else {
        // Standard clean ripple
        spawnEmberBurst(clientX, clientY);
      }
    };

    window.addEventListener("click", handleClick, { passive: true });
    return () => window.removeEventListener("click", handleClick);
  }, [activeTheme, reducedMotion, spawnKatanaSlash, spawnMinecraftBurst, spawnElectricLightning, spawnEmberBurst, spawnPetalBurst]);

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
        if (activeTheme === "japanese" && particles.current.length < 80) {
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
        } else if (activeTheme === "cyberpunk" && particles.current.length < 80) {
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
        } else if (activeTheme === "ember" && particles.current.length < 80) {
          particles.current.push({
            type: "spark",
            x: x + (Math.random() - 0.5) * 4,
            y: y + (Math.random() - 0.5) * 4,
            vx: (Math.random() - 0.5) * 20,
            vy: -15 - Math.random() * 30,
            size: 1.6 + Math.random() * 2,
            color: Math.random() > 0.5 ? "#c2553a" : "#e0a45c",
            alpha: 0.85,
            life: 0,
            maxLife: 0.5,
            gravity: -10,
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

  // Main Canvas Render Loop (Physics & Particles)
  useEffect(() => {
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
        slash.progress += dt * 3.5; // Fast sword slice (~280ms)

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
        ctx.lineWidth = 9 * (1 - t * 0.7);
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

        // High intensity cut flash in center
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

        const alpha = (1 - bolt.life / bolt.maxLife);
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.strokeStyle = bolt.color;
        ctx.lineWidth = 2.5 * alpha;
        ctx.lineCap = "round";
        ctx.lineJoin = "miter";
        ctx.shadowColor = bolt.color;
        ctx.shadowBlur = 12;
        ctx.globalAlpha = alpha;

        ctx.beginPath();
        bolt.points.forEach((pt, idx) => {
          if (idx === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        });
        ctx.stroke();

        // Core white streak
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

        // Update physics
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
          // Authentic Minecraft Block Voxel (drawn as isometric-accented 2D pixel square)
          ctx.translate(p.x, p.y);
          if (p.rotation !== undefined) ctx.rotate(p.rotation);
          const sz = p.size;
          ctx.fillStyle = p.color;
          ctx.fillRect(-sz / 2, -sz / 2, sz, sz);
          // 8-bit black border edge
          ctx.strokeStyle = "rgba(0,0,0,0.6)";
          ctx.lineWidth = 1.5;
          ctx.strokeRect(-sz / 2, -sz / 2, sz, sz);
          // Highlight edge on top-left
          ctx.fillStyle = "rgba(255,255,255,0.4)";
          ctx.fillRect(-sz / 2, -sz / 2, sz, 2);
          ctx.fillRect(-sz / 2, -sz / 2, 2, sz);
        } else if (p.type === "ink") {
          // Japanese Sumi-e droplet (smooth organic circular splat)
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * (1 - lifeFrac * 0.3), 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === "petal") {
          // Delicate rose petal ellipse
          ctx.translate(p.x, p.y);
          if (p.rotation !== undefined) ctx.rotate(p.rotation);
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size * 0.5, p.size, 0, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Spark (additive glowing point)
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
  }, []);

  return (
    <>
      {/* Hardware-accelerated canvas for slashes, lightning, and physics particles */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-[9998]"
      />

      {/* Custom DOM Cursor (only enabled when pointer is fine and hover is supported) */}
      {isPointerFine && (
        <div
          ref={cursorRef}
          aria-hidden="true"
          className="fixed top-0 left-0 pointer-events-none z-[9999] will-change-transform -translate-x-1/2 -translate-y-1/2"
        >
          {activeTheme === "japanese" && (
            <div className="relative flex items-center justify-center">
              {/* Katana Tsuba (Sword Guard) with crosshair and kanji */}
              <div
                className={`relative flex items-center justify-center transition-all duration-200 ${
                  isHoveringClickable ? "scale-125 rotate-45" : "scale-100 rotate-0"
                }`}
              >
                {/* Outer lacquer ring with sumi-e notches */}
                <div className="size-8 rounded-full border-2 border-[#d4af37]/80 bg-[#120f0e]/60 backdrop-blur-xs flex items-center justify-center shadow-[0_0_10px_rgba(201,58,43,0.35)]">
                  <div className="size-1.5 rounded-full bg-[#c93a2b] shadow-[0_0_6px_#c93a2b]" />
                </div>
                {/* Crosshair blade marks */}
                <div className="absolute top-0 bottom-0 w-px bg-[#d4af37]/70" />
                <div className="absolute left-0 right-0 h-px bg-[#d4af37]/70" />
              </div>
              {isHoveringClickable && (
                <div className="absolute left-6 -top-2 flex items-center gap-1 font-serif text-[11px] font-bold tracking-widest text-[#d4af37] bg-[#141210]/90 px-1.5 py-0.5 rounded border border-[#d4af37]/40 shadow-md whitespace-nowrap">
                  <span>斬</span>
                  {hoverLabel && <span className="text-[9px] text-[#ebe5d8]/80">{hoverLabel}</span>}
                </div>
              )}
            </div>
          )}

          {activeTheme === "minecraft" && (
            <div className="relative flex items-center justify-center select-none font-pixel">
              {/* Authentic Minecraft 8-bit Crosshair / Pickaxe Reticle */}
              <div
                className={`transition-transform duration-100 ${
                  isHoveringClickable ? "scale-125" : "scale-100"
                }`}
              >
                {/* 8-bit stepped crosshair: center hollow with 4 corner blocks */}
                <svg width="24" height="24" viewBox="0 0 24 24" className="drop-shadow-[0_2px_0_rgba(0,0,0,0.8)]">
                  {/* Top tick */}
                  <rect x="10" y="2" width="4" height="6" fill="#ffffff" />
                  <rect x="10" y="2" width="4" height="6" fill="none" stroke="#000000" strokeWidth="1" />
                  {/* Bottom tick */}
                  <rect x="10" y="16" width="4" height="6" fill="#ffffff" />
                  <rect x="10" y="16" width="4" height="6" fill="none" stroke="#000000" strokeWidth="1" />
                  {/* Left tick */}
                  <rect x="2" y="10" width="6" height="4" fill="#ffffff" />
                  <rect x="2" y="10" width="6" height="4" fill="none" stroke="#000000" strokeWidth="1" />
                  {/* Right tick */}
                  <rect x="16" y="10" width="6" height="4" fill="#ffffff" />
                  <rect x="16" y="10" width="6" height="4" fill="none" stroke="#000000" strokeWidth="1" />
                  {/* Center Dot if hovering */}
                  {isHoveringClickable && (
                    <rect x="10" y="10" width="4" height="4" fill="#4deeea" />
                  )}
                </svg>
              </div>
              {isHoveringClickable && (
                <div className="absolute left-6 -top-2 px-2 py-0.5 bg-[#100010] text-[#55ffff] border-2 border-[#2b0055] text-[10px] tracking-wider uppercase font-pixel shadow-[2px_2px_0_#000000] whitespace-nowrap">
                  ⛏ {hoverLabel || "Use"}
                </div>
              )}
            </div>
          )}

          {activeTheme === "cyberpunk" && (
            <div className="relative flex items-center justify-center font-mono">
              {/* Electric 100kV Reticle (Strictly NO blue, NO purple!) */}
              <div
                className={`relative flex items-center justify-center transition-all duration-150 ${
                  isHoveringClickable ? "scale-130 rotate-90" : "scale-100 rotate-0"
                }`}
              >
                {/* Diamond hazard brackets */}
                <div className="size-7 border border-[#ffe600] bg-[#0a0b08]/80 flex items-center justify-center shadow-[0_0_12px_rgba(255,230,0,0.6)]">
                  <div className="size-1.5 bg-[#39ff14] shadow-[0_0_8px_#39ff14]" />
                </div>
                {/* High voltage corner notches */}
                <div className="absolute -top-1 -left-1 size-2 border-t-2 border-l-2 border-[#ff7700]" />
                <div className="absolute -bottom-1 -right-1 size-2 border-b-2 border-r-2 border-[#ff7700]" />
              </div>
              {isHoveringClickable && (
                <div className="absolute left-6 -top-2 flex items-center gap-1.5 text-[10px] font-bold text-[#ffe600] bg-[#0a0b08] px-2 py-0.5 border border-[#ffe600] shadow-[0_0_8px_rgba(255,230,0,0.4)] whitespace-nowrap uppercase tracking-widest">
                  <span className="text-[#39ff14]">⚡</span>
                  <span>100kV</span>
                  {hoverLabel && <span className="text-[#ffffff]/80 font-normal">{hoverLabel}</span>}
                </div>
              )}
            </div>
          )}

          {activeTheme === "ember" && (
            <div className="relative flex items-center justify-center">
              {/* Ember reticle */}
              <div
                className={`relative flex items-center justify-center transition-transform duration-200 ${
                  isHoveringClickable ? "scale-125 rotate-45" : "scale-100 rotate-0"
                }`}
              >
                <div className="size-7 rounded-full border border-dashed border-[#e0a45c]/80 bg-[#17120f]/60 flex items-center justify-center shadow-[0_0_8px_rgba(194,85,58,0.4)]">
                  <div className="size-1.5 rounded-full bg-[#c2553a]" />
                </div>
              </div>
              {isHoveringClickable && (
                <div className="absolute left-6 -top-2 text-[10px] font-mono font-medium text-[#e0a45c] bg-[#17120f]/90 px-1.5 py-0.5 rounded border border-[#4a3a30] whitespace-nowrap">
                  jmp {hoverLabel || "Target"}
                </div>
              )}
            </div>
          )}

          {activeTheme === "e33" && (
            <div className="relative flex items-center justify-center">
              {/* Belle Epoque Petal */}
              <div
                className={`relative flex items-center justify-center transition-transform duration-300 ${
                  isHoveringClickable ? "scale-130 rotate-180" : "scale-100 rotate-0"
                }`}
              >
                <div className="size-6 rounded-full border border-[#e8d08a]/80 bg-[#07080d]/60 flex items-center justify-center shadow-[0_0_8px_rgba(217,69,63,0.35)]">
                  <div className="size-2 rounded-full bg-[#d9453f]" />
                </div>
              </div>
            </div>
          )}

          {(activeTheme === "dark" || activeTheme === "light" || !["japanese", "minecraft", "cyberpunk", "ember", "e33"].includes(activeTheme)) && (
            <div className="relative flex items-center justify-center">
              {/* Modern Minimalist Magnetic Dot & Halo */}
              <div
                className={`rounded-full transition-all duration-200 flex items-center justify-center ${
                  isHoveringClickable
                    ? "size-8 bg-foreground/15 border border-foreground/30 shadow-sm"
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

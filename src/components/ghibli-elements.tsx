"use client"

import React, { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────
 *  Atmospheric Cloud
 *  Soft, blurred radial-gradient orb that drifts
 *  across the viewport. No SVG, no hard edges.
 * ───────────────────────────────────────────── */
export function FloatingCloud({
  className,
  delay = 0,
  duration = 45,
  size = 260,
  opacity = 0.07,
}: {
  className?: string;
  delay?: number;
  duration?: number;
  size?: number;
  opacity?: number;
}) {
  return (
    <motion.div
      className={cn("absolute pointer-events-none", className)}
      style={{
        width: size,
        height: size * 0.55,
        borderRadius: "50%",
        background:
          "radial-gradient(ellipse at center, hsl(var(--ghibli-cloud-core) / var(--cloud-opacity-core, 0.45)) 0%, hsl(var(--ghibli-cloud-core) / var(--cloud-opacity-mid, 0.18)) 45%, transparent 70%)",
        filter: `blur(${size * 0.16}px)`,
        willChange: "transform",
      }}
      initial={{ x: "-120%" }}
      animate={{ x: "110vw" }}
      transition={{
        duration,
        repeat: Infinity,
        repeatType: "loop",
        ease: "linear",
        delay,
      }}
    />
  );
}

/* ─────────────────────────────────────────────
 *  Ethereal Spirit
 *  Glowing orb-body with a faint pulsing aura
 *  and two tiny luminous "eyes".
 *  Preserves identical dark-mode ethereal styling
 *  in both light mode and dark mode.
 * ───────────────────────────────────────────── */
export function GhibliSpirit({
  className,
  delay = 0,
  duration = 5,
}: {
  className?: string;
  delay?: number;
  duration?: number;
}) {
  return (
    <motion.div
      className={cn("pointer-events-none select-none", className)}
      animate={{ y: [0, -9, 0] }}
      transition={{
        duration,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
        delay,
      }}
    >
      {/* Outer aura glow */}
      <div
        className="spirit-aura absolute inset-0"
        style={{
          width: 44,
          height: 58,
          borderRadius: "50% 50% 45% 45%",
          background:
            "radial-gradient(ellipse at 50% 35%, hsla(210, 30%, 75%, 0.5) 0%, hsla(220, 20%, 60%, 0.2) 40%, transparent 70%)",
          filter: "blur(8px)",
          opacity: 0.5,
        }}
      />

      {/* Body: tapered luminous shape */}
      <div
        style={{
          position: "relative",
          width: 30,
          height: 44,
          margin: "0 auto",
        }}
      >
        {/* Head orb */}
        <div
          style={{
            width: 18,
            height: 18,
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 50% 45%, hsl(210, 15%, 85%) 0%, hsl(220, 10%, 60%) 80%)",
            margin: "0 auto",
            position: "relative",
            boxShadow: "0 0 12px 3px hsla(210, 30%, 75%, 0.3)",
          }}
        >
          {/* Left eye */}
          <div
            style={{
              position: "absolute",
              width: 3,
              height: 4,
              borderRadius: "50%",
              background: "hsl(0, 0%, 10%)",
              top: 7,
              left: 4,
              boxShadow: "0 0 4px 1px hsla(0, 0%, 10%, 0.6)",
            }}
          />
          {/* Right eye */}
          <div
            style={{
              position: "absolute",
              width: 3,
              height: 4,
              borderRadius: "50%",
              background: "hsl(0, 0%, 10%)",
              top: 7,
              right: 4,
              boxShadow: "0 0 4px 1px hsla(0, 0%, 10%, 0.6)",
            }}
          />
        </div>

        {/* Body taper */}
        <div
          style={{
            width: 16,
            height: 26,
            margin: "-4px auto 0",
            borderRadius: "40% 40% 50% 50%",
            background:
              "linear-gradient(to bottom, hsl(210, 15%, 85%) 0%, hsla(220, 10%, 60%, 0.4) 80%, transparent 100%)",
            filter: "blur(1px)",
          }}
        />
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
 *  Static Star Field
 *  Generates a dense pattern of tiny dots via
 *  CSS box-shadow on a single 1px element.
 *  Much more performant than individual elements.
 * ───────────────────────────────────────────── */
function useStarField(count: number, seed: number = 42, colorMode: "dark" | "light" = "dark") {
  return useMemo(() => {
    // Deterministic pseudo-random for SSR consistency
    let s = seed;
    const rand = () => {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };

    const shadows: string[] = [];
    for (let i = 0; i < count; i++) {
      const x = Math.round(rand() * 2560);
      const y = Math.round(rand() * 1440);
      const alpha = (rand() * 0.6 + 0.1).toFixed(2);
      const size = rand() > 0.92 ? 1.5 : rand() > 0.7 ? 1 : 0.5;

      if (colorMode === "light") {
        // Slate stars for light mode (slate-500/600 with clean crisp definition)
        const slateAlpha = (parseFloat(alpha) * 0.8 + 0.15).toFixed(2);
        shadows.push(
          `${x}px ${y}px 0 ${size}px rgba(71, 85, 105, ${slateAlpha})`
        );
      } else {
        shadows.push(
          `${x}px ${y}px 0 ${size}px rgba(255,255,255,${alpha})`
        );
      }
    }
    return shadows.join(", ");
  }, [count, seed, colorMode]);
}

function StarField() {
  const darkShadows = useStarField(180, 42, "dark");
  const lightShadows = useStarField(180, 42, "light");

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
    >
      {/* Dark mode stars */}
      <div
        className="hidden dark:block"
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          borderRadius: "50%",
          boxShadow: darkShadows,
          top: 0,
          left: 0,
        }}
      />
      {/* Light mode slate stars */}
      <div
        className="block dark:hidden"
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          borderRadius: "50%",
          boxShadow: lightShadows,
          top: 0,
          left: 0,
        }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────
 *  Twinkling Stars Layer
 *  A few stars that subtly pulse in brightness
 * ───────────────────────────────────────────── */
function TwinklingStars({ count = 14 }: { count?: number }) {
  const stars = useMemo(() => {
    const items: Array<{
      x: number;
      y: number;
      size: number;
      delay: number;
      duration: number;
    }> = [];
    for (let i = 0; i < count; i++) {
      items.push({
        x: Math.random() * 100,
        y: Math.random() * 80,
        size: Math.random() * 2 + 1,
        delay: Math.random() * 5,
        duration: Math.random() * 3 + 2,
      });
    }
    return items;
  }, [count]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {stars.map((star, i) => (
        <React.Fragment key={i}>
          {/* Dark mode twinkling star */}
          <motion.div
            className="hidden dark:block absolute rounded-full"
            style={{
              width: star.size,
              height: star.size,
              left: `${star.x}%`,
              top: `${star.y}%`,
              background: "white",
              boxShadow: `0 0 ${star.size * 3}px ${star.size}px rgba(200,220,255,0.4)`,
            }}
            animate={{ opacity: [0.3, 0.9, 0.3] }}
            transition={{
              duration: star.duration,
              repeat: Infinity,
              delay: star.delay,
              ease: "easeInOut",
            }}
          />
          {/* Light mode twinkling slate star */}
          <motion.div
            className="block dark:hidden absolute rounded-full"
            style={{
              width: star.size,
              height: star.size,
              left: `${star.x}%`,
              top: `${star.y}%`,
              background: "rgb(71, 85, 105)",
              boxShadow: `0 0 ${star.size * 3}px ${star.size}px rgba(100,116,139,0.4)`,
            }}
            animate={{ opacity: [0.35, 0.95, 0.35] }}
            transition={{
              duration: star.duration,
              repeat: Infinity,
              delay: star.delay,
              ease: "easeInOut",
            }}
          />
        </React.Fragment>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
 *  Subtle Atmospheric Gradient Haze
 *  Very faint color washes for depth
 * ───────────────────────────────────────────── */
function AtmosphericHaze() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Top-right wash: subtle sapphire/slate in light, cool navy in dark */}
      <div
        className="absolute -top-[10%] -right-[5%] w-[50%] h-[50%] rounded-full blur-[70px] transition-colors duration-500 bg-sky-200/35 dark:bg-[hsla(220,40%,30%,0.08)]"
      />
      {/* Bottom-left wash: soft warm slate in light, subtle purple-gray in dark */}
      <div
        className="absolute -bottom-[15%] -left-[10%] w-[45%] h-[45%] rounded-full blur-[80px] transition-colors duration-500 bg-slate-200/30 dark:bg-[hsla(260,30%,25%,0.06)]"
      />
    </div>
  );
}

/* ─────────────────────────────────────────────
 *  Cloud Pool (internal helper)
 * ───────────────────────────────────────────── */
function CloudPool({ index }: { index: number }) {
  const cloudPatterns = [
    { className: "top-[8%]", delay: 0, duration: 50, size: 320, opacity: 0.08 },
    { className: "top-[4%]", delay: 12, duration: 60, size: 240, opacity: 0.09 },
    { className: "top-[14%]", delay: 5, duration: 42, size: 200, opacity: 0.07 },
    { className: "top-[20%]", delay: 25, duration: 55, size: 280, opacity: 0.06 },
  ];

  const pattern = cloudPatterns[index % cloudPatterns.length];
  return (
    <FloatingCloud
      className={pattern.className}
      delay={pattern.delay}
      duration={pattern.duration}
      size={pattern.size}
      opacity={pattern.opacity}
    />
  );
}

/* ─────────────────────────────────────────────
 *  Main Background Composition
 * ───────────────────────────────────────────── */
export function GhibliSkyBackground() {
  const [isVisible, setIsVisible] = useState(true);
  const CLOUD_COUNT = 4;

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(document.visibilityState === "visible");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Layer 0: Static star field */}
      <StarField />

      {/* Layer 1: Twinkling stars */}
      <TwinklingStars count={14} />

      {/* Layer 2: Atmospheric haze */}
      <AtmosphericHaze />

      {/* Layer 3: Drifting clouds */}
      <AnimatePresence>
        {isVisible && (
          <>
            {Array.from({ length: CLOUD_COUNT }).map((_, index) => (
              <CloudPool key={index} index={index} />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Layer 4: Ethereal spirits positioned on opposite sides and staggered heights (not on same line) */}
      <GhibliSpirit
        className="absolute top-[18%] sm:top-[22%] left-4 sm:left-8 md:left-12 lg:left-16 xl:left-24"
        duration={5.2}
        delay={0}
      />
      <GhibliSpirit
        className="absolute top-[50%] sm:top-[54%] right-4 sm:right-8 md:right-12 lg:right-16 xl:right-24 scale-90"
        duration={6.2}
        delay={1.8}
      />
    </div>
  );
}
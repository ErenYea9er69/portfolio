"use client"

import React, { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
      className={`absolute pointer-events-none ${className}`}
      style={{
        width: size,
        height: size * 0.55,
        borderRadius: "50%",
        background:
          "radial-gradient(ellipse at center, hsl(var(--ghibli-cloud-core)) 0%, transparent 70%)",
        filter: `blur(${size * 0.18}px)`,
        opacity,
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
 *  and two tiny luminous "eyes". No cartoon SVG.
 * ───────────────────────────────────────────── */
export function GhibliSpirit({ className }: { className?: string }) {
  return (
    <motion.div
      className={`${className} relative`}
      animate={{ y: [0, -8, 0] }}
      transition={{
        duration: 5,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
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
            "radial-gradient(ellipse at 50% 35%, hsl(var(--spirit-glow-core)) 0%, hsl(var(--spirit-glow-mid)) 40%, transparent 70%)",
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
              "radial-gradient(circle at 50% 45%, hsl(var(--spirit-body-bright)) 0%, hsl(var(--spirit-body-dim)) 80%)",
            margin: "0 auto",
            position: "relative",
            boxShadow: "0 0 12px 3px hsl(var(--spirit-glow-core) / 0.3)",
          }}
        >
          {/* Left eye */}
          <div
            style={{
              position: "absolute",
              width: 3,
              height: 4,
              borderRadius: "50%",
              background: "hsl(var(--spirit-eye))",
              top: 7,
              left: 4,
              boxShadow: "0 0 4px 1px hsl(var(--spirit-eye) / 0.6)",
            }}
          />
          {/* Right eye */}
          <div
            style={{
              position: "absolute",
              width: 3,
              height: 4,
              borderRadius: "50%",
              background: "hsl(var(--spirit-eye))",
              top: 7,
              right: 4,
              boxShadow: "0 0 4px 1px hsl(var(--spirit-eye) / 0.6)",
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
              "linear-gradient(to bottom, hsl(var(--spirit-body-bright)) 0%, hsl(var(--spirit-body-dim) / 0.4) 80%, transparent 100%)",
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
function useStarField(count: number, seed: number = 42) {
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
      shadows.push(
        `${x}px ${y}px 0 ${size}px rgba(255,255,255,${alpha})`
      );
    }
    return shadows.join(", ");
  }, [count, seed]);
}

function StarField() {
  const shadows = useStarField(180);

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ overflow: "hidden" }}
    >
      <div
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          borderRadius: "50%",
          boxShadow: shadows,
          // tile the field across viewport
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
function TwinklingStars({ count = 12 }: { count?: number }) {
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
        <motion.div
          key={i}
          className="absolute rounded-full"
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
      {/* Top-right cool wash */}
      <div
        style={{
          position: "absolute",
          top: "-10%",
          right: "-5%",
          width: "50%",
          height: "50%",
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse at center, hsla(220, 40%, 30%, 0.08) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />
      {/* Bottom-left warm wash */}
      <div
        style={{
          position: "absolute",
          bottom: "-15%",
          left: "-10%",
          width: "45%",
          height: "45%",
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse at center, hsla(260, 30%, 25%, 0.06) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────
 *  Cloud Pool (internal helper)
 * ───────────────────────────────────────────── */
function CloudPool({ index }: { index: number }) {
  const cloudPatterns = [
    { className: "top-[8%]", delay: 0, duration: 50, size: 300, opacity: 0.06 },
    { className: "top-[4%]", delay: 12, duration: 60, size: 220, opacity: 0.08 },
    { className: "top-[14%]", delay: 5, duration: 42, size: 180, opacity: 0.05 },
    { className: "top-[20%]", delay: 25, duration: 55, size: 260, opacity: 0.04 },
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

      {/* Layer 4: Ethereal spirits */}
      <GhibliSpirit className="absolute top-[20%] right-[15%]" />
      <GhibliSpirit className="absolute bottom-[30%] left-[10%] scale-75" />
    </div>
  );
}
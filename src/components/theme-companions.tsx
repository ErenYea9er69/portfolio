"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CompanionProps {
  className?: string;
  delay?: number;
  duration?: number;
}

/* ─────────────────────────────────────────────────────────
 *  1. JAPANESE THEME COMPANIONS (提灯 & 狐面)
 * ───────────────────────────────────────────────────────── */

/** Japanese Chochin Paper Lantern with flickering warm flame */
export function JapaneseChochinLantern({
  className,
  delay = 0,
  duration = 5.4,
}: CompanionProps) {
  return (
    <motion.div
      className={cn("pointer-events-none select-none drop-shadow-xl", className)}
      animate={{
        y: [0, -10, 0],
        rotate: [-1.8, 1.8, -1.8],
      }}
      transition={{
        duration,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
        delay,
      }}
    >
      <svg
        width="56"
        height="84"
        viewBox="0 0 56 84"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
      >
        <defs>
          <filter id="lanternGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="flameGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="0.9" />
            <stop offset="40%" stopColor="#f59e0b" stopOpacity="0.6" />
            <stop offset="80%" stopColor="#c93a2b" stopOpacity="0.2" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="lanternPaper" x1="0" y1="18" x2="56" y2="62" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#e11d48" />
            <stop offset="35%" stopColor="#c93a2b" />
            <stop offset="70%" stopColor="#991b1b" />
            <stop offset="100%" stopColor="#7f1d1d" />
          </linearGradient>
        </defs>

        {/* Ambient warm lantern aura */}
        <ellipse cx="28" cy="42" rx="26" ry="32" fill="url(#flameGlow)" opacity="0.6" />

        {/* Top hanging wire */}
        <path d="M28 2 V 12" stroke="#d4af37" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="28" cy="2" r="2.5" fill="#d4af37" stroke="#1c1917" strokeWidth="1" />

        {/* Top Wooden Kubi (Black & Gold collar) */}
        <rect x="18" y="12" width="20" height="4.5" rx="1.5" fill="#1c1917" stroke="#d4af37" strokeWidth="1" />

        {/* Lantern Paper Body */}
        <ellipse cx="28" cy="40" rx="20" ry="24" fill="url(#lanternPaper)" stroke="#450a0a" strokeWidth="1.2" />

        {/* Traditional Ribbing Rings (Take-higo) */}
        <path d="M10 30 Q 28 35 46 30" stroke="#7f1d1d" strokeWidth="1.2" fill="none" opacity="0.8" />
        <path d="M8 40 Q 28 46 48 40" stroke="#7f1d1d" strokeWidth="1.2" fill="none" opacity="0.8" />
        <path d="M10 50 Q 28 55 46 50" stroke="#7f1d1d" strokeWidth="1.2" fill="none" opacity="0.8" />

        {/* Inner Candle Glow Flame Core */}
        <circle cx="28" cy="40" r="7" fill="#fef08a" opacity="0.85" filter="url(#lanternGlow)" />

        {/* Kanji Calligraphy (和 - Harmony) */}
        <text
          x="28"
          y="45"
          fill="#d4af37"
          fontFamily="'EB Garamond', serif"
          fontSize="17"
          fontWeight="700"
          textAnchor="middle"
          opacity="0.95"
          filter="drop-shadow(0 0 2px rgba(0,0,0,0.6))"
        >
          和
        </text>

        {/* Bottom Wooden Sokoban */}
        <rect x="20" y="62" width="16" height="4.5" rx="1.5" fill="#1c1917" stroke="#d4af37" strokeWidth="1" />

        {/* Hanging Silk Tassel with bead */}
        <circle cx="28" cy="68" r="2" fill="#d4af37" />
        <path d="M28 70 L 26 83 M28 70 L 28 84 M28 70 L 30 83" stroke="#c93a2b" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </motion.div>
  );
}

/** Japanese Kitsune Sacred Fox Spirit Mask */
export function JapaneseKitsuneMask({
  className,
  delay = 1.2,
  duration = 6.0,
}: CompanionProps) {
  return (
    <motion.div
      className={cn("pointer-events-none select-none drop-shadow-xl", className)}
      animate={{
        y: [0, -8, 0],
        rotate: [2.5, -2.5, 2.5],
      }}
      transition={{
        duration,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
        delay,
      }}
    >
      <svg
        width="54"
        height="64"
        viewBox="0 0 54 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
      >
        <defs>
          <filter id="sakuraAura" x="-25%" y="-25%" width="150%" height="150%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Soft Sakura Spirit Aura Glow */}
        <ellipse cx="27" cy="32" rx="24" ry="26" fill="#f43f5e" opacity="0.22" filter="url(#sakuraAura)" />

        {/* Mask Ears */}
        {/* Left Ear */}
        <path d="M12 26 L 8 4 L 22 18 Z" fill="#fafaf9" stroke="#e7e5e4" strokeWidth="1" />
        <path d="M11 22 L 9 8 L 19 18 Z" fill="#c93a2b" />
        {/* Right Ear */}
        <path d="M42 26 L 46 4 L 32 18 Z" fill="#fafaf9" stroke="#e7e5e4" strokeWidth="1" />
        <path d="M43 22 L 45 8 L 35 18 Z" fill="#c93a2b" />

        {/* Porcelain Face Shape */}
        <path
          d="M10 24 C 6 36, 16 54, 27 58 C 38 54, 48 36, 44 24 C 40 16, 14 16, 10 24 Z"
          fill="#fafaf9"
          stroke="#d6d3d1"
          strokeWidth="1.2"
        />

        {/* Forehead Sacred Sun Emblem (Vermilion Crimson) */}
        <circle cx="27" cy="22" r="3.2" fill="#c93a2b" />
        <path d="M27 15 L 27 18" stroke="#c93a2b" strokeWidth="1.5" strokeLinecap="round" />

        {/* Fox Slanted Eyes with Crimson Eye Markings (隈取) */}
        {/* Left Eye */}
        <path d="M14 34 Q 19 28 24 33" stroke="#c93a2b" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        <path d="M16 35 Q 20 32 23 35" stroke="#1c1917" strokeWidth="1.6" strokeLinecap="round" fill="none" />
        {/* Right Eye */}
        <path d="M40 34 Q 35 28 30 33" stroke="#c93a2b" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        <path d="M38 35 Q 34 32 31 35" stroke="#1c1917" strokeWidth="1.6" strokeLinecap="round" fill="none" />

        {/* Nose & Whiskers */}
        <path d="M27 44 L 25 41 H 29 Z" fill="#1c1917" />
        <path d="M13 41 Q 17 43 20 45" stroke="#c93a2b" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M41 41 Q 37 43 34 45" stroke="#c93a2b" strokeWidth="1.2" strokeLinecap="round" />

        {/* Shinto Ear Tassel with Golden Bell (Suzu) */}
        <path d="M8 26 Q 4 38 7 48" stroke="#c93a2b" strokeWidth="1.4" fill="none" strokeDasharray="3 2" />
        <circle cx="7" cy="50" r="3.2" fill="#d4af37" stroke="#947829" strokeWidth="0.8" />
        <path d="M7 53 V 60" stroke="#c93a2b" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
 *  2. MINECRAFT THEME COMPANIONS (Allay & Soul Lantern)
 * ───────────────────────────────────────────────────────── */

/** Minecraft 8-Bit Pixel Allay Floating Companion */
export function MinecraftAllay({
  className,
  delay = 0,
  duration = 4.8,
}: CompanionProps) {
  return (
    <motion.div
      className={cn("pointer-events-none select-none drop-shadow-xl", className)}
      animate={{
        y: [0, -9, 0],
        x: [0, 4, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
        delay,
      }}
    >
      <div className="relative">
        {/* Cyan Ambient Pixel Glow */}
        <div className="absolute -inset-2 rounded-full bg-[#4deeea]/25 blur-md" />

        <svg
          width="48"
          height="54"
          viewBox="0 0 16 18"
          shapeRendering="crispEdges"
          className="overflow-visible relative"
        >
          {/* Animated Pixel Wings (Flutter cycle) */}
          <motion.g
            animate={{ scaleX: [1, 0.45, 1], scaleY: [1, 1.15, 1] }}
            transition={{ duration: 0.35, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformOrigin: "8px 9px" }}
          >
            {/* Left Wing (Translucent Diamond Glass) */}
            <rect x="0" y="5" width="4" height="6" fill="#7fffff" fillOpacity="0.75" />
            <rect x="1" y="4" width="3" height="1" fill="#ffffff" fillOpacity="0.9" />
            <rect x="1" y="11" width="2" height="1" fill="#2bc5be" fillOpacity="0.6" />

            {/* Right Wing */}
            <rect x="12" y="5" width="4" height="6" fill="#7fffff" fillOpacity="0.75" />
            <rect x="12" y="4" width="3" height="1" fill="#ffffff" fillOpacity="0.9" />
            <rect x="13" y="11" width="2" height="1" fill="#2bc5be" fillOpacity="0.6" />
          </motion.g>

          {/* Allay Head (Cyan Block) */}
          <rect x="5" y="2" width="6" height="5" fill="#4deeea" />
          <rect x="6" y="1" width="4" height="1" fill="#7fffff" />
          <rect x="5" y="6" width="6" height="1" fill="#2bc5be" />

          {/* Allay Eyes */}
          <rect x="6" y="4" width="1" height="2" fill="#002244" />
          <rect x="6" y="4" width="1" height="1" fill="#ffffff" />
          <rect x="9" y="4" width="1" height="2" fill="#002244" />
          <rect x="9" y="4" width="1" height="1" fill="#ffffff" />

          {/* Body */}
          <rect x="6" y="7" width="4" height="5" fill="#2bc5be" />
          <rect x="7" y="7" width="2" height="4" fill="#4deeea" />

          {/* Held Glowing Amethyst / Diamond Shard */}
          <rect x="7" y="11" width="2" height="2" fill="#ffffff" />
          <rect x="7.5" y="10.5" width="1" height="1" fill="#7fffff" />

          {/* Lower Floating Taper (Tail) */}
          <rect x="7" y="12" width="2" height="3" fill="#0e4a47" />
          <rect x="7.5" y="15" width="1" height="2" fill="#4deeea" fillOpacity="0.6" />
        </svg>
      </div>
    </motion.div>
  );
}

/** Minecraft 8-Bit Pixel Soul Lantern Companion */
export function MinecraftSoulLantern({
  className,
  delay = 1.5,
  duration = 5.2,
}: CompanionProps) {
  return (
    <motion.div
      className={cn("pointer-events-none select-none drop-shadow-xl", className)}
      animate={{
        y: [0, -8, 0],
        rotate: [-2.5, 2.5, -2.5],
      }}
      transition={{
        duration,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
        delay,
      }}
      style={{ transformOrigin: "top center" }}
    >
      <div className="relative">
        <div className="absolute -inset-2 rounded-full bg-[#4deeea]/20 blur-md" />

        <svg
          width="48"
          height="58"
          viewBox="0 0 16 20"
          shapeRendering="crispEdges"
          className="overflow-visible relative"
        >
          {/* Iron Chain Link Top */}
          <rect x="7" y="0" width="2" height="2" fill="#262626" />
          <rect x="6" y="2" width="4" height="1" fill="#3a3a3a" />

          {/* Lantern Iron Roof (Tiered) */}
          <rect x="5" y="3" width="6" height="1" fill="#1c1917" />
          <rect x="4" y="4" width="8" height="1" fill="#292524" />
          <rect x="3" y="5" width="10" height="1" fill="#44403c" />

          {/* Lantern Frame Corners */}
          <rect x="3" y="6" width="2" height="7" fill="#1c1917" />
          <rect x="11" y="6" width="2" height="7" fill="#1c1917" />

          {/* Soul Flame Core (Cyan Glow) */}
          <rect x="5" y="6" width="6" height="7" fill="#092f38" fillOpacity="0.5" />
          <rect x="6" y="8" width="4" height="4" fill="#4deeea" />
          <rect x="7" y="9" width="2" height="2" fill="#ffffff" />
          <rect x="6" y="7" width="2" height="1" fill="#7fffff" />
          <rect x="8" y="11" width="2" height="1" fill="#2bc5be" />

          {/* Bottom Iron Base */}
          <rect x="3" y="13" width="10" height="1" fill="#44403c" />
          <rect x="4" y="14" width="8" height="1" fill="#292524" />
          <rect x="5" y="15" width="6" height="1" fill="#1c1917" />
        </svg>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
 *  3. 100kV CYBERPUNK COMPANIONS (Militech Drone & Voltek Buoy)
 *  Strictly NO blue, NO purple!
 *  Palette: Hazard Yellow #ffe600, Toxic Green #39ff14, Hazard Orange #ff7700, Carbon #090a07
 * ───────────────────────────────────────────────────────── */

/** Militech Tactical Recon Drone with Sweeping Laser Cone */
export function CyberpunkReconDrone({
  className,
  delay = 0,
  duration = 4.2,
}: CompanionProps) {
  return (
    <motion.div
      className={cn("pointer-events-none select-none drop-shadow-xl", className)}
      animate={{
        y: [0, -7, 0],
        x: [0, 3, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
        delay,
      }}
    >
      <div className="relative">
        <svg
          width="64"
          height="52"
          viewBox="0 0 64 52"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="overflow-visible"
        >
          <defs>
            <filter id="neonGreenGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="scanBeam" x1="32" y1="28" x2="16" y2="52" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#39ff14" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#39ff14" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Sweeping Conical Laser Scanner */}
          <polygon points="32,28 10,50 40,50" fill="url(#scanBeam)" />

          {/* Left Spinning Rotor */}
          <motion.ellipse
            cx="14"
            cy="12"
            rx="12"
            ry="2.5"
            stroke="#ffe600"
            strokeWidth="1.2"
            opacity="0.85"
            animate={{ scaleX: [1, 0.2, 1] }}
            transition={{ duration: 0.12, repeat: Infinity }}
          />
          <circle cx="14" cy="12" r="2" fill="#ffe600" />
          <line x1="14" y1="12" x2="22" y2="18" stroke="#ff7700" strokeWidth="1.5" />

          {/* Right Spinning Rotor */}
          <motion.ellipse
            cx="50"
            cy="12"
            rx="12"
            ry="2.5"
            stroke="#ffe600"
            strokeWidth="1.2"
            opacity="0.85"
            animate={{ scaleX: [1, 0.2, 1] }}
            transition={{ duration: 0.12, repeat: Infinity, delay: 0.06 }}
          />
          <circle cx="50" cy="12" r="2" fill="#ffe600" />
          <line x1="50" y1="12" x2="42" y2="18" stroke="#ff7700" strokeWidth="1.5" />

          {/* Carbon Obsidian Chassis */}
          <path
            d="M20 18 H 44 L 48 28 L 32 34 L 16 28 Z"
            fill="#090a07"
            stroke="#ffe600"
            strokeWidth="1.6"
          />

          {/* Hazard Yellow Caution Stripes */}
          <path d="M22 20 L 26 26" stroke="#ffe600" strokeWidth="1.5" />
          <path d="M28 20 L 32 26" stroke="#ffe600" strokeWidth="1.5" />
          <path d="M38 20 L 42 26" stroke="#ffe600" strokeWidth="1.5" />

          {/* Toxic Green Center Optic Eye Lens (Active Sensor) */}
          <circle cx="32" cy="27" r="4" fill="#39ff14" filter="url(#neonGreenGlow)" />
          <circle cx="32" cy="27" r="1.5" fill="#ffffff" />

          {/* Micro HUD Status Text */}
          <text
            x="32"
            y="42"
            fill="#ffe600"
            fontFamily="monospace"
            fontSize="7"
            fontWeight="700"
            textAnchor="middle"
            letterSpacing="0.1em"
          >
            100kV
          </text>
        </svg>
      </div>
    </motion.div>
  );
}

/** Voltek Industrial High-Voltage Telemetry Buoy */
export function CyberpunkRelayBuoy({
  className,
  delay = 1.6,
  duration = 5.0,
}: CompanionProps) {
  return (
    <motion.div
      className={cn("pointer-events-none select-none drop-shadow-xl", className)}
      animate={{
        y: [0, -8, 0],
        rotate: [3, -3, 3],
      }}
      transition={{
        duration,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
        delay,
      }}
    >
      <div className="relative">
        <svg
          width="54"
          height="62"
          viewBox="0 0 54 62"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="overflow-visible"
        >
          <defs>
            <filter id="yellowCoreGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Orbiting Induction Ring */}
          <motion.ellipse
            cx="27"
            cy="31"
            rx="24"
            ry="7"
            stroke="#ff7700"
            strokeWidth="1.4"
            strokeDasharray="4 4"
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: "27px 31px" }}
          />

          {/* Hexagonal Industrial Buoy Shell */}
          <polygon
            points="27,10 42,18 42,44 27,52 12,44 12,18"
            fill="#090a07"
            stroke="#ffe600"
            strokeWidth="1.8"
          />

          {/* Hazard Orange Corner Bumpers */}
          <path d="M12 24 V 18 H 18" stroke="#ff7700" strokeWidth="2.4" />
          <path d="M42 24 V 18 H 36" stroke="#ff7700" strokeWidth="2.4" />
          <path d="M12 38 V 44 H 18" stroke="#ff7700" strokeWidth="2.4" />
          <path d="M42 38 V 44 H 36" stroke="#ff7700" strokeWidth="2.4" />

          {/* Central High-Voltage Core Node */}
          <rect
            x="22"
            y="26"
            width="10"
            height="10"
            transform="rotate(45 27 31)"
            fill="#ffe600"
            stroke="#ffffff"
            strokeWidth="1"
            filter="url(#yellowCoreGlow)"
          />

          {/* High Voltage Lightning Glyph in Core */}
          <path d="M28 27 L 25 31 H 29 L 26 35" stroke="#090a07" strokeWidth="1.4" strokeLinecap="round" />

          {/* Top Antenna Pin */}
          <line x1="27" y1="10" x2="27" y2="3" stroke="#ffe600" strokeWidth="1.5" />
          <circle cx="27" cy="3" r="1.8" fill="#39ff14" />
        </svg>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
 *  4. EXPEDITION 33 COMPANIONS (Clockwork Butterfly & Astrolabe)
 * ───────────────────────────────────────────────────────── */

/** Belle Époque Clockwork Brass Butterfly */
export function Expedition33Butterfly({
  className,
  delay = 0,
  duration = 5.4,
}: CompanionProps) {
  return (
    <motion.div
      className={cn("pointer-events-none select-none drop-shadow-xl", className)}
      animate={{
        y: [0, -11, 0],
        x: [0, -4, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
        delay,
      }}
    >
      <div className="relative">
        {/* Soft Golden Dust Aura */}
        <div className="absolute -inset-2 rounded-full bg-[#e8d08a]/20 blur-md" />

        <svg
          width="58"
          height="50"
          viewBox="0 0 58 50"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="overflow-visible"
        >
          <defs>
            <linearGradient id="carmineWing" x1="0" y1="0" x2="26" y2="26" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="40%" stopColor="#d9453f" />
              <stop offset="100%" stopColor="#881337" />
            </linearGradient>
          </defs>

          {/* Fluttering Left Wing Pair */}
          <motion.g
            animate={{ scaleX: [1, 0.4, 1] }}
            transition={{ duration: 0.4, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformOrigin: "29px 25px" }}
          >
            {/* Upper Left Wing */}
            <path
              d="M29 22 C 22 8, 8 6, 4 16 C 2 24, 16 30, 29 25 Z"
              fill="url(#carmineWing)"
              stroke="#e8d08a"
              strokeWidth="1.2"
            />
            {/* Wing Gold Filigree Veins */}
            <path d="M29 22 Q 16 16 7 17" stroke="#e8d08a" strokeWidth="0.8" opacity="0.85" />
            <path d="M29 24 Q 18 24 10 26" stroke="#e8d08a" strokeWidth="0.8" opacity="0.85" />

            {/* Lower Left Wing */}
            <path
              d="M29 26 C 20 28, 12 36, 16 44 C 20 48, 26 40, 29 32 Z"
              fill="url(#carmineWing)"
              stroke="#e8d08a"
              strokeWidth="1.2"
            />
          </motion.g>

          {/* Fluttering Right Wing Pair */}
          <motion.g
            animate={{ scaleX: [1, 0.4, 1] }}
            transition={{ duration: 0.4, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformOrigin: "29px 25px" }}
          >
            {/* Upper Right Wing */}
            <path
              d="M29 22 C 36 8, 50 6, 54 16 C 56 24, 42 30, 29 25 Z"
              fill="url(#carmineWing)"
              stroke="#e8d08a"
              strokeWidth="1.2"
            />
            {/* Wing Gold Filigree Veins */}
            <path d="M29 22 Q 42 16 51 17" stroke="#e8d08a" strokeWidth="0.8" opacity="0.85" />
            <path d="M29 24 Q 40 24 48 26" stroke="#e8d08a" strokeWidth="0.8" opacity="0.85" />

            {/* Lower Right Wing */}
            <path
              d="M29 26 C 38 28, 46 36, 42 44 C 38 48, 32 40, 29 32 Z"
              fill="url(#carmineWing)"
              stroke="#e8d08a"
              strokeWidth="1.2"
            />
          </motion.g>

          {/* Central Clockwork Body & Gears (Gilded Brass) */}
          <ellipse cx="29" cy="26" rx="2.4" ry="11" fill="#d4af37" stroke="#947829" strokeWidth="0.8" />
          <circle cx="29" cy="18" r="2.8" fill="#fef08a" stroke="#d4af37" strokeWidth="0.8" />

          {/* Curved Filigree Antennae */}
          <path d="M29 16 Q 24 10 20 12" stroke="#e8d08a" strokeWidth="1" strokeLinecap="round" fill="none" />
          <path d="M29 16 Q 34 10 38 12" stroke="#e8d08a" strokeWidth="1" strokeLinecap="round" fill="none" />
          <circle cx="20" cy="12" r="1.2" fill="#d9453f" />
          <circle cx="38" cy="12" r="1.2" fill="#d9453f" />
        </svg>
      </div>
    </motion.div>
  );
}

/** Celestial Chronos Astrolabe with Concentric Rotating Rings */
export function Expedition33Astrolabe({
  className,
  delay = 1.4,
  duration = 6.2,
}: CompanionProps) {
  return (
    <motion.div
      className={cn("pointer-events-none select-none drop-shadow-xl", className)}
      animate={{
        y: [0, -8, 0],
        rotate: [-2, 2, -2],
      }}
      transition={{
        duration,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
        delay,
      }}
    >
      <div className="relative">
        <svg
          width="56"
          height="56"
          viewBox="0 0 56 56"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="overflow-visible"
        >
          {/* Outer Roman Numeral Ring (Slow clockwise) */}
          <motion.circle
            cx="28"
            cy="28"
            r="24"
            stroke="#e8d08a"
            strokeWidth="1.4"
            strokeDasharray="4 3"
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: "28px 28px" }}
          />

          {/* Middle Gear Ring (Counter-clockwise) */}
          <motion.circle
            cx="28"
            cy="28"
            r="17"
            stroke="#d4af37"
            strokeWidth="1.2"
            strokeDasharray="2 4"
            animate={{ rotate: -360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: "28px 28px" }}
          />

          {/* Inner Astrolabe Pointer Arm */}
          <line x1="28" y1="28" x2="28" y2="12" stroke="#e8d08a" strokeWidth="1.6" strokeLinecap="round" />
          <line x1="28" y1="28" x2="40" y2="28" stroke="#d9453f" strokeWidth="1.4" strokeLinecap="round" />

          {/* Center Ruby Chronos Jewel */}
          <circle cx="28" cy="28" r="4.2" fill="#d9453f" stroke="#e8d08a" strokeWidth="1.2" />
          <circle cx="28" cy="28" r="1.5" fill="#fef08a" />

          {/* Floating Rose Petal Halo */}
          <ellipse cx="20" cy="16" rx="3" ry="1.5" fill="#d9453f" transform="rotate(-30 20 16)" />
          <ellipse cx="38" cy="40" rx="3" ry="1.5" fill="#d9453f" transform="rotate(25 38 40)" />
        </svg>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
 *  MASTER THEME COMPANIONS WRAPPER
 * ───────────────────────────────────────────────────────── */

export function ThemeCompanions({ theme }: { theme: string }) {
  if (theme === "japanese") {
    return (
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        {/* Left Companion: Chochin Paper Lantern */}
        <JapaneseChochinLantern
          className="absolute top-[18%] sm:top-[22%] left-4 sm:left-8 md:left-12 lg:left-16 xl:left-24"
          duration={5.2}
          delay={0}
        />
        {/* Right Companion: Kitsune Shrine Mask */}
        <JapaneseKitsuneMask
          className="absolute top-[50%] sm:top-[54%] right-4 sm:right-8 md:right-12 lg:right-16 xl:right-24 scale-95"
          duration={6.0}
          delay={1.5}
        />
      </div>
    );
  }

  if (theme === "minecraft") {
    return (
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        {/* Left Companion: Minecraft Allay Pixel Fairy */}
        <MinecraftAllay
          className="absolute top-[18%] sm:top-[22%] left-4 sm:left-8 md:left-12 lg:left-16 xl:left-24"
          duration={4.8}
          delay={0}
        />
        {/* Right Companion: Minecraft Soul Lantern */}
        <MinecraftSoulLantern
          className="absolute top-[50%] sm:top-[54%] right-4 sm:right-8 md:right-12 lg:right-16 xl:right-24 scale-95"
          duration={5.2}
          delay={1.2}
        />
      </div>
    );
  }

  if (theme === "cyberpunk") {
    return (
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        {/* Left Companion: Militech Recon Drone */}
        <CyberpunkReconDrone
          className="absolute top-[18%] sm:top-[22%] left-4 sm:left-8 md:left-12 lg:left-16 xl:left-24"
          duration={4.4}
          delay={0}
        />
        {/* Right Companion: Voltek 100kV Buoy */}
        <CyberpunkRelayBuoy
          className="absolute top-[50%] sm:top-[54%] right-4 sm:right-8 md:right-12 lg:right-16 xl:right-24 scale-95"
          duration={5.0}
          delay={1.4}
        />
      </div>
    );
  }

  if (theme === "e33") {
    return (
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        {/* Left Companion: Belle Époque Butterfly */}
        <Expedition33Butterfly
          className="absolute top-[18%] sm:top-[22%] left-4 sm:left-8 md:left-12 lg:left-16 xl:left-24"
          duration={5.2}
          delay={0}
        />
        {/* Right Companion: Celestial Chronos Astrolabe */}
        <Expedition33Astrolabe
          className="absolute top-[50%] sm:top-[54%] right-4 sm:right-8 md:right-12 lg:right-16 xl:right-24 scale-95"
          duration={5.8}
          delay={1.3}
        />
      </div>
    );
  }

  return null;
}


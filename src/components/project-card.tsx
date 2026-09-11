"use client";

import React, { useRef, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import { ArrowUpRight, Globe, Sparkles, Tv, Monitor, BookOpen, Layers, ShieldCheck } from "lucide-react";

export interface ProjectItem {
  title: string;
  slug?: string;
  href: string;
  dates?: string;
  active?: boolean;
  featured?: boolean;
  category?: string;
  tagline?: string;
  description: string;
  technologies: readonly string[];
  accentColor?: string;
  badge?: string;
  links: readonly {
    type: string;
    href: string;
    icon?: React.ReactNode;
  }[];
  image?: string;
  video?: string;
}

function hexToRgba(hex?: string, alpha: number = 0.15): string {
  if (!hex || hex === "transparent") return `rgba(120, 120, 120, ${alpha})`;
  let cleanHex = hex.replace("#", "");
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split("").map((c) => c + c).join("");
  }
  const num = parseInt(cleanHex, 16);
  if (isNaN(num)) return `rgba(120, 120, 120, ${alpha})`;
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function ProjectCard({ project, index = 0 }: { project: ProjectItem; index?: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const accentColor = project.accentColor || "#3b82f6";
  const glowRgba = useMemo(() => hexToRgba(accentColor, 0.16), [accentColor]);
  const borderHighlight = useMemo(() => hexToRgba(accentColor, 0.45), [accentColor]);

  const websiteLink = project.links.find((l) => l.type.toLowerCase() === "website")?.href;
  const sourceLink = project.links.find((l) => l.type.toLowerCase() === "source")?.href;
  const primaryHref = websiteLink || sourceLink || project.href;

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "group/card relative flex flex-col justify-between overflow-hidden rounded-2xl transition-all duration-300",
        // Liquid Glass Surface (Light & Dark)
        "bg-card/75 dark:bg-zinc-950/70 backdrop-blur-2xl",
        "border border-border/80 dark:border-white/[0.09]",
        "shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.35)]",
        "hover:-translate-y-1.5 hover:shadow-2xl"
      )}
      style={{
        borderColor: isHovered ? borderHighlight : undefined,
      }}
    >
      {/* Dynamic Cursor Spotlight Effect */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover/card:opacity-100"
        style={{
          background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, ${glowRgba}, transparent 80%)`,
        }}
      />

      {/* Top subtle gloss rim */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 dark:via-white/20 to-transparent" />

      {/* ─── Bespoke Visual Mockup Banner ─── */}
      <div className="relative h-44 sm:h-48 w-full overflow-hidden border-b border-border/50 dark:border-white/[0.06] bg-muted/20 dark:bg-black/30">
        <ProjectVisualArt slug={project.slug || project.title.toLowerCase()} accentColor={accentColor} isHovered={isHovered} />

        {/* Category & Status Overlay Floating Pills */}
        <div className="absolute top-3 inset-x-3.5 flex items-center justify-between pointer-events-none z-10">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold tracking-wider uppercase bg-background/85 dark:bg-zinc-900/85 backdrop-blur-md border border-border/60 dark:border-white/10 text-foreground shadow-xs">
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accentColor }} />
            {project.category || "Featured"}
          </span>

          {websiteLink ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold uppercase bg-emerald-500/10 dark:bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shadow-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              LIVE WEB APP
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold uppercase bg-sky-500/10 dark:bg-sky-500/20 backdrop-blur-md border border-sky-500/30 text-sky-600 dark:text-sky-400 shadow-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
              OPEN SOURCE
            </span>
          )}
        </div>
      </div>

      {/* ─── Content Body ─── */}
      <div className="flex flex-col flex-1 p-5 sm:p-6 z-10">
        {/* Title & External Link */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <a
            href={primaryHref}
            target="_blank"
            rel="noopener noreferrer"
            className="group/title inline-flex items-center gap-1.5 text-lg sm:text-xl font-bold tracking-tight text-foreground hover:text-primary transition-colors"
          >
            <span>{project.title}</span>
            <ArrowUpRight className="size-4 opacity-40 transition-all duration-200 group-hover/title:opacity-100 group-hover/title:translate-x-0.5 group-hover/title:-translate-y-0.5" style={{ color: accentColor }} />
          </a>
          {project.dates && (
            <span className="text-[11px] font-mono text-muted-foreground/70 bg-muted/50 dark:bg-white/5 px-2 py-0.5 rounded-md">
              {project.dates}
            </span>
          )}
        </div>

        {/* Tagline */}
        {project.tagline && (
          <p className="text-xs font-medium text-foreground/80 dark:text-zinc-300 mb-3 leading-relaxed">
            {project.tagline}
          </p>
        )}

        {/* Description */}
        <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed mb-5 flex-1">
          {project.description}
        </p>

        {/* Technology Badges */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {project.technologies.map((tech) => (
            <span
              key={tech}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-muted/60 dark:bg-white/[0.05] border border-border/50 dark:border-white/[0.08] text-foreground/90 transition-colors hover:bg-muted dark:hover:bg-white/10"
            >
              <TechIcon tech={tech} />
              {tech}
            </span>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 pt-3 border-t border-border/50 dark:border-white/[0.06] mt-auto">
          {websiteLink && (
            <a
              href={websiteLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 flex-1 rounded-xl px-3.5 py-2 text-xs font-semibold text-white transition-all duration-200 shadow-sm hover:opacity-95 hover:shadow-md active:scale-[0.98]"
              style={{
                backgroundColor: accentColor,
              }}
            >
              <Globe className="size-3.5" />
              <span>Live Demo</span>
              <ArrowUpRight className="size-3.5 opacity-80" />
            </a>
          )}

          {sourceLink && (
            <a
              href={sourceLink}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "inline-flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all duration-200",
                "bg-muted/70 hover:bg-muted text-foreground border border-border/60 hover:border-border",
                "dark:bg-zinc-900/90 dark:hover:bg-zinc-800 dark:border-white/10",
                websiteLink ? "flex-none" : "flex-1"
              )}
            >
              <Icons.github className="size-3.5" />
              <span>Source</span>
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Bespoke Micro-Art Components for Each Project
// ─────────────────────────────────────────────────────────────────────────────

function ProjectVisualArt({ slug, accentColor, isHovered }: { slug: string; accentColor: string; isHovered: boolean }) {
  switch (slug) {
    case "mynet":
      return <MyNetArt accentColor={accentColor} isHovered={isHovered} />;
    case "scopyai":
      return <ScopyAiArt accentColor={accentColor} isHovered={isHovered} />;
    case "anime-site":
      return <AnimeSiteArt accentColor={accentColor} isHovered={isHovered} />;
    case "3d-portfolio-winxp":
      return <WinXpArt accentColor={accentColor} isHovered={isHovered} />;
    case "anybook":
      return <AnyBookArt accentColor={accentColor} isHovered={isHovered} />;
    default:
      return <DefaultArt accentColor={accentColor} />;
  }
}

// 1. MyNet Art (Layer-2 Packet Sniffer & ARP Spoofing Radar HUD)
function MyNetArt({ accentColor, isHovered }: { accentColor: string; isHovered: boolean }) {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-950/40 via-zinc-950 to-zinc-950 p-4 font-mono select-none">
      {/* Radar rings */}
      <div className="absolute inset-0 flex items-center justify-center opacity-25 pointer-events-none">
        <div className={cn("size-28 rounded-full border border-emerald-500/30 transition-transform duration-700", isHovered && "scale-110")} />
        <div className={cn("absolute size-44 rounded-full border border-emerald-500/20 transition-transform duration-700", isHovered && "scale-105")} />
        <div className="absolute size-60 rounded-full border border-emerald-500/10" />
      </div>

      {/* Terminal UI Mockup */}
      <div className="relative z-10 w-full max-w-[280px] rounded-xl border border-emerald-500/30 bg-black/70 backdrop-blur-md p-3 shadow-xl text-[10px]">
        <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-emerald-500/20 text-emerald-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="size-3" />
            <span className="font-bold">MyNet v1.0 [C# / .NET 8]</span>
          </div>
          <span className="flex items-center gap-1 text-[9px] bg-emerald-500/10 px-1.5 py-0.5 rounded text-emerald-300">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-ping" />
            SCANNING
          </span>
        </div>
        <div className="space-y-1 text-zinc-400 text-[9px]">
          <div className="flex justify-between text-zinc-300">
            <span>Interface: Ethernet 0</span>
            <span className="text-emerald-400">L2 Promiscuous</span>
          </div>
          <div className="flex justify-between text-zinc-400">
            <span>Target: 192.168.1.104</span>
            <span className="text-amber-400">ARP Spoofed</span>
          </div>
          <div className="w-full bg-zinc-800/80 rounded-full h-1.5 mt-1 overflow-hidden">
            <motion.div
              className="bg-emerald-500 h-full rounded-full"
              initial={{ width: "25%" }}
              animate={{ width: isHovered ? "88%" : "65%" }}
              transition={{ duration: 0.8 }}
            />
          </div>
          <div className="flex justify-between text-[8px] text-zinc-500 pt-0.5">
            <span>Bandwidth Limiter</span>
            <span className="text-emerald-400 font-semibold">120 KB/s throttled</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// 2. ScopyAI Art (AI Copilot & Tavily Search Retrieval Engine)
function ScopyAiArt({ accentColor, isHovered }: { accentColor: string; isHovered: boolean }) {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-violet-950/40 via-zinc-950 to-indigo-950/30 p-4 font-mono select-none">
      {/* Ambient Neural Glow */}
      <div className="absolute -top-12 -right-12 size-36 rounded-full bg-violet-600/20 blur-2xl" />
      <div className="absolute -bottom-12 -left-12 size-36 rounded-full bg-indigo-600/20 blur-2xl" />

      {/* Glass Assistant Query HUD */}
      <div className="relative z-10 w-full max-w-[280px] rounded-xl border border-violet-500/30 bg-black/60 backdrop-blur-md p-3 shadow-xl">
        <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-violet-500/20 text-violet-300 text-[10px]">
          <div className="flex items-center gap-1.5 font-bold">
            <Sparkles className="size-3 text-violet-400" />
            <span>ScopyAI Copilot</span>
          </div>
          <span className="text-[9px] text-violet-400 bg-violet-500/15 px-1.5 py-0.5 rounded border border-violet-500/30">
            OpenAI + Tavily
          </span>
        </div>

        {/* Interactive Query Stream */}
        <div className="rounded-lg bg-zinc-900/80 p-2 border border-violet-500/20 text-[9px] mb-1.5">
          <div className="flex items-center gap-1 text-zinc-400 mb-1">
            <span className="size-1.5 rounded-full bg-violet-400" />
            <span className="font-sans truncate">Retrieving research synthesis...</span>
          </div>
          <div className="font-sans text-xs text-zinc-200 font-medium line-clamp-1">
            "Deep learning benchmarks & PDF export generated"
          </div>
        </div>

        <div className="flex items-center justify-between text-[8px] text-zinc-400 font-sans">
          <span className="flex items-center gap-1">
            <span className="size-1 rounded-full bg-emerald-400" /> Supabase Vector DB
          </span>
          <span className="text-violet-400">PDF Ready (A4)</span>
        </div>
      </div>
    </div>
  );
}

// 3. anime-site (Tsune) Art (Vidstack / HLS Stream Glass Player HUD)
function AnimeSiteArt({ accentColor, isHovered }: { accentColor: string; isHovered: boolean }) {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-rose-950/40 via-zinc-950 to-pink-950/30 p-4 select-none">
      {/* Ambient anime glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(244,63,94,0.18),transparent_65%)]" />

      {/* Video Player Mockup Shell */}
      <div className="relative z-10 w-full max-w-[280px] rounded-xl border border-rose-500/30 bg-black/70 backdrop-blur-md p-3 shadow-xl">
        <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-rose-500/20 text-[10px] text-rose-300">
          <div className="flex items-center gap-1.5 font-bold font-mono">
            <Tv className="size-3 text-rose-400" />
            <span>Tsune Streaming</span>
          </div>
          <span className="text-[9px] font-mono text-rose-300 bg-rose-500/20 px-1.5 py-0.5 rounded border border-rose-500/30">
            Consumet API
          </span>
        </div>

        {/* Video Scrubber & Playhead */}
        <div className="rounded-lg bg-zinc-900/90 p-2.5 border border-rose-500/20 mb-2">
          <div className="flex items-center justify-between text-[9px] text-zinc-300 font-mono mb-1.5">
            <span>EP 12: Finale [1080p HLS]</span>
            <span className="text-rose-400 font-semibold">21:45 / 24:00</span>
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden relative">
            <motion.div
              className="bg-rose-500 h-full rounded-full"
              initial={{ width: "70%" }}
              animate={{ width: isHovered ? "85%" : "72%" }}
              transition={{ duration: 0.6 }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-[9px] text-zinc-400 font-mono">
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="size-1.5 rounded-full bg-emerald-400" /> Vidstack Engine
          </span>
          <span className="text-zinc-500">Prisma Auth</span>
        </div>
      </div>
    </div>
  );
}

// 4. 3D-portfolio-winxp Art (Retro Windows XP Desktop Window Chrome)
function WinXpArt({ accentColor, isHovered }: { accentColor: string; isHovered: boolean }) {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-sky-900/40 via-blue-950 to-indigo-950 p-4 select-none">
      {/* Bliss Rolling Green Hill Background Accent */}
      <div className="absolute -bottom-10 inset-x-0 h-20 bg-gradient-to-t from-emerald-600/30 to-transparent rounded-t-[100%] blur-sm" />

      {/* Classic XP Window */}
      <div className="relative z-10 w-full max-w-[280px] rounded-t-lg overflow-hidden border border-blue-400/40 bg-zinc-100 dark:bg-zinc-900 shadow-2xl">
        {/* Luna XP Title Bar */}
        <div className="bg-gradient-to-r from-[#0a246a] via-[#1055d4] to-[#0a246a] px-2 py-1 flex items-center justify-between text-white">
          <div className="flex items-center gap-1.5 text-[10px] font-bold font-sans">
            <Monitor className="size-3 text-sky-200" />
            <span>Windows XP Professional</span>
          </div>
          {/* Classic Minimize, Maximize, Close Buttons */}
          <div className="flex items-center gap-1">
            <span className="size-3 rounded-xs bg-[#0055ea] border border-white/50 text-[7px] flex items-center justify-center font-mono leading-none">_</span>
            <span className="size-3 rounded-xs bg-[#0055ea] border border-white/50 text-[7px] flex items-center justify-center font-mono leading-none">□</span>
            <span className="size-3 rounded-xs bg-[#e81123] border border-white/50 text-[7px] flex items-center justify-center font-mono leading-none font-bold">✕</span>
          </div>
        </div>

        {/* Window Content */}
        <div className="p-2.5 bg-[#ece9d8] dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-[10px] space-y-1.5 font-sans">
          <div className="flex items-center justify-between font-mono text-[9px] text-zinc-600 dark:text-zinc-400 border-b border-zinc-300 dark:border-zinc-800 pb-1">
            <span>C:\PORTFOLIO\3D_DESKTOP</span>
            <span className="text-blue-600 dark:text-blue-400 font-semibold">Interactive</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 pt-0.5 text-center text-[8px]">
            <div className="rounded p-1 bg-white/70 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700">Minesweeper</div>
            <div className="rounded p-1 bg-white/70 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700">Paint.exe</div>
            <div className="rounded p-1 bg-white/70 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700">Solitaire</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 5. AnyBook Art (Calm Editorial Book Summary Reader Canvas)
function AnyBookArt({ accentColor, isHovered }: { accentColor: string; isHovered: boolean }) {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-amber-950/40 via-zinc-950 to-stone-950 p-4 select-none font-sans">
      {/* Warm reading lamp backlight */}
      <div className="absolute top-0 right-1/4 size-32 rounded-full bg-amber-500/15 blur-2xl" />

      {/* Editorial Reader Preview Card */}
      <div className="relative z-10 w-full max-w-[280px] rounded-xl border border-amber-500/30 bg-stone-900/80 backdrop-blur-md p-3 shadow-xl">
        <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-amber-500/20 text-[10px] text-amber-300 font-mono">
          <div className="flex items-center gap-1.5 font-bold">
            <BookOpen className="size-3 text-amber-400" />
            <span>AnyBook Synthesizer</span>
          </div>
          <span className="text-[9px] text-amber-400 bg-amber-500/15 px-1.5 py-0.5 rounded border border-amber-500/30">
            Anti-Doomscroll
          </span>
        </div>

        {/* Structured summary quote */}
        <div className="rounded-lg bg-stone-950/90 p-2.5 border border-amber-500/20 mb-1.5">
          <div className="text-[9px] font-mono text-amber-400/90 mb-1 flex items-center justify-between">
            <span>CORE THESIS</span>
            <span>8 MIN READ</span>
          </div>
          <p className="text-[10.5px] italic text-stone-200 leading-snug line-clamp-2">
            "Deep structured reading replaces dopamine loops with mental clarity and lasting knowledge."
          </p>
        </div>

        <div className="flex items-center justify-between text-[8px] font-mono text-stone-400">
          <span>Key Arguments • Chapters • Quotes</span>
          <span className="text-amber-400">Next.js App</span>
        </div>
      </div>
    </div>
  );
}

function DefaultArt({ accentColor }: { accentColor: string }) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-card to-muted">
      <Layers className="size-8 opacity-30" style={{ color: accentColor }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tech Icon Resolver
// ─────────────────────────────────────────────────────────────────────────────

function TechIcon({ tech }: { tech: string }) {
  const t = tech.toLowerCase();
  if (t.includes("next")) return <Icons.nextjs className="size-3" />;
  if (t.includes("react")) return <Icons.react className="size-3" />;
  if (t.includes("type")) return <Icons.typescript className="size-3" />;
  if (t.includes("tailwind")) return <Icons.tailwindcss className="size-3" />;
  if (t.includes("framer")) return <Icons.framermotion className="size-3" />;
  if (t.includes("openai")) return <Icons.openai className="size-3" />;
  if (t.includes("supabase")) return <Icons.supabase className="size-3 text-emerald-400" />;
  if (t.includes("prisma")) return <Icons.prisma className="size-3" />;
  if (t.includes("c#")) return <Icons.csharp className="size-3 text-emerald-400" />;
  if (t.includes(".net")) return <Icons.dotnet className="size-3 text-purple-400" />;
  if (t.includes("git")) return <Icons.git className="size-3" />;
  return <Sparkles className="size-2.5 opacity-60" />;
}

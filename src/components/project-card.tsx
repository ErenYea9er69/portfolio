"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import { ArrowUpRight, Globe, Sparkles, Tv, Monitor, BookOpen, Layers, ShieldCheck, FileText, Terminal, Search, Code, Radio, Volume2 } from "lucide-react";

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

  const websiteLink = project.links.find((l) => l.type.toLowerCase() === "website")?.href;
  const sourceLink = project.links.find((l) => l.type.toLowerCase() === "source")?.href;
  const primaryHref = websiteLink || sourceLink || project.href;

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "group/card relative flex flex-col justify-between overflow-hidden rounded-2xl transition-all duration-300",
        // Calm, premium liquid glass surface
        "bg-card/75 dark:bg-zinc-950/70 backdrop-blur-xl",
        "border border-border/70 dark:border-white/[0.08]",
        "shadow-xs hover:shadow-md",
        "hover:-translate-y-1 hover:border-foreground/20"
      )}
    >
      {/* Gentle Subtle Cursor Spotlight (Neutral, Non-glaring) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover/card:opacity-100"
        style={{
          background: `radial-gradient(350px circle at ${mousePos.x}px ${mousePos.y}px, hsl(var(--foreground) / 0.035), transparent 75%)`,
        }}
      />

      {/* Top subtle gloss rim */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />

      {/* ─── Project Visual Preview Banner ─── */}
      <div className="relative h-48 sm:h-52 w-full overflow-hidden border-b border-border/50 dark:border-white/[0.06] bg-muted/30 dark:bg-zinc-900/40">
        {project.image ? (
          <div className="relative w-full h-full overflow-hidden">
            <Image
              src={project.image}
              alt={project.title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-top transition-transform duration-500 ease-out group-hover/card:scale-105"
            />
            {/* Subtle gradient vignette to blend cleanly with card chrome */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-black/20 dark:from-zinc-950/80" />
          </div>
        ) : (
          <ProjectVisualArt slug={project.slug || project.title.toLowerCase()} isHovered={isHovered} />
        )}

        {/* Category & Status Overlay Floating Pills (Quiet, Calm) */}
        <div className="absolute top-3 inset-x-3.5 flex items-center justify-between pointer-events-none z-10">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-medium tracking-wider uppercase bg-background/90 dark:bg-zinc-900/90 backdrop-blur-md border border-border/60 text-muted-foreground shadow-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60" />
            {project.category || "Project"}
          </span>

          {websiteLink ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-medium uppercase bg-background/90 dark:bg-zinc-900/90 backdrop-blur-md border border-border/60 text-foreground shadow-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Live Demo
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-medium uppercase bg-background/90 dark:bg-zinc-900/90 backdrop-blur-md border border-border/60 text-muted-foreground shadow-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
              Source Only
            </span>
          )}
        </div>
      </div>

      {/* ─── Content Body ─── */}
      <div className="flex flex-col flex-1 p-5 sm:p-6 z-10">
        {/* Title & External Link */}
        <div className="flex items-start justify-between gap-3 mb-1.5">
          <a
            href={primaryHref}
            target="_blank"
            rel="noopener noreferrer"
            className="group/title inline-flex items-center gap-1.5 text-lg sm:text-xl font-bold tracking-tight text-foreground hover:text-foreground/80 transition-colors"
          >
            <span>{project.title}</span>
            <ArrowUpRight className="size-4 opacity-40 transition-all duration-200 group-hover/title:opacity-100 group-hover/title:translate-x-0.5 group-hover/title:-translate-y-0.5" />
          </a>
          {project.dates && (
            <span className="text-[11px] font-mono text-muted-foreground/70 bg-muted/40 px-2 py-0.5 rounded-md">
              {project.dates}
            </span>
          )}
        </div>

        {/* Tagline */}
        {project.tagline && (
          <p className="text-xs font-medium text-foreground/80 dark:text-zinc-300 mb-2.5 leading-relaxed">
            {project.tagline}
          </p>
        )}

        {/* Description */}
        <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed mb-5 flex-1">
          {project.description}
        </p>

        {/* Technology Badges (Colorful Brand Palette, No Animation) */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {project.technologies.map((tech) => {
            const meta = getTechMeta(tech);
            const isNext = tech.toLowerCase().includes("next");
            return (
              <span
                key={tech}
                className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border select-none transition-colors",
                  isNext
                    ? "bg-zinc-500/10 dark:bg-zinc-400/10 border-zinc-500/20 dark:border-zinc-400/20 text-foreground"
                    : "text-foreground"
                )}
                style={
                  !isNext
                    ? {
                        backgroundColor: `${meta.color}15`,
                        borderColor: `${meta.color}35`,
                      }
                    : undefined
                }
              >
                <span
                  className="flex shrink-0 items-center justify-center"
                  style={{
                    color: !isNext ? meta.color : undefined,
                  }}
                >
                  {meta.icon}
                </span>
                <span>{tech}</span>
              </span>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 pt-3 border-t border-border/50 dark:border-white/[0.06] mt-auto">
          {websiteLink && (
            <a
              href={websiteLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 flex-1 rounded-xl px-3.5 py-2 text-xs font-semibold bg-foreground text-background hover:bg-foreground/90 transition-all duration-200 shadow-xs hover:shadow-sm active:scale-[0.98]"
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
                "bg-muted/60 hover:bg-muted text-foreground border border-border/60 hover:border-border",
                "dark:bg-zinc-900/80 dark:hover:bg-zinc-800 dark:border-white/10",
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
// Soft, Balanced Micro-Art Components (Comfortable for the eyes)
// ─────────────────────────────────────────────────────────────────────────────

function ProjectVisualArt({ slug, isHovered }: { slug: string; isHovered: boolean }) {
  switch (slug) {
    case "mynet":
      return <MyNetArt isHovered={isHovered} />;
    case "scopyai":
      return <ScopyAiArt isHovered={isHovered} />;
    case "anime-site":
      return <AnimeSiteArt isHovered={isHovered} />;
    case "3d-portfolio-winxp":
      return <WinXpArt isHovered={isHovered} />;
    case "anybook":
      return <AnyBookArt isHovered={isHovered} />;
    default:
      return <DefaultArt />;
  }
}

// 1. MyNet Art (Clean Networking HUD)
function MyNetArt({ isHovered }: { isHovered: boolean }) {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-muted/20 p-4 font-mono select-none">
      {/* Subtle concentric rings */}
      <div className="absolute inset-0 flex items-center justify-center opacity-15 pointer-events-none">
        <div className={cn("size-28 rounded-full border border-foreground/30 transition-transform duration-500", isHovered && "scale-105")} />
        <div className="absolute size-44 rounded-full border border-foreground/20" />
      </div>

      {/* Terminal UI Mockup */}
      <div className="relative z-10 w-full max-w-[270px] rounded-xl border border-border/80 bg-card/90 dark:bg-zinc-900/90 backdrop-blur-md p-3 shadow-sm text-[10px]">
        <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-border/60 text-foreground">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="size-3 text-muted-foreground" />
            <span className="font-semibold">MyNet v1.0 [C# / .NET 8]</span>
          </div>
          <span className="text-[9px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
            L2 Promiscuous
          </span>
        </div>
        <div className="space-y-1 text-muted-foreground text-[9px]">
          <div className="flex justify-between">
            <span>Interface: Ethernet 0</span>
            <span className="text-foreground/80 font-medium">Scanning</span>
          </div>
          <div className="flex justify-between">
            <span>Target: 192.168.1.104</span>
            <span className="text-foreground/80">Bandwidth Control</span>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5 mt-1 overflow-hidden">
            <div className="bg-foreground/60 h-full rounded-full w-2/3" />
          </div>
          <div className="flex justify-between text-[8px] text-muted-foreground pt-0.5">
            <span>Rate Limiter</span>
            <span>120 KB/s throttled</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// 2. ScopyAI Art (Clean AI Assistant HUD)
function ScopyAiArt({ isHovered }: { isHovered: boolean }) {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-muted/20 p-4 font-mono select-none">
      {/* Glass Assistant Query HUD */}
      <div className="relative z-10 w-full max-w-[270px] rounded-xl border border-border/80 bg-card/90 dark:bg-zinc-900/90 backdrop-blur-md p-3 shadow-sm">
        <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-border/60 text-foreground text-[10px]">
          <div className="flex items-center gap-1.5 font-semibold">
            <Sparkles className="size-3 text-muted-foreground" />
            <span>ScopyAI Copilot</span>
          </div>
          <span className="text-[9px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
            OpenAI + Tavily
          </span>
        </div>

        <div className="rounded-lg bg-muted/40 p-2 border border-border/50 text-[9px] mb-1.5">
          <div className="text-muted-foreground mb-1 font-sans">
            Research synthesis & retrieval:
          </div>
          <div className="font-sans text-xs text-foreground font-medium line-clamp-1">
            "Automated multi-source report & PDF export"
          </div>
        </div>

        <div className="flex items-center justify-between text-[8px] text-muted-foreground font-sans">
          <span>Supabase Vector Sync</span>
          <span>PDF Ready (A4)</span>
        </div>
      </div>
    </div>
  );
}

// 3. anime-site Art (Clean Video Player HUD)
function AnimeSiteArt({ isHovered }: { isHovered: boolean }) {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-muted/20 p-4 select-none">
      {/* Video Player Mockup Shell */}
      <div className="relative z-10 w-full max-w-[270px] rounded-xl border border-border/80 bg-card/90 dark:bg-zinc-900/90 backdrop-blur-md p-3 shadow-sm">
        <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-border/60 text-[10px] text-foreground">
          <div className="flex items-center gap-1.5 font-semibold font-mono">
            <Tv className="size-3 text-muted-foreground" />
            <span>Tsune Streaming</span>
          </div>
          <span className="text-[9px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
            Consumet API
          </span>
        </div>

        <div className="rounded-lg bg-muted/40 p-2 border border-border/50 mb-2">
          <div className="flex items-center justify-between text-[9px] text-foreground font-mono mb-1.5">
            <span>EP 12: Finale [1080p HLS]</span>
            <span className="text-muted-foreground">21:45 / 24:00</span>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
            <div className="bg-foreground/60 h-full rounded-full w-3/4" />
          </div>
        </div>

        <div className="flex items-center justify-between text-[9px] text-muted-foreground font-mono">
          <span>Vidstack Engine</span>
          <span>Prisma Auth</span>
        </div>
      </div>
    </div>
  );
}

// 4. 3D-portfolio-winxp Art (Retro Windows XP Desktop Window)
function WinXpArt({ isHovered }: { isHovered: boolean }) {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-muted/20 p-4 select-none">
      {/* Classic XP Window */}
      <div className="relative z-10 w-full max-w-[270px] rounded-t-lg overflow-hidden border border-border/80 bg-card shadow-sm">
        {/* Luna XP Title Bar */}
        <div className="bg-muted/80 border-b border-border/60 px-2.5 py-1.5 flex items-center justify-between text-foreground">
          <div className="flex items-center gap-1.5 text-[10px] font-bold font-sans">
            <Monitor className="size-3 text-muted-foreground" />
            <span>Windows XP Desktop</span>
          </div>
          <div className="flex items-center gap-1 text-[8px] font-mono text-muted-foreground">
            <span>_</span>
            <span>□</span>
            <span>✕</span>
          </div>
        </div>

        {/* Window Content */}
        <div className="p-2.5 text-[10px] space-y-1.5 font-sans">
          <div className="flex items-center justify-between font-mono text-[9px] text-muted-foreground border-b border-border/40 pb-1">
            <span>C:\PORTFOLIO\3D_DESKTOP</span>
            <span className="text-foreground font-semibold">Interactive</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 pt-0.5 text-center text-[8px] text-muted-foreground">
            <div className="rounded p-1 bg-muted/40 border border-border/50">Minesweeper</div>
            <div className="rounded p-1 bg-muted/40 border border-border/50">Paint.exe</div>
            <div className="rounded p-1 bg-muted/40 border border-border/50">Solitaire</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 5. AnyBook Art (Calm Editorial Book Summary Reader Canvas)
function AnyBookArt({ isHovered }: { isHovered: boolean }) {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-muted/20 p-4 select-none font-sans">
      {/* Editorial Reader Preview Card */}
      <div className="relative z-10 w-full max-w-[270px] rounded-xl border border-border/80 bg-card/90 dark:bg-zinc-900/90 backdrop-blur-md p-3 shadow-sm">
        <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-border/60 text-[10px] text-foreground font-mono">
          <div className="flex items-center gap-1.5 font-semibold">
            <BookOpen className="size-3 text-muted-foreground" />
            <span>AnyBook Synthesizer</span>
          </div>
          <span className="text-[9px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
            Anti-Doomscroll
          </span>
        </div>

        <div className="rounded-lg bg-muted/40 p-2.5 border border-border/50 mb-1.5">
          <div className="text-[9px] font-mono text-muted-foreground mb-1 flex items-center justify-between">
            <span>CORE ARGUMENT</span>
            <span>8 MIN READ</span>
          </div>
          <p className="text-[10.5px] italic text-foreground/85 leading-snug line-clamp-2">
            "Deep structured reading replaces dopamine loops with mental clarity and lasting knowledge."
          </p>
        </div>

        <div className="flex items-center justify-between text-[8px] font-mono text-muted-foreground">
          <span>Key Arguments • Chapters • Quotes</span>
          <span>Next.js App</span>
        </div>
      </div>
    </div>
  );
}

function DefaultArt() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-muted/20">
      <Layers className="size-7 text-muted-foreground/40" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tech Metadata & Color Resolver (Brand-Accurate Palette, Static)
// ─────────────────────────────────────────────────────────────────────────────

function getTechMeta(tech: string): { color: string; icon: React.ReactNode } {
  const t = tech.toLowerCase().trim();

  // Next.js
  if (t === "next.js" || t === "nextjs" || t.includes("next")) {
    return {
      color: "#000000",
      icon: <Icons.nextjs className="size-3" />,
    };
  }

  // TypeScript
  if (t.includes("typescript") || t === "ts") {
    return {
      color: "#3178c6",
      icon: <Icons.typescript className="size-3" />,
    };
  }

  // React
  if (t === "react" || t.includes("react")) {
    return {
      color: "#61dafb",
      icon: <Icons.react className="size-3" />,
    };
  }

  // OpenAI
  if (t.includes("openai") || t.includes("chatgpt")) {
    return {
      color: "#10a37f",
      icon: <Icons.openai className="size-3" />,
    };
  }

  // Supabase
  if (t.includes("supabase")) {
    return {
      color: "#3ecf8e",
      icon: <Icons.supabase className="size-3" />,
    };
  }

  // Tavily
  if (t.includes("tavily")) {
    return {
      color: "#0ea5e9",
      icon: <Sparkles className="size-3" />,
    };
  }

  // PDF Generation
  if (t.includes("pdf")) {
    return {
      color: "#f43f5e",
      icon: <FileText className="size-3" />,
    };
  }

  // TailwindCSS
  if (t.includes("tailwind")) {
    return {
      color: "#06b6d4",
      icon: <Icons.tailwindcss className="size-3" />,
    };
  }

  // Framer Motion
  if (t.includes("framer")) {
    return {
      color: "#e945ff",
      icon: <Icons.framermotion className="size-3" />,
    };
  }

  // Prisma
  if (t.includes("prisma")) {
    return {
      color: "#6366f1",
      icon: <Icons.prisma className="size-3" />,
    };
  }

  // C#
  if (t.includes("c#") || t === "csharp") {
    return {
      color: "#9b4f96",
      icon: <Icons.csharp className="size-3" />,
    };
  }

  // .NET
  if (t.includes(".net") || t.includes("dotnet")) {
    return {
      color: "#512bd4",
      icon: <Icons.dotnet className="size-3" />,
    };
  }

  // Vidstack
  if (t.includes("vidstack")) {
    return {
      color: "#f43f5e",
      icon: <Tv className="size-3" />,
    };
  }

  // Consumet API
  if (t.includes("consumet") || t.includes("api")) {
    return {
      color: "#10b981",
      icon: <Code className="size-3" />,
    };
  }

  // HLS Stream
  if (t.includes("hls") || t.includes("stream")) {
    return {
      color: "#f97316",
      icon: <Radio className="size-3" />,
    };
  }

  // ARP Spoofing
  if (t.includes("arp") || t.includes("spoof")) {
    return {
      color: "#10b981",
      icon: <ShieldCheck className="size-3" />,
    };
  }

  // Layer-2
  if (t.includes("layer")) {
    return {
      color: "#06b6d4",
      icon: <Layers className="size-3" />,
    };
  }

  // WinPcap
  if (t.includes("winpcap") || t.includes("pcap")) {
    return {
      color: "#3b82f6",
      icon: <Terminal className="size-3" />,
    };
  }

  // Retro UI
  if (t.includes("retro") || t.includes("xp")) {
    return {
      color: "#0284c7",
      icon: <Monitor className="size-3" />,
    };
  }

  // Win32 Audio
  if (t.includes("audio") || t.includes("sound") || t.includes("win32")) {
    return {
      color: "#f59e0b",
      icon: <Volume2 className="size-3" />,
    };
  }

  // Editorial UI
  if (t.includes("editorial")) {
    return {
      color: "#f59e0b",
      icon: <BookOpen className="size-3" />,
    };
  }

  // Search Index
  if (t.includes("search")) {
    return {
      color: "#eab308",
      icon: <Search className="size-3" />,
    };
  }

  // Node.js
  if (t.includes("node")) {
    return {
      color: "#22c55e",
      icon: <Icons.nodejs className="size-3" />,
    };
  }

  // Git / GitHub
  if (t.includes("git")) {
    return {
      color: "#f05032",
      icon: <Icons.git className="size-3" />,
    };
  }

  // Fallback
  return {
    color: "#8b5cf6",
    icon: <Sparkles className="size-2.5 opacity-80" />,
  };
}

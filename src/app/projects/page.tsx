"use client";

import React, { useState, useMemo } from "react";
import { DATA } from "@/data/resume";
import { ProjectCard } from "@/components/project-card";
import BlurFade from "@/components/magicui/blur-fade";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Search, FolderGit2, Sparkles, Filter, ChevronLeft, ArrowUpRight, Terminal, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { DecryptedText } from "@/components/decrypted-text";
import { StarBorder } from "@/components/ui/star-border";

const BLUR_FADE_DELAY = 0.04;

const CATEGORIES = [
  "All",
  "Interactive & Games",
  "Web Applications",
  "Systems & Networking",
  "AI & Copilots",
  "Interactive & Retro",
  "Productivity & Education",
];

export default function ProjectsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProjects = useMemo(() => {
    return DATA.projects.filter((p) => {
      const matchesCategory =
        selectedCategory === "All" ||
        (p.category && p.category.toLowerCase() === selectedCategory.toLowerCase());

      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCategory;

      const matchesSearch =
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.tagline && p.tagline.toLowerCase().includes(q)) ||
        p.technologies.some((tech) => tech.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const liveDemosCount = useMemo(() => {
    return DATA.projects.filter((p) => p.links.some((l) => l.type.toLowerCase() === "website")).length;
  }, []);

  return (
    <main className="flex min-h-[100dvh] flex-col space-y-10 sm:space-y-12 pb-16">
      {/* ─── Breadcrumb & Navigation ─── */}
      <BlurFade delay={BLUR_FADE_DELAY}>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link
            href="/"
            className="inline-flex items-center gap-1 hover:text-foreground transition-colors group/back"
          >
            <ChevronLeft className="size-3.5 transition-transform group-hover/back:-translate-x-0.5" />
            <DecryptedText text="Home" animateOn="hover" speed={20} maxIterations={5} />
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">
            <DecryptedText text="Projects" animateOn="hover" speed={20} maxIterations={5} className="text-foreground font-medium" />
          </span>
        </div>
      </BlurFade>

      {/* ─── Hero Header ─── */}
      <section className="space-y-4">
        <BlurFade delay={BLUR_FADE_DELAY * 1.5}>
          <div className="flex items-center gap-2.5">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              <DecryptedText
                text="Projects"
                animateOn="inViewHover"
                sequential={true}
                speed={45}
                maxIterations={12}
                className="text-foreground"
                encryptedClassName="text-zinc-500/80 dark:text-zinc-400/80 font-mono"
              />
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/80 dark:bg-muted/40 px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground border border-border/70">
              <span className="size-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-pulse" />
              <DecryptedText
                text={`${DATA.projects.length} Repositories`}
                animateOn="hover"
                speed={25}
                maxIterations={6}
                className="text-muted-foreground"
              />
            </span>
          </div>
        </BlurFade>

        {/* Telemetry quick stats */}
        <BlurFade delay={BLUR_FADE_DELAY * 2}>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-1 sm:pt-2">
            <div className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-muted/30 px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs text-muted-foreground backdrop-blur-sm">
              <FolderGit2 className="size-3.5 text-foreground" />
              <span>
                <strong>{DATA.projects.length}</strong>{" "}
                <DecryptedText text="Projects" animateOn="hover" speed={20} maxIterations={5} />
              </span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-muted/30 px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs text-muted-foreground backdrop-blur-sm">
              <Globe className="size-3.5 text-zinc-400 dark:text-zinc-500" />
              <span>
                <strong>{liveDemosCount}</strong>{" "}
                <DecryptedText text="Live Demos" animateOn="hover" speed={20} maxIterations={5} />
              </span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-muted/30 px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs text-muted-foreground backdrop-blur-sm">
              <Terminal className="size-3.5 text-sky-500" />
              <span>
                <strong>100%</strong>{" "}
                <DecryptedText text="Open Source" animateOn="hover" speed={20} maxIterations={5} />
              </span>
            </div>
          </div>
        </BlurFade>
      </section>

      {/* ─── Search & Category Filter Controls ─── */}
      <section className="space-y-4 pt-2">
        <BlurFade delay={BLUR_FADE_DELAY * 2.5}>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input with Glass Styling */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/70" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, technology (e.g. C#, OpenAI, Next.js)..."
                className="w-full rounded-2xl border border-border/70 dark:border-white/10 bg-card/60 dark:bg-zinc-950/60 pl-10 pr-9 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 backdrop-blur-xl transition-all focus:border-foreground/30 focus:outline-none focus:ring-2 focus:ring-foreground/5 shadow-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground p-1 cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Results count indicator */}
            <div className="text-xs text-muted-foreground/80 self-center sm:self-auto font-mono">
              <DecryptedText
                text={`Showing ${filteredProjects.length} of ${DATA.projects.length}`}
                animateOn="hover"
                speed={20}
                maxIterations={5}
                className="text-xs text-muted-foreground/80 font-mono"
              />
            </div>
          </div>
        </BlurFade>

        {/* Category Filter Pills */}
        <BlurFade delay={BLUR_FADE_DELAY * 3}>
          <div
            role="tablist"
            className="flex items-center gap-1.5 p-1 rounded-2xl bg-muted/40 dark:bg-muted/20 border border-border/40 backdrop-blur-md overflow-x-auto no-scrollbar max-w-full w-full sm:w-fit"
          >
            {CATEGORIES.map((category) => {
              const isActive = selectedCategory === category;
              const count =
                category === "All"
                  ? DATA.projects.length
                  : DATA.projects.filter(
                      (p) => p.category && p.category.toLowerCase() === category.toLowerCase()
                    ).length;

              return (
                <button
                  key={category}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setSelectedCategory(category)}
                  className={cn(
                    "relative shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl transition-all duration-200 outline-none cursor-pointer",
                    isActive
                      ? "text-foreground font-semibold"
                      : "text-muted-foreground hover:text-foreground/90 hover:bg-muted/30"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-project-pill"
                      transition={{ type: "spring", stiffness: 450, damping: 35 }}
                      className="absolute inset-0 rounded-xl bg-background/95 dark:bg-card/95 border border-border/70 shadow-sm backdrop-blur-lg"
                    />
                  )}
                  <span className="relative z-10">
                    <DecryptedText
                      text={category}
                      animateOn="hover"
                      speed={25}
                      maxIterations={6}
                      className={isActive ? "text-foreground font-semibold" : "text-muted-foreground"}
                    />
                  </span>
                  <span
                    className={cn(
                      "relative z-10 text-[10px] px-1.5 py-0.2 rounded-full tabular-nums",
                      isActive ? "bg-muted text-foreground font-bold" : "bg-muted/60 text-muted-foreground"
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </BlurFade>
      </section>

      {/* ─── Projects Grid ─── */}
      <section>
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {filteredProjects.map((project, idx) => (
              <ProjectCard key={project.title} project={project as any} index={idx} />
            ))}
          </div>
        ) : (
          <BlurFade delay={BLUR_FADE_DELAY * 3.5}>
            <div className="rounded-2xl border border-dashed border-border/70 p-12 text-center bg-card/30 backdrop-blur-md">
              <FolderGit2 className="mx-auto size-10 text-muted-foreground/50 mb-3" />
              <h3 className="text-base font-semibold text-foreground">No matching projects found</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 mb-4">
                We couldn't find any projects matching "{searchQuery}" in this category.
              </p>
              <StarBorder
                as="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                }}
                radius={12}
                duration={3.5}
                glow={0.5}
                sparkle
                hover="lap"
                clickPulse
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold cursor-pointer shadow-xs"
              >
                <DecryptedText text="Reset all filters" animateOn="hover" speed={20} maxIterations={5} />
              </StarBorder>
            </div>
          </BlurFade>
        )}
      </section>
    </main>
  );
}

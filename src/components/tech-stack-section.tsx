"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DATA } from "@/data/resume";
import BlurFade from "@/components/magicui/blur-fade";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const BLUR_FADE_DELAY = 0.04;

type CategoryType = "All" | "Frontend" | "Backend" | "Tools" | "Exploring";

type SkillItem = (typeof DATA.skills)[number];

const CATEGORIES: { label: string; value: CategoryType }[] = [
  { label: "All", value: "All" },
  { label: "Frontend", value: "Frontend" },
  { label: "Backend", value: "Backend" },
  { label: "Tools", value: "Tools" },
  { label: "Exploring", value: "Exploring" },
];

export function TechStackSection() {
  const [activeCategory, setActiveCategory] = useState<CategoryType>("All");
  const [hoveredSkill, setHoveredSkill] = useState<SkillItem | null>(null);

  const filteredSkills = useMemo(() => {
    if (activeCategory === "All") return DATA.skills;
    return DATA.skills.filter(
      (skill) => skill.category.toLowerCase() === activeCategory.toLowerCase()
    );
  }, [activeCategory]);

  const counts = useMemo(() => {
    const all = DATA.skills.length;
    const fe = DATA.skills.filter((s) => s.category === "Frontend").length;
    const be = DATA.skills.filter((s) => s.category === "Backend").length;
    const tl = DATA.skills.filter((s) => s.category === "Tools").length;
    const ex = DATA.skills.filter((s) => s.category === "Exploring").length;
    return { All: all, Frontend: fe, Backend: be, Tools: tl, Exploring: ex };
  }, []);

  return (
    <div className="relative flex min-h-0 flex-col gap-y-4">
      {/* Subtle neutral ambient backlight clipped inside (Desktop Only) */}
      <div
        aria-hidden
        className="hidden md:block pointer-events-none absolute inset-x-0 -top-12 h-40 blur-3xl opacity-15 dark:opacity-10 transition-opacity duration-500 -z-10 rounded-full bg-muted-foreground/10"
      />

      {/* Header section */}
      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-end sm:justify-between">
        <BlurFade delay={BLUR_FADE_DELAY * 10}>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Tech Stack
            </h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {DATA.skills.length} Technologies
            </span>
          </div>
        </BlurFade>
      </div>

      {/* Segmented Category Filter */}
      <BlurFade delay={BLUR_FADE_DELAY * 10.3}>
        <div
          role="tablist"
          aria-label="Filter tech stack by category"
          className="flex items-center gap-1.5 p-1 rounded-2xl bg-muted/60 dark:bg-muted/30 md:bg-muted/40 md:dark:bg-muted/20 border border-border/40 md:backdrop-blur-md overflow-x-auto no-scrollbar max-w-full w-full sm:w-fit"
        >
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.value;
            const count = counts[cat.value];
            return (
              <button
                key={cat.value}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveCategory(cat.value)}
                className={cn(
                  "relative shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer",
                  isActive
                    ? "text-foreground font-semibold shadow-xs"
                    : "text-muted-foreground hover:text-foreground/90 hover:bg-muted/30"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-tech-pill"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                    className="absolute inset-0 rounded-xl bg-background/95 dark:bg-card/95 border border-border/70 shadow-sm md:backdrop-blur-lg"
                  />
                )}
                <span className="relative z-10">{cat.label}</span>
                <span
                  className={cn(
                    "relative z-10 text-[10px] px-1.5 py-0.2 rounded-full tabular-nums transition-colors",
                    isActive
                      ? "bg-muted text-foreground font-bold"
                      : "bg-muted/60 text-muted-foreground"
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </BlurFade>

      {/* Stable, glitch-free skill badges */}
      <BlurFade delay={BLUR_FADE_DELAY * 10.6}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="flex flex-wrap gap-2 sm:gap-2.5 pt-1"
          >
            {filteredSkills.map((skill, index) => (
              <SkillPill
                key={skill.name}
                skill={skill}
                index={index}
                isHovered={hoveredSkill?.name === skill.name}
                onMouseEnter={() => setHoveredSkill(skill)}
                onMouseLeave={() => setHoveredSkill(null)}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </BlurFade>
    </div>
  );
}

function SkillPill({
  skill,
  index,
  isHovered,
  onMouseEnter,
  onMouseLeave,
}: {
  skill: SkillItem;
  index: number;
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  const brandColor = (skill.color as string) || "#6366f1";

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={cn(
        "group relative inline-flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all duration-200 select-none cursor-default",
        "bg-card/90 dark:bg-zinc-900/85 md:bg-card/75 md:dark:bg-zinc-900/65 md:backdrop-blur-md",
        "border border-border/70 dark:border-white/10",
        "hover:border-foreground/25 hover:bg-card dark:hover:bg-zinc-800/80 hover:-translate-y-0.5 hover:shadow-xs",
        isHovered ? "z-20 border-foreground/30 shadow-xs" : "z-10"
      )}
    >
      {/* Floating Tooltip displaying Role & Level on desktop */}
      <div
        className={cn(
          "pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md whitespace-nowrap text-[10px] font-medium tracking-tight shadow-md border transition-all duration-150 z-40 hidden md:block",
          "bg-popover text-popover-foreground border-border/70",
          isHovered
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-1 scale-95 pointer-events-none"
        )}
      >
        <span>{skill.role}</span>
        {skill.level && (
          <span className="ml-1 opacity-60">· {skill.level}</span>
        )}
      </div>

      {/* Icon with clean scale */}
      <div className="relative flex size-4 shrink-0 items-center justify-center transition-transform duration-200 group-hover:scale-110">
        <SkillIcon skill={skill} brandColor={brandColor} />
      </div>

      {/* Skill Name */}
      <span className="text-xs sm:text-[13px] font-medium tracking-tight text-foreground transition-colors">
        {skill.name}
      </span>
    </div>
  );
}

function SkillIcon({ skill, brandColor }: { skill: any; brandColor: string }) {
  if (skill.customIcon) {
    const CustomIcon = skill.customIcon;
    return (
      <CustomIcon
        className="size-4 transition-all duration-200 text-foreground group-hover:text-foreground"
        style={{
          color: brandColor !== "#000000" && brandColor !== "#ffffff" ? brandColor : undefined,
        }}
      />
    );
  }
  if (skill.icon) {
    return (
      <FontAwesomeIcon
        icon={skill.icon}
        className="size-4 transition-all duration-200"
        style={{
          color: brandColor !== "#000000" && brandColor !== "#ffffff" ? brandColor : undefined,
        }}
      />
    );
  }
  return <Sparkles className="size-4 text-muted-foreground" />;
}

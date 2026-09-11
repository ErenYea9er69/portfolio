"use client";

import React from "react";
import { DATA } from "@/data/resume";
import BlurFade from "@/components/magicui/blur-fade";
import { ProjectCard } from "@/components/project-card";
import Link from "next/link";
import { ArrowRight, Sparkles, FolderGit2 } from "lucide-react";

const BLUR_FADE_DELAY = 0.04;

export function ProjectsSection() {
  // Only display the 4 projects with visual screenshot previews on the landing page
  const landingProjects = DATA.projects.filter((p) => Boolean(p.image)).slice(0, 4);

  return (
    <div className="flex min-h-0 flex-col gap-y-6">
      {/* Header section */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <BlurFade delay={BLUR_FADE_DELAY * 11}>
          <div className="flex items-center gap-2">
            <span className="inline-block text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/75 dark:text-muted-foreground">
              Selected Works
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {DATA.projects.length} Shipped
            </span>
          </div>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Featured Projects
          </h2>
        </BlurFade>

        <BlurFade delay={BLUR_FADE_DELAY * 11.2}>
          <Link
            href="/projects"
            className="group/link inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors w-fit pb-1"
          >
            <span>More projects ({DATA.projects.length})</span>
            <ArrowRight className="size-3.5 transition-transform duration-200 group-hover/link:translate-x-1" />
          </Link>
        </BlurFade>
      </div>

      {/* Grid of 4 Projects with pictures */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 pt-1">
        {landingProjects.map((project, idx) => (
          <ProjectCard key={project.title} project={project as any} index={idx} />
        ))}
      </div>

      {/* Bottom Explore Banner */}
      <BlurFade delay={BLUR_FADE_DELAY * 12}>
        <div className="mt-3 flex justify-center">
          <Link
            href="/projects"
            className="group/btn relative inline-flex items-center gap-2.5 rounded-2xl border border-border/70 dark:border-white/10 bg-card/60 dark:bg-zinc-950/60 px-6 py-3 text-xs font-medium text-foreground backdrop-blur-xl shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-card hover:border-foreground/20 hover:shadow-lg"
          >
            <FolderGit2 className="size-4 text-muted-foreground group-hover/btn:text-foreground transition-colors" />
            <span>More Projects ({DATA.projects.length})</span>
            <ArrowRight className="size-3.5 opacity-60 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
          </Link>
        </div>
      </BlurFade>
    </div>
  );
}

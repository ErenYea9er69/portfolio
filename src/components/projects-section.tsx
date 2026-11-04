"use client";

import React from "react";
import { DATA } from "@/data/resume";
import BlurFade from "@/components/magicui/blur-fade";
import { ProjectCard } from "@/components/project-card";
import Link from "next/link";
import { ArrowRight, Sparkles, FolderGit2 } from "lucide-react";
import { DecryptedText } from "@/components/decrypted-text";

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
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              <DecryptedText
                text="Featured Projects"
                animateOn="inViewHover"
                sequential={true}
                speed={40}
                maxIterations={10}
                className="text-foreground"
                encryptedClassName="text-zinc-500/80 dark:text-zinc-400/80 font-mono"
              />
            </h2>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/80 dark:bg-muted/40 px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground border border-border/70">
              <span className="size-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-pulse" />
              <DecryptedText
                text={`${DATA.projects.length} Shipped`}
                animateOn="hover"
                speed={25}
                maxIterations={6}
                className="text-muted-foreground"
              />
            </span>
          </div>
        </BlurFade>

        <BlurFade delay={BLUR_FADE_DELAY * 11.2}>
          <Link
            href="/projects"
            className="group/link inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors w-fit pb-1"
          >
            <span>
              <DecryptedText
                text={`More projects (${DATA.projects.length})`}
                animateOn="hover"
                speed={25}
                maxIterations={6}
                className="text-muted-foreground group-hover/link:text-foreground"
              />
            </span>
            <ArrowRight className="size-3.5 transition-transform duration-200 group-hover/link:translate-x-1" />
          </Link>
        </BlurFade>
      </div>

      {/* Grid of 4 Projects with pictures */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pt-1">
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
            <span>
              <DecryptedText
                text={`More Projects (${DATA.projects.length})`}
                animateOn="hover"
                speed={25}
                maxIterations={6}
                className="text-foreground"
              />
            </span>
            <ArrowRight className="size-3.5 opacity-60 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
          </Link>
        </div>
      </BlurFade>
    </div>
  );
}

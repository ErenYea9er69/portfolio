"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { DATA } from "@/data/resume";
import BlurFade from "@/components/magicui/blur-fade";
import { ProjectCard } from "@/components/project-card";
import Link from "next/link";
import { ArrowRight, FolderGit2 } from "lucide-react";
import { DecryptedText } from "@/components/decrypted-text";
import { StarBorder } from "@/components/ui/star-border";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

const BLUR_FADE_DELAY = 0.04;

// Hoisted static reference: Only display the 4 projects with visual screenshot previews on the landing page
const LANDING_PROJECTS = DATA.projects.filter((p) => Boolean(p.image)).slice(0, 4);

export function ProjectsSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const pair1Ref = useRef<HTMLDivElement>(null);
  const pair2Ref = useRef<HTMLDivElement>(null);

  const [activePair, setActivePair] = useState<0 | 1>(0);

  // Sync stage min-height on desktop resize without forced synchronous layout on initial load
  const syncStageHeight = useCallback(() => {
    if (!stageRef.current) return;
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      stageRef.current.style.minHeight = "";
      return;
    }
    const h1 = pair1Ref.current?.offsetHeight || 0;
    const h2 = pair2Ref.current?.offsetHeight || 0;
    const maxH = Math.max(h1, h2);
    if (maxH > 0) {
      stageRef.current.style.minHeight = `${maxH}px`;
    }
  }, []);

  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger);

      const mm = gsap.matchMedia();

      // Desktop & large tablet (>= 768px wide and >= 600px tall)
      // Uses CSS sticky for zero-bleed pinning, and lightweight GSAP scroll scrub for the transition
      mm.add("(min-width: 768px) and (min-height: 600px)", () => {
        // Timeline connected directly to container scroll progress
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 80px",
            end: "bottom bottom",
            scrub: 0.6,
            snap: {
              snapTo: [0, 1],
              duration: { min: 0.2, max: 0.4 },
              delay: 0.15,
              ease: "power1.out",
            },
            onUpdate: (self) => {
              const next = self.progress >= 0.5 ? 1 : 0;
              setActivePair((curr) => (curr !== next ? next : curr));
            },
          },
        });

        // ── Timeline Choreography (duration normalized across container scroll distance) ──
        // 0.00 - 0.22: Hold Pair 1 (User enters section and observes first pair at rest)
        // 0.22 - 0.65: Pair 1 smoothly transitions out (floats up subtly, scales to 0.97, fades)
        // 0.50: Midpoint pointerEvents swap so newly visible cards become immediately interactive
        // 0.42 - 0.82: Pair 2 smoothly transitions in (floats in from y: 28 to 0, scales to 1.0, fades in)
        // 0.82 - 1.00: Hold Pair 2 (User observes second pair at rest)

        // Exit Pair 1
        tl.to(
          pair1Ref.current,
          {
            autoAlpha: 0,
            y: -28,
            scale: 0.97,
            duration: 0.45,
            ease: "power2.inOut",
          },
          0.22
        );

        // Swap pointer events at midpoint
        tl.set(pair1Ref.current, { pointerEvents: "none" }, 0.5);
        tl.set(pair2Ref.current, { pointerEvents: "auto" }, 0.5);

        // Enter Pair 2
        tl.fromTo(
          pair2Ref.current,
          {
            autoAlpha: 0,
            y: 28,
            scale: 0.97,
          },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.45,
            ease: "power2.inOut",
          },
          0.42
        );

        // Buffer holding Pair 2 comfortably in place before unpinning
        tl.to({}, { duration: 0.18 }, 0.82);
      });

      // Mobile / compact screens fallback: Natural vertical flow without pinning or scroll trap
      mm.add("(max-width: 767px), (max-height: 599px)", () => {
        gsap.set([pair1Ref.current, pair2Ref.current], { clearProps: "all" });
        if (stageRef.current) {
          stageRef.current.style.minHeight = "";
        }
      });

      return () => {
        mm.revert();
      };
    },
    { scope: containerRef }
  );

  // Passive, debounced resize listener: zero overhead on page load
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        syncStageHeight();
        ScrollTrigger.refresh();
      }, 150);
    };
    window.addEventListener("resize", handleResize, { passive: true });
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", handleResize);
    };
  }, [syncStageHeight]);

  // Clickable indicator allows jumping smoothly between pairs
  const scrollToPair = useCallback((targetIndex: 0 | 1) => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const containerTop = rect.top + scrollTop;
    const scrollableDistance = container.offsetHeight - window.innerHeight + 80;

    const targetY =
      targetIndex === 0
        ? containerTop - 70
        : containerTop - 70 + Math.max(0, scrollableDistance * 0.9);

    window.scrollTo({
      top: targetY,
      behavior: "smooth",
    });
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full md:h-[220vh]"
    >
      {/* Pinned / Sticky Viewport Presentation Container */}
      <div
        ref={stickyRef}
        className="w-full flex min-h-0 flex-col gap-y-6 md:sticky md:top-20 z-10"
      >
        {/* Header section with Scrollytelling Pair Pill */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <BlurFade delay={BLUR_FADE_DELAY * 11}>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                <DecryptedText
                  text="Featured Projects"
                  animateOn="view"
                  once={true}
                  sequential={true}
                  speed={75}
                  maxIterations={16}
                  className="text-foreground"
                  encryptedClassName="text-zinc-500/80 dark:text-zinc-400/80 font-mono"
                />
              </h2>

              {/* Project Pair Tab Control (Desktop) */}
              <div
                className="hidden md:inline-flex items-center p-0.5 rounded-lg bg-muted/60 dark:bg-zinc-900/60 border border-border/60 text-xs select-none"
                role="tablist"
                aria-label="Featured project pairs"
              >
                <button
                  type="button"
                  role="tab"
                  onClick={() => scrollToPair(0)}
                  aria-selected={activePair === 0}
                  aria-label="View projects 1 and 2"
                  className={cn(
                    "px-2.5 py-1 rounded-md transition-all duration-200 cursor-pointer font-medium text-xs",
                    activePair === 0
                      ? "bg-background text-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  1 – 2
                </button>
                <button
                  type="button"
                  role="tab"
                  onClick={() => scrollToPair(1)}
                  aria-selected={activePair === 1}
                  aria-label="View projects 3 and 4"
                  className={cn(
                    "px-2.5 py-1 rounded-md transition-all duration-200 cursor-pointer font-medium text-xs",
                    activePair === 1
                      ? "bg-background text-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  3 – 4
                </button>
              </div>
            </div>
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

        {/* Pinned Presentation Stage: Pair 1 and Pair 2 occupy the exact same 2-column grid area */}
        <div ref={stageRef} className="relative w-full pt-1 transition-[min-height] duration-200">
          {/* Pair 1: Projects 0 & 1 */}
          <div
            ref={pair1Ref}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full items-stretch"
            style={{ opacity: 1, pointerEvents: "auto" }}
          >
            <div className="h-full flex flex-col">
              <ProjectCard
                project={LANDING_PROJECTS[0] as any}
                index={0}
                enableInViewAnimation={false}
              />
            </div>
            <div className="h-full flex flex-col">
              <ProjectCard
                project={LANDING_PROJECTS[1] as any}
                index={1}
                enableInViewAnimation={false}
              />
            </div>
          </div>

          {/* Pair 2: Projects 2 & 3 (Absolute overlay on desktop, vertical flow on mobile) */}
          <div
            ref={pair2Ref}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full items-stretch md:absolute md:inset-0 pt-4 md:pt-0"
            style={{ opacity: 0, pointerEvents: "none" }}
          >
            <div className="h-full flex flex-col">
              <ProjectCard
                project={LANDING_PROJECTS[2] as any}
                index={2}
                enableInViewAnimation={false}
              />
            </div>
            <div className="h-full flex flex-col">
              <ProjectCard
                project={LANDING_PROJECTS[3] as any}
                index={3}
                enableInViewAnimation={false}
              />
            </div>
          </div>
        </div>

        {/* Bottom Explore Banner */}
        <BlurFade delay={BLUR_FADE_DELAY * 12}>
          <div className="mt-3 flex justify-center">
            <StarBorder
              as={Link}
              href="/projects"
              radius={16}
              duration={4}
              glow={0.5}
              sparkle
              hover="lap"
              clickPulse
              className="group/btn inline-flex items-center gap-2.5 px-6 py-3 text-xs font-medium shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg cursor-pointer"
            >
              <FolderGit2 className="size-4 text-muted-foreground group-hover/btn:text-foreground transition-colors" />
              <span>More Projects ({DATA.projects.length})</span>
              <ArrowRight className="size-3.5 opacity-60 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
            </StarBorder>
          </div>
        </BlurFade>
      </div>
    </div>
  );
}

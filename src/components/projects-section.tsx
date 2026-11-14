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
  const pinRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const pair1Ref = useRef<HTMLDivElement>(null);
  const pair2Ref = useRef<HTMLDivElement>(null);
  const card0Ref = useRef<HTMLDivElement>(null);
  const card1Ref = useRef<HTMLDivElement>(null);
  const card2Ref = useRef<HTMLDivElement>(null);
  const card3Ref = useRef<HTMLDivElement>(null);

  const [activePair, setActivePair] = useState<0 | 1>(0);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);

  // Sync stage min-height so absolute overlay never clips or causes layout shift
  const updateStageHeight = useCallback(() => {
    if (!stageRef.current) return;
    if (window.innerWidth < 768) {
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

      // Desktop & large tablet with adequate viewport height: enable pinned scrollytelling
      mm.add("(min-width: 768px) and (min-height: 600px)", () => {
        // Measure initial stage height
        updateStageHeight();

        // 1. Initial visual states
        gsap.set(pair1Ref.current, { autoAlpha: 1, pointerEvents: "auto" });
        gsap.set(pair2Ref.current, { autoAlpha: 0, pointerEvents: "none" });
        gsap.set([card0Ref.current, card1Ref.current], {
          y: 0,
          scale: 1,
          autoAlpha: 1,
          force3D: true,
        });
        gsap.set([card2Ref.current, card3Ref.current], {
          y: 28,
          scale: 0.96,
          autoAlpha: 0,
          force3D: true,
        });

        // 2. Timeline with ScrollTrigger pin & scrub
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            pin: pinRef.current,
            start: "top 72px",
            end: "+=1150",
            scrub: 0.8,
            anticipatePin: 1,
            pinSpacing: true,
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
            onRefresh: () => {
              updateStageHeight();
            },
          },
        });

        scrollTriggerRef.current = tl.scrollTrigger || null;

        // ── Choreographed Timeline ──
        // 0.00 - 0.35: Hold Pair 1 (User observes first pair at rest)
        // 0.35 - 1.15: Smooth cross-transition between Pair 1 and Pair 2
        // 1.45 - 1.95: Hold Pair 2 (User observes second pair at rest)

        // Pair 1 Exit (Card 0 leads, Card 1 follows with slight stagger)
        tl.to(
          card0Ref.current,
          {
            y: -28,
            scale: 0.96,
            autoAlpha: 0,
            duration: 0.68,
            ease: "power2.inOut",
          },
          0.35
        );
        tl.to(
          card1Ref.current,
          {
            y: -28,
            scale: 0.96,
            autoAlpha: 0,
            duration: 0.68,
            ease: "power2.inOut",
          },
          0.42
        );

        // Midpoint pointerEvents swap so active cards receive clicks/hover
        tl.set(pair1Ref.current, { pointerEvents: "none" }, 0.85);
        tl.set(pair2Ref.current, { pointerEvents: "auto" }, 0.85);

        // Pair 2 Entrance (Card 2 enters, Card 3 follows with slight stagger)
        tl.to(
          card2Ref.current,
          {
            y: 0,
            scale: 1,
            autoAlpha: 1,
            duration: 0.68,
            ease: "power2.inOut",
          },
          0.68
        );
        tl.to(
          card3Ref.current,
          {
            y: 0,
            scale: 1,
            autoAlpha: 1,
            duration: 0.68,
            ease: "power2.inOut",
          },
          0.75
        );

        // Buffer holding Pair 2 comfortably in place before unpinning
        tl.to({}, { duration: 0.45 }, 1.5);

        return () => {
          scrollTriggerRef.current = null;
        };
      });

      // Mobile / compact screens: Clean fallback without scroll-trapping
      mm.add("(max-width: 767px), (max-height: 599px)", () => {
        gsap.set(
          [
            pair1Ref.current,
            pair2Ref.current,
            card0Ref.current,
            card1Ref.current,
            card2Ref.current,
            card3Ref.current,
          ],
          { clearProps: "all" }
        );
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

  // Re-measure on window resize and image load
  useEffect(() => {
    const handleResize = () => {
      updateStageHeight();
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", handleResize);
    window.addEventListener("load", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("load", handleResize);
    };
  }, [updateStageHeight]);

  // Clickable indicator allows jumping smoothly between pairs
  const scrollToPair = useCallback((targetIndex: 0 | 1) => {
    const st = scrollTriggerRef.current;
    if (!st) return;
    const targetY =
      targetIndex === 0
        ? st.start + 2
        : st.start + (st.end - st.start) * 0.88;
    window.scrollTo({
      top: targetY,
      behavior: "smooth",
    });
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Pinned Viewport Container */}
      <div ref={pinRef} className="relative w-full flex min-h-0 flex-col gap-y-6">
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
              <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/80 dark:bg-muted/40 px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground border border-border/70">
                <span className="size-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-pulse" />
                {DATA.projects.length} Shipped
              </span>

              {/* Scrollytelling Presentation Indicator (Desktop) */}
              <div
                className="hidden md:inline-flex items-center gap-1 p-0.5 rounded-full bg-muted/70 dark:bg-zinc-900/70 border border-border/70 text-[10px] font-mono select-none"
                role="tablist"
                aria-label="Project presentation sets"
              >
                <button
                  type="button"
                  role="tab"
                  onClick={() => scrollToPair(0)}
                  aria-selected={activePair === 0}
                  aria-label="View first pair of projects"
                  className={cn(
                    "px-2 py-0.5 rounded-full transition-all duration-200 cursor-pointer font-medium",
                    activePair === 0
                      ? "bg-foreground text-background shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  01
                </button>
                <span className="text-muted-foreground/30" aria-hidden="true">•</span>
                <button
                  type="button"
                  role="tab"
                  onClick={() => scrollToPair(1)}
                  aria-selected={activePair === 1}
                  aria-label="View second pair of projects"
                  className={cn(
                    "px-2 py-0.5 rounded-full transition-all duration-200 cursor-pointer font-medium",
                    activePair === 1
                      ? "bg-foreground text-background shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  02
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
          >
            <div ref={card0Ref} className="h-full flex flex-col will-change-transform">
              <ProjectCard
                project={LANDING_PROJECTS[0] as any}
                index={0}
                enableInViewAnimation={false}
              />
            </div>
            <div ref={card1Ref} className="h-full flex flex-col will-change-transform">
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
          >
            <div ref={card2Ref} className="h-full flex flex-col will-change-transform">
              <ProjectCard
                project={LANDING_PROJECTS[2] as any}
                index={2}
                enableInViewAnimation={false}
              />
            </div>
            <div ref={card3Ref} className="h-full flex flex-col will-change-transform">
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

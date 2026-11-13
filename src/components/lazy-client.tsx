"use client";

import dynamic from "next/dynamic";
import React from "react";
import { useInitialLoader } from "@/components/initial-loader";

export const VisitorCounter = dynamic(
  () => import("@/components/visitor-counter"),
  { ssr: false }
);

const DynamicBirthdayFireworks = dynamic(
  () => import("@/components/birthday-fireworks").then((mod) => mod.BirthdayFireworks),
  { ssr: false }
);

export function BirthdayFireworks() {
  const [isBirthday, setIsBirthday] = React.useState(false);

  React.useEffect(() => {
    const now = new Date();
    if (now.getMonth() === 8 && now.getDate() === 16) {
      setIsBirthday(true);
    }
  }, []);

  if (!isBirthday) return null;
  return <DynamicBirthdayFireworks />;
}

const DynamicBirthdayHat = dynamic(
  () => import("@/components/birthday-hat").then((mod) => mod.BirthdayHat),
  { ssr: false }
);

export function BirthdayHat() {
  const [isBirthday, setIsBirthday] = React.useState(false);

  React.useEffect(() => {
    const now = new Date();
    if (now.getMonth() === 8 && now.getDate() === 16) {
      setIsBirthday(true);
    }
  }, []);

  if (!isBirthday) return null;
  return <DynamicBirthdayHat />;
}

function useLazySection(ref: React.RefObject<HTMLDivElement | null>, anchorKeyword?: string) {
  const { isLoaded } = useInitialLoader();
  const [shouldLoad, setShouldLoad] = React.useState(false);

  React.useEffect(() => {
    if (shouldLoad) return;
    const el = ref.current;
    if (!el) return;

    // If anchor hash directly targets this section, load immediately
    if (
      anchorKeyword &&
      typeof window !== "undefined" &&
      window.location.hash.toLowerCase().includes(anchorKeyword.toLowerCase())
    ) {
      setShouldLoad(true);
      return;
    }

    if (!("IntersectionObserver" in window)) {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "350px" }
    );

    observer.observe(el);

    // Safety fallback: once homepage is visible, gentle idle prefetch ensures section is never stuck
    let idleTimer: any;
    if (isLoaded) {
      if ("requestIdleCallback" in window) {
        idleTimer = (window as any).requestIdleCallback(() => setShouldLoad(true), { timeout: 6000 });
      } else {
        idleTimer = setTimeout(() => setShouldLoad(true), 6000);
      }
    }

    return () => {
      observer.disconnect();
      if (idleTimer) {
        if ("cancelIdleCallback" in window) {
          (window as any).cancelIdleCallback(idleTimer);
        } else {
          clearTimeout(idleTimer);
        }
      }
    };
  }, [isLoaded, anchorKeyword, shouldLoad, ref]);

  return shouldLoad;
}

const DynamicGitHubCalendarSection = dynamic(
  () => import("@/components/github-calendar-section").then((mod) => mod.GitHubCalendarSection),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-44 rounded-2xl border border-border/40 bg-muted/20 animate-pulse flex items-center justify-center text-xs text-muted-foreground">
        Loading GitHub activity...
      </div>
    ),
  }
);

export function GitHubCalendarSection() {
  const ref = React.useRef<HTMLDivElement>(null);
  const shouldLoad = useLazySection(ref, "github");

  return (
    <div ref={ref}>
      {shouldLoad ? (
        <DynamicGitHubCalendarSection />
      ) : (
        <div className="w-full h-44 rounded-2xl border border-border/40 bg-muted/20 animate-pulse flex items-center justify-center text-xs text-muted-foreground">
          Loading GitHub activity...
        </div>
      )}
    </div>
  );
}

const DynamicTechStackSection = dynamic(
  () => import("@/components/tech-stack-section").then((mod) => mod.TechStackSection),
  {
    loading: () => (
      <div className="w-full h-48 rounded-2xl border border-border/40 bg-muted/20 animate-pulse flex items-center justify-center text-xs text-muted-foreground">
        Loading tech stack...
      </div>
    ),
  }
);

export function TechStackSection() {
  const ref = React.useRef<HTMLDivElement>(null);
  const shouldLoad = useLazySection(ref, "skill");

  return (
    <div ref={ref}>
      {shouldLoad ? (
        <DynamicTechStackSection />
      ) : (
        <div className="w-full h-48 rounded-2xl border border-border/40 bg-muted/20 animate-pulse flex items-center justify-center text-xs text-muted-foreground">
          Loading tech stack...
        </div>
      )}
    </div>
  );
}

const DynamicProjectsSection = dynamic(
  () => import("@/components/projects-section").then((mod) => mod.ProjectsSection),
  {
    loading: () => (
      <div className="w-full h-72 rounded-2xl border border-border/40 bg-muted/20 animate-pulse flex items-center justify-center text-xs text-muted-foreground">
        Loading projects...
      </div>
    ),
  }
);

export function ProjectsSection() {
  const ref = React.useRef<HTMLDivElement>(null);
  const shouldLoad = useLazySection(ref, "project");

  return (
    <div ref={ref}>
      {shouldLoad ? (
        <DynamicProjectsSection />
      ) : (
        <div className="w-full h-72 rounded-2xl border border-border/40 bg-muted/20 animate-pulse flex items-center justify-center text-xs text-muted-foreground">
          Loading projects...
        </div>
      )}
    </div>
  );
}

const DynamicCommandPalette = dynamic(
  () => import("@/components/command-palette").then((mod) => mod.CommandPalette),
  { ssr: false }
);

export function CommandPalette() {
  const { isLoaded } = useInitialLoader();
  const [shouldLoad, setShouldLoad] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined" || window.innerWidth < 768) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        setShouldLoad(true);
      }
    };
    window.addEventListener("keydown", onKey);

    let idleTimer: any;
    if (isLoaded) {
      if ("requestIdleCallback" in window) {
        idleTimer = (window as any).requestIdleCallback(() => setShouldLoad(true), { timeout: 4000 });
      } else {
        idleTimer = setTimeout(() => setShouldLoad(true), 3000);
      }
    }

    return () => {
      window.removeEventListener("keydown", onKey);
      if (idleTimer) {
        if ("cancelIdleCallback" in window) {
          (window as any).cancelIdleCallback(idleTimer);
        } else {
          clearTimeout(idleTimer);
        }
      }
    };
  }, [isLoaded]);

  if (!shouldLoad) return null;
  return <DynamicCommandPalette />;
}

const DynamicBackToTop = dynamic(
  () => import("@/components/back-to-top").then((mod) => mod.BackToTop),
  { ssr: false }
);

export function BackToTop() {
  const [shouldLoad, setShouldLoad] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShouldLoad(true);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!shouldLoad) return null;
  return <DynamicBackToTop />;
}

export { ScrollProgress } from "@/components/scroll-progress";

const DynamicScrollRail = dynamic(
  () => import("@/components/scroll-rail").then((mod) => mod.ScrollRail),
  { ssr: false }
);

export function ScrollRail(props: any) {
  const [isDesktop, setIsDesktop] = React.useState(false);

  React.useEffect(() => {
    if (window.innerWidth >= 1024) {
      setIsDesktop(true);
    }
  }, []);

  if (!isDesktop) return null;
  return <DynamicScrollRail {...props} />;
}

const DynamicXHoverCard = dynamic(
  () => import("@/components/x-hover-card").then((mod) => mod.XHoverCard),
  { ssr: false }
);

export function XHoverCard({ children }: { children: React.ReactNode }) {
  const [isDesktop, setIsDesktop] = React.useState(false);

  React.useEffect(() => {
    if (window.innerWidth >= 768 && window.matchMedia("(hover: hover)").matches) {
      setIsDesktop(true);
    }
  }, []);

  if (!isDesktop) return <>{children}</>;
  return <DynamicXHoverCard>{children}</DynamicXHoverCard>;
}

const DynamicSwarmCursor = dynamic(
  () => import("@/components/ui/swarm-cursor").then((mod) => mod.SwarmCursor),
  { ssr: false }
);

export function SwarmCursor(props: any) {
  const { isLoaded } = useInitialLoader();
  const [shouldLoad, setShouldLoad] = React.useState(false);

  React.useEffect(() => {
    if (!isLoaded) return;
    if (
      window.innerWidth >= 768 &&
      window.matchMedia("(pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      if ("requestIdleCallback" in window) {
        (window as any).requestIdleCallback(() => setShouldLoad(true), { timeout: 2000 });
      } else {
        setTimeout(() => setShouldLoad(true), 1000);
      }
    }
  }, [isLoaded]);

  if (!shouldLoad) return null;
  return <DynamicSwarmCursor {...props} />;
}

export const Toaster = dynamic(
  () => import("@/components/ui/toast").then((mod) => mod.Toaster),
  { ssr: false }
);

// InitialLoader is eager — it's the first thing the user sees
export { InitialLoader, useInitialLoader } from "@/components/initial-loader";

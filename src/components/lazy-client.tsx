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
  const [shouldLoad, setShouldLoad] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if ("requestIdleCallback" in window) {
      const idleId = (window as any).requestIdleCallback(
        () => setShouldLoad(true),
        { timeout: 3500 }
      );
      return () => (window as any).cancelIdleCallback(idleId);
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
      { rootMargin: "50px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

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

export const TechStackSection = dynamic(
  () => import("@/components/tech-stack-section").then((mod) => mod.TechStackSection),
  {
    loading: () => (
      <div className="w-full h-48 rounded-2xl border border-border/40 bg-muted/20 animate-pulse flex items-center justify-center text-xs text-muted-foreground">
        Loading tech stack...
      </div>
    ),
  }
);

export const ProjectsSection = dynamic(
  () => import("@/components/projects-section").then((mod) => mod.ProjectsSection),
  {
    loading: () => (
      <div className="w-full h-72 rounded-2xl border border-border/40 bg-muted/20 animate-pulse flex items-center justify-center text-xs text-muted-foreground">
        Loading projects...
      </div>
    ),
  }
);

const DynamicCommandPalette = dynamic(
  () => import("@/components/command-palette").then((mod) => mod.CommandPalette),
  { ssr: false }
);

export function CommandPalette() {
  const [shouldLoad, setShouldLoad] = React.useState(false);

  React.useEffect(() => {
    if (window.innerWidth < 768) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        setShouldLoad(true);
      }
    };
    window.addEventListener("keydown", onKey);

    if ("requestIdleCallback" in window) {
      (window as any).requestIdleCallback(() => setShouldLoad(true), { timeout: 3500 });
    } else {
      setTimeout(() => setShouldLoad(true), 2000);
    }
    return () => window.removeEventListener("keydown", onKey);
  }, []);

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

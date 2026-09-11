"use client";

import dynamic from "next/dynamic";
import React from "react";

export const VisitorCounter = dynamic(
  () => import("@/components/visitor-counter"),
  { ssr: false }
);

export const BirthdayFireworks = dynamic(
  () => import("@/components/birthday-fireworks").then((mod) => mod.BirthdayFireworks),
  { ssr: false }
);

export const GitHubCalendarSection = dynamic(
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

export const CommandPalette = dynamic(
  () => import("@/components/command-palette").then((mod) => mod.CommandPalette),
  { ssr: false }
);

export const BackToTop = dynamic(
  () => import("@/components/back-to-top").then((mod) => mod.BackToTop),
  { ssr: false }
);

export const ScrollProgress = dynamic(
  () => import("@/components/scroll-progress").then((mod) => mod.ScrollProgress),
  { ssr: false }
);

export const XHoverCard = dynamic(
  () => import("@/components/x-hover-card").then((mod) => mod.XHoverCard),
  { ssr: false }
);

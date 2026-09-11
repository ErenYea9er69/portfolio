"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import GitHubCalendar from "react-github-calendar";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import BlurFade from "@/components/magicui/blur-fade";
import { BorderBeam } from "@/components/magicui/border-beam";
import { Flame, Zap, BookOpen, GitCommitHorizontal, ArrowUpRight, Activity, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { DATA } from "@/data/resume";
import { Tooltip as ReactTooltip } from "react-tooltip";
import { useTheme } from "next-themes";

const YEARS = ["last", "2026", "2025"];

export function GitHubCalendarSection() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [selectedYear, setSelectedYear] = useState<string>("last");
  const [artMode, setArtMode] = useState(false);

  // Interactive mouse spotlight position
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // States for GitHub API data
  const [reposCount, setReposCount] = useState<number | null>(null);

  // States for streak calculation
  const [totalContributions, setTotalContributions] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [maxContributions, setMaxContributions] = useState(0);
  const [peakDate, setPeakDate] = useState("");
  const [activeDays, setActiveDays] = useState(0);
  const [todayContributions, setTodayContributions] = useState<number | null>(null);

  // Calendar scroll ref to ensure today's date is always visible
  const calendarScrollRef = useRef<HTMLDivElement>(null);

  // Today's date string in YYYY-MM-DD
  const todayStr = useMemo(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  const scrollToLatest = () => {
    if (calendarScrollRef.current) {
      calendarScrollRef.current.scrollTo({
        left: calendarScrollRef.current.scrollWidth,
        behavior: "smooth",
      });
    }
  };

  // Automatically scroll to today's date on mount or when data/year updates
  useEffect(() => {
    const scrollToEnd = () => {
      if (calendarScrollRef.current) {
        calendarScrollRef.current.scrollLeft = calendarScrollRef.current.scrollWidth;
      }
    };
    scrollToEnd();
    const t1 = setTimeout(scrollToEnd, 100);
    const t2 = setTimeout(scrollToEnd, 300);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [mounted, selectedYear, totalContributions]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // Fetch GitHub User data
  useEffect(() => {
    async function fetchGitHubData() {
      try {
        const username = DATA.contact.social.GitHub.url.split("/").pop();
        if (!username) return;
        const res = await fetch(`https://api.github.com/users/${username}`);
        const data = await res.json();
        if (data.public_repos !== undefined) {
          setReposCount(data.public_repos);
        }
      } catch (err) {
        console.error("Failed to fetch GitHub data:", err);
      }
    }
    fetchGitHubData();
  }, []);

  const selectData = (contributions: any[]) => {
    if (!contributions || contributions.length === 0) return contributions;

    let total = 0;
    let current = 0;
    let longest = 0;
    let tempStreak = 0;
    let maxCount = 0;
    let pDate = "";
    let activeDaysCount = 0;

    // Calculate streaks & peaks
    for (const day of contributions) {
      total += day.count;

      if (day.count > 0) {
        activeDaysCount++;
      }

      if (day.count > maxCount) {
        maxCount = day.count;
        pDate = day.date;
      }

      if (day.count > 0) {
        tempStreak++;
        if (tempStreak > longest) {
          longest = tempStreak;
        }
      } else {
        tempStreak = 0;
      }
    }

    // For current streak, count backwards from today or last available day
    let currentTemp = 0;
    for (let i = contributions.length - 1; i >= 0; i--) {
      if (contributions[i].count > 0) {
        currentTemp++;
      } else {
        if (i === contributions.length - 1) {
          continue; // skip today if it's 0
        }
        break;
      }
    }

    // Check today's contributions count
    const todayItem = contributions.find((d: any) => d.date === todayStr);
    const todayCount = todayItem ? todayItem.count : (contributions[contributions.length - 1]?.count ?? 0);

    // Wrap in setTimeout to avoid updating state during render
    setTimeout(() => {
      setTotalContributions(total);
      setCurrentStreak(currentTemp);
      setLongestStreak(longest);
      setMaxContributions(maxCount);
      setPeakDate(pDate);
      setActiveDays(activeDaysCount);
      setTodayContributions(todayCount);
    }, 0);

    return contributions;
  };

  const username = DATA.contact.social.GitHub.url.split("/").pop() || "ErenYea9er69";

  const formattedPeakDate = useMemo(() => {
    if (!peakDate) return "";
    try {
      return new Date(peakDate + "T00:00:00").toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return peakDate;
    }
  }, [peakDate]);

  // Color schemes for calendar
  const calendarTheme = useMemo(() => {
    const isDark = !mounted || resolvedTheme === "dark";
    if (artMode) {
      return {
        dark: [
          "rgba(255, 255, 255, 0.05)",
          "#1e1b4b", // deep cosmic indigo
          "#4f46e5", // vibrant indigo
          "#9333ea", // royal cyber purple
          "#ec4899", // glowing neon fuchsia
        ],
        light: [
          "rgba(0, 0, 0, 0.06)",
          "#fed7aa", // peach amber
          "#fb923c", // vivid coral
          "#db2777", // deep rose
          "#7c3aed", // royal violet
        ],
      };
    }
    return {
      dark: [
        "rgba(255, 255, 255, 0.05)", // level 0: deep frosted glass
        "#0e4429",                   // level 1: forest emerald
        "#006d32",                   // level 2: vibrant emerald
        "#26a641",                   // level 3: bright cyber green
        "#39d353",                   // level 4: luminous neon green
      ],
      light: [
        "rgba(0, 0, 0, 0.06)",       // level 0: clean subtle tint
        "#a7f3d0",                   // level 1: mint
        "#34d399",                   // level 2: jade
        "#059669",                   // level 3: emerald
        "#064e3b",                   // level 4: deep forest
      ],
    };
  }, [mounted, resolvedTheme, artMode]);

  return (
    <div className="flex flex-col gap-y-3">
      <BlurFade delay={0.04 * 14}>
        <span className="inline-block text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground/60">
          OPEN SOURCE TELEMETRY
        </span>
        <h2 className="mt-1.5 text-xl font-bold tracking-tight">GitHub Contributions</h2>
      </BlurFade>

      <BlurFade delay={0.04 * 14.5}>
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="group/section relative overflow-hidden rounded-2xl border border-white/10 dark:border-white/[0.08] bg-gradient-to-b from-card/85 via-card/55 to-card/30 dark:from-zinc-950/80 dark:via-zinc-900/60 dark:to-zinc-950/85 p-6 sm:p-7 backdrop-blur-2xl shadow-[0_12px_40px_-10px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.1)] transition-all duration-300"
        >
          {/* Subtle Silver/Chrome Edge Beam */}
          <BorderBeam size={160} duration={12} colorFrom="hsl(var(--muted-foreground) / 0.35)" colorTo="transparent" />

          {/* Ambient Gray Theme Corner Lighting */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-zinc-500/[0.06] dark:bg-zinc-400/[0.06] blur-3xl transition-opacity duration-700"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-zinc-600/[0.04] dark:bg-zinc-500/[0.05] blur-3xl transition-opacity duration-700"
          />

          {/* Dynamic Interactive Cursor Spotlight (Monochrome Frosted Glass) */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover/section:opacity-100"
            style={{
              background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, hsl(var(--foreground) / 0.04), transparent 45%)`,
            }}
          />

          {/* ─── Header: Profile & Controls ─── */}
          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-7">
            <div className="flex items-center gap-3.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/40 border border-border/70 text-foreground shadow-xs">
                <Icons.github className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <a
                    href={DATA.contact.social.GitHub.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-foreground hover:text-emerald-500 transition-colors flex items-center gap-1 group/link text-base tracking-tight"
                  >
                    <span>@{username}</span>
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-50 group-hover/link:opacity-100 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-all" />
                  </a>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-mono font-medium text-emerald-600 dark:text-emerald-400">
                    LIVE FEED
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">GitHub Open Source Activity</p>
              </div>
            </div>

            {/* Controls: Year Switcher & Art Mode */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center rounded-full border border-border/60 bg-background/50 p-1 backdrop-blur-md shadow-sm">
                {YEARS.map((year) => (
                  <button
                    key={year}
                    onClick={() => setSelectedYear(year)}
                    className={cn(
                      "relative rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-200",
                      selectedYear === year
                        ? "bg-background text-foreground shadow-sm shadow-black/10 font-semibold border border-border/60"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {year === "last" ? "Past Year" : year}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setArtMode(!artMode)}
                className={cn(
                  "relative inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 border cursor-pointer select-none",
                  artMode
                    ? "bg-gradient-to-r from-violet-500/20 via-fuchsia-500/20 to-pink-500/20 text-foreground border-violet-500/40 shadow-xs"
                    : "bg-background/50 hover:bg-background/80 text-muted-foreground hover:text-foreground border-border/60"
                )}
                title="Toggle dynamic Aurora art mode"
              >
                <Sparkles className={cn("size-3.5 transition-colors", artMode ? "text-violet-400 animate-spin" : "text-muted-foreground")} style={{ animationDuration: "8s" }} />
                <span>{artMode ? "Aurora Art" : "Art Mode"}</span>
              </button>
            </div>
          </div>

          {/* ─── Stats Grid (4 Focused Cards) ─── */}
          <div className="relative z-10 grid grid-cols-2 gap-3.5 sm:gap-4 md:grid-cols-4 mb-7">
            {/* 1. Contributions */}
            <div className="group/stat relative overflow-hidden rounded-xl border border-border/50 bg-background/50 p-4 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-border hover:bg-background/80 hover:shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Contributions</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/70 text-foreground/70 transition-colors group-hover/stat:text-foreground">
                  <GitCommitHorizontal className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  {totalContributions.toLocaleString()}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground/80">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
                <span>{selectedYear === "last" ? "Past 365 days" : `Year ${selectedYear}`}</span>
              </div>
            </div>

            {/* 2. Current Streak */}
            <div className="group/stat relative overflow-hidden rounded-xl border border-border/50 bg-background/50 p-4 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-border hover:bg-background/80 hover:shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Current streak</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/70 text-foreground/70 transition-colors group-hover/stat:text-foreground">
                  <Flame className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  {currentStreak}
                </span>
                <span className="text-xs font-medium text-muted-foreground">days</span>
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground/80">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
                <span>{currentStreak > 0 ? "Active streak" : "Ready to commit"}</span>
              </div>
            </div>

            {/* 3. Longest Streak */}
            <div className="group/stat relative overflow-hidden rounded-xl border border-border/50 bg-background/50 p-4 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-border hover:bg-background/80 hover:shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Longest streak</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/70 text-foreground/70 transition-colors group-hover/stat:text-foreground">
                  <Zap className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  {longestStreak}
                </span>
                <span className="text-xs font-medium text-muted-foreground">days</span>
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground/80">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
                <span>Personal record</span>
              </div>
            </div>

            {/* 4. Repositories */}
            <a
              href={`${DATA.contact.social.GitHub.url}?tab=repositories`}
              target="_blank"
              rel="noopener noreferrer"
              className="group/stat relative overflow-hidden rounded-xl border border-border/50 bg-background/50 p-4 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-border hover:bg-background/80 hover:shadow-xs cursor-pointer block"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Repositories</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/70 text-foreground/70 transition-colors group-hover/stat:text-foreground">
                  <BookOpen className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  {reposCount ?? "—"}
                </span>
                <ArrowUpRight className="h-3.5 w-3.5 opacity-40 group-hover/stat:opacity-100 transition-opacity text-foreground ml-1" />
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground/80">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
                <span>Public codebases</span>
              </div>
            </a>
          </div>

          {/* ─── The Contribution Matrix Card ─── */}
          <div className="relative z-10 rounded-xl border border-border/50 bg-background/35 dark:bg-zinc-950/40 p-4 sm:p-5 backdrop-blur-md overflow-hidden shadow-inner">

            {/* Micro grid watermark pattern */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.025] dark:opacity-[0.04]"
              style={{
                backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
                backgroundSize: "18px 18px",
              }}
            />

            {/* Matrix Telemetry Top Bar */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 mb-4 text-xs">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Activity className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
                <span className="font-semibold text-foreground">{totalContributions.toLocaleString()}</span>
                <span>contributions in {selectedYear === "last" ? "the past year" : selectedYear}</span>
                {peakDate && (
                  <span className="hidden sm:inline-flex items-center gap-1.5 rounded-md bg-muted/60 dark:bg-zinc-900/80 px-2 py-0.5 text-[11px] text-muted-foreground border border-border/40">
                    <span className="text-emerald-500">★</span> Peak: {maxContributions} on {formattedPeakDate}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono">
                <button
                  type="button"
                  onClick={scrollToLatest}
                  className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 transition-all border border-emerald-500/20 cursor-pointer text-[10px] font-semibold tracking-tight"
                  title="Jump to Today's contributions"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Today ({todayContributions !== null ? `${todayContributions} commits` : "10/09"})</span>
                </button>
                <span className="text-muted-foreground/60 hidden sm:inline">INTERACTIVE MATRIX</span>
              </div>
            </div>

            {/* Calendar Canvas */}
            <div
              ref={calendarScrollRef}
              className="github-calendar-wrapper overflow-x-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40 pb-2.5 min-w-full"
            >
              <div className="min-w-fit w-full flex justify-center sm:justify-start lg:justify-center p-1">
                <GitHubCalendar
                  username={username}
                  year={selectedYear === "last" ? "last" : parseInt(selectedYear)}
                  colorScheme={mounted && resolvedTheme === "light" ? "light" : "dark"}
                  transformData={selectData}
                  hideTotalCount
                  hideColorLegend={false}
                  blockRadius={2.5}
                  blockMargin={3}
                  blockSize={10.5}
                  fontSize={11}
                  renderBlock={(block, activity) => {
                    const isToday = activity.date === todayStr;
                    return React.cloneElement(block as any, {
                      "data-tooltip-id": "github-tooltip",
                      "data-tooltip-content": JSON.stringify({
                        date: activity.date,
                        count: activity.count,
                        level: activity.level,
                        isToday,
                      }),
                      style: {
                        ...(block as any).props?.style,
                        ...(isToday
                          ? {
                              stroke: "#34d399",
                              strokeWidth: 2,
                              filter: "drop-shadow(0 0 4px rgba(52, 211, 153, 0.8))",
                            }
                          : {}),
                      },
                    });
                  }}
                  theme={calendarTheme}
                />
              </div>
            </div>

            {/* Matrix Telemetry Footer Bar */}
            <div className="mt-3 pt-3 border-t border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-3">
                <span>
                  Active Days: <strong className="text-foreground">{activeDays}</strong>
                </span>
                <span>•</span>
                <span>
                  Consistency: <strong className="text-foreground">{((activeDays / 365) * 100).toFixed(0)}%</strong>
                </span>
              </div>
              <a
                href={DATA.contact.social.GitHub.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-emerald-500 transition-colors flex items-center gap-1 w-fit group/btn font-medium"
              >
                <span>Inspect full graph on GitHub</span>
                <ArrowUpRight className="h-3 w-3 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
              </a>
            </div>
          </div>

          {/* ─── Ultra-Modern Frosted Glass Tooltip ─── */}
          <ReactTooltip
            id="github-tooltip"
            place="top"
            offset={8}
            delayShow={30}
            delayHide={50}
            className="!bg-popover/95 !backdrop-blur-2xl !border !border-border/80 !rounded-xl !p-3 !shadow-2xl !z-50 !opacity-100"
            render={({ content }) => {
              if (!content) return null;
              if (typeof content !== "string") return <span>{content}</span>;
              try {
                const data = JSON.parse(content);
                const isToday = data.isToday || data.date === todayStr;
                const dateObj = new Date(data.date + "T00:00:00");
                const formattedDate = dateObj.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });

                const levelColors = [
                  "bg-muted-foreground/30",
                  "bg-emerald-700",
                  "bg-emerald-600",
                  "bg-emerald-500",
                  "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]",
                ];

                const levelColor = levelColors[data.level] || levelColors[0];

                return (
                  <div className="flex flex-col gap-1.5 min-w-[165px] text-foreground">
                    <div className="flex items-center justify-between gap-3 border-b border-border/50 pb-1.5">
                      <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                        {formattedDate}
                        {isToday && (
                          <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            Today
                          </span>
                        )}
                      </span>
                      <span className={cn("h-2 w-2 rounded-full", levelColor)} />
                    </div>
                    <div className="flex items-baseline gap-1.5 pt-0.5">
                      <span className="text-xl font-extrabold text-foreground leading-none">
                        {data.count}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {data.count === 1 ? "contribution" : "contributions"}
                      </span>
                    </div>
                    <div className="text-[10px] font-medium tracking-wide text-emerald-500">
                      {data.count === 0
                        ? "No commits recorded"
                        : data.count >= 15
                        ? "🔥 Exceptional output"
                        : data.count >= 8
                        ? "⚡ High activity"
                        : "✨ Steady progress"}
                    </div>
                  </div>
                );
              } catch {
                return <span>{content}</span>;
              }
            }}
          />
        </div>
      </BlurFade>
    </div>
  );
}

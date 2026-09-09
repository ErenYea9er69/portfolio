"use client";

import React, { useEffect, useState } from "react";
import GitHubCalendar from "react-github-calendar";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import BlurFade from "@/components/magicui/blur-fade";
import { Flame, Zap, BookOpen, GitCommitHorizontal } from "lucide-react";
import { DATA } from "@/data/resume";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const YEARS = ["last", "2026", "2025"];

export function GitHubCalendarSection() {
  const [selectedYear, setSelectedYear] = useState<string>("last");
  const [reposCount, setReposCount] = useState<number | null>(null);
  
  // States for streak calculation
  const [totalContributions, setTotalContributions] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [maxContributions, setMaxContributions] = useState(0);
  const [peakDate, setPeakDate] = useState("");

  // Fetch repos count
  useEffect(() => {
    async function fetchRepos() {
      try {
        const username = DATA.contact.social.GitHub.url.split("/").pop();
        if (!username) return;
        const res = await fetch(`https://api.github.com/users/${username}`);
        const data = await res.json();
        if (data.public_repos) {
          setReposCount(data.public_repos);
        }
      } catch (err) {
        console.error("Failed to fetch repo count:", err);
      }
    }
    fetchRepos();
  }, []);

  const selectData = (contributions: any[]) => {
    if (!contributions || contributions.length === 0) return contributions;

    let total = 0;
    let current = 0;
    let longest = 0;
    let tempStreak = 0;
    let maxCount = 0;
    let pDate = "";

    // Calculate streaks
    // Contributions are usually sorted by date
    for (const day of contributions) {
      total += day.count;
      
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
    
    // For current streak, we count backwards from today or last available day
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

    // Wrap in setTimeout to avoid updating state during render of GitHubCalendar
    setTimeout(() => {
      setTotalContributions(total);
      setCurrentStreak(currentTemp);
      setLongestStreak(longest);
      setMaxContributions(maxCount);
      setPeakDate(pDate);
    }, 0);

    return contributions;
  };

  const username = DATA.contact.social.GitHub.url.split("/").pop() || "ErenYea9er69";

  const formattedPeakDate = peakDate ? new Date(peakDate).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }) : "";

  return (
    <div className="flex flex-col gap-y-3">
      <BlurFade delay={0.04 * 14}>
        <span className="inline-block text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground/60">
          OPEN SOURCE
        </span>
        <h2 className="mt-1.5 text-xl font-bold tracking-tight">GitHub Contributions</h2>
      </BlurFade>
      
      <BlurFade delay={0.04 * 14.5}>
        <div className="relative overflow-hidden rounded-xl border border-border/50 bg-card p-6 shadow-sm">
          {/* Header Row */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background/50 border border-border/50">
                <Icons.github className="h-5 w-5" />
              </div>
              <div>
                <a 
                  href={DATA.contact.social.GitHub.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-semibold hover:underline flex items-center gap-1.5"
                >
                  @{username}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                </a>
                <p className="text-xs text-muted-foreground">GitHub Activity</p>
              </div>
            </div>

            {/* Year Toggles */}
            <div className="flex items-center rounded-md border border-border/50 bg-background/30 p-1">
              {YEARS.map((year) => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={cn(
                    "rounded-sm px-3 py-1.5 text-xs font-medium transition-all duration-200",
                    selectedYear === year 
                      ? "bg-muted text-foreground shadow-sm" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {year === "last" ? "Past Year" : year}
                </button>
              ))}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-8">
            <div className="flex flex-col gap-2 rounded-lg border border-border/50 bg-background/30 p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <GitCommitHorizontal className="h-4 w-4" />
                <span className="text-xs font-medium">Contributions</span>
              </div>
              <span className="text-2xl font-bold">{totalContributions.toLocaleString()}</span>
            </div>

            <div className="flex flex-col gap-2 rounded-lg border border-border/50 bg-background/30 p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Flame className="h-4 w-4 text-orange-500" />
                <span className="text-xs font-medium">Current Streak</span>
              </div>
              <span className="text-2xl font-bold text-orange-500">{currentStreak} days</span>
            </div>

            <div className="flex flex-col gap-2 rounded-lg border border-border/50 bg-background/30 p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Zap className="h-4 w-4 text-green-500" />
                <span className="text-xs font-medium">Longest Streak</span>
              </div>
              <span className="text-2xl font-bold text-green-500">{longestStreak} days</span>
            </div>

            <div className="flex flex-col gap-2 rounded-lg border border-border/50 bg-background/30 p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <BookOpen className="h-4 w-4" />
                <span className="text-xs font-medium">Repositories</span>
              </div>
              <span className="text-2xl font-bold">{reposCount ?? "-"}</span>
            </div>
          </div>

          {/* Calendar */}
          <div className="overflow-x-auto pb-2 [&_article]:!w-full [&_article]:!max-w-none relative">
            <div className="flex justify-between items-center mb-4 text-xs text-muted-foreground">
              <span>{totalContributions.toLocaleString()} contributions in the {selectedYear === "last" ? "last year" : selectedYear}{peakDate ? ` • Peak: ${maxContributions} in a day (${formattedPeakDate})` : ""}</span>
              <span>Hover squares for details</span>
            </div>
            <div className="min-w-[750px]">
              <TooltipProvider delayDuration={50}>
                <GitHubCalendar
                  username={username}
                  year={selectedYear === "last" ? "last" : parseInt(selectedYear)}
                  colorScheme="dark"
                  transformData={selectData}
                  hideTotalCount
                  hideColorLegend={false}
                  renderBlock={(block, activity) => (
                    <Tooltip key={activity.date}>
                      <TooltipTrigger asChild>
                        {block}
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p>{activity.count} contributions on {activity.date}</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                  theme={{
                    dark: ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"],
                  }}
                />
              </TooltipProvider>
            </div>
          </div>
        </div>
      </BlurFade>
    </div>
  );
}

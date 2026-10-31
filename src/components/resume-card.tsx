"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowUpRight, Briefcase, GraduationCap } from "lucide-react";
import React from "react";

interface ResumeCardProps {
  className?: string;
  logoUrl?: string;
  altText: string;
  title: string;
  subtitle?: string;
  href?: string;
  badges?: readonly string[];
  period: string;
  description?: string;
  redacted?: boolean;
  type?: "work" | "education";
}

export const ResumeCard = ({
  className,
  logoUrl,
  altText,
  title,
  subtitle,
  href,
  badges,
  period,
  description,
  redacted,
  type = "work",
}: ResumeCardProps) => {
  const isRealLink = Boolean(href && href.trim() !== "" && href !== "#");
  const cleanPeriod = period && period.trim() !== "-" && period.trim() !== " - " ? period : null;

  const cardContent = (
    <Card
      className={cn(
        "group relative flex flex-col justify-between h-full p-4 rounded-xl border border-border/70 dark:border-white/[0.08] bg-card/60 dark:bg-zinc-950/50 backdrop-blur-md transition-all duration-200",
        isRealLink
          ? "hover:border-foreground/30 hover:bg-card/90 dark:hover:bg-zinc-900/70 hover:shadow-sm cursor-pointer"
          : "hover:border-border",
        className
      )}
    >
      <div className="flex items-start gap-3">
        {/* Organization / Degree Icon or Avatar */}
        <div className="flex-none">
          <Avatar
            className={cn(
              "size-10 rounded-lg border border-border/60 bg-muted/40 dark:bg-zinc-900 flex items-center justify-center transition-transform duration-200 group-hover:scale-105",
              redacted && "rounded-lg"
            )}
          >
            {logoUrl ? (
              <AvatarImage
                src={logoUrl}
                alt={altText}
                className={cn("object-contain", redacted && "scale-75")}
              />
            ) : null}
            <AvatarFallback className="rounded-lg bg-transparent text-foreground/70 font-semibold text-xs">
              {type === "work" ? (
                <Briefcase className="size-4 text-muted-foreground" />
              ) : (
                <GraduationCap className="size-4 text-muted-foreground" />
              )}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Header & Details */}
        <div className="flex flex-1 flex-col min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="text-sm font-semibold tracking-tight text-foreground truncate inline-flex items-center gap-1.5">
              <span className={cn(redacted && "blur-[3px] select-none")}>{title}</span>
              {isRealLink && (
                <ArrowUpRight className="size-3.5 opacity-50 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              )}
            </h3>
            {cleanPeriod && (
              <span className="text-[11px] font-mono text-muted-foreground tabular-nums shrink-0">
                {cleanPeriod}
              </span>
            )}
          </div>

          {subtitle && (
            <p className="text-xs text-muted-foreground mt-0.5 font-medium">
              {subtitle}
            </p>
          )}

          {badges && badges.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {badges.map((badge, index) => (
                <Badge
                  variant="secondary"
                  className="text-[10px] px-1.5 py-0 font-normal"
                  key={index}
                >
                  {badge}
                </Badge>
              ))}
            </div>
          )}

          {description && (
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>
    </Card>
  );

  if (isRealLink) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn("block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20 rounded-xl", className)}
      >
        {cardContent}
      </a>
    );
  }

  return <div className={cn("h-full", className)}>{cardContent}</div>;
};

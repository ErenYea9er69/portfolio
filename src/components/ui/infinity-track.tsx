import { cn } from "@/lib/utils";
import React from "react";

const INFINITY_TRACK_BLOCKS = ["█", "▓", "▒"] as const;

export interface InfinityTrackProps extends React.ComponentProps<"span"> {
  blocks?: readonly string[];
  track?: string;
  duration?: string;
  trackColor?: string;
  runnerColor?: string;
}

export function InfinityTrack({
  className,
  blocks = INFINITY_TRACK_BLOCKS,
  track = "░",
  duration = "2.8s",
  trackColor,
  runnerColor,
  ...props
}: InfinityTrackProps) {
  const glyphs = blocks;
  const gridCells = Array.from({ length: 45 }, (_, index) => {
    const row = Math.floor(index / 9);
    const col = index % 9;

    return row === 0 || row === 4 || col === 0 || col === 4 || col === 8
      ? track
      : " ";
  });

  return (
    <>
      <style>{`
        @keyframes loading-ui-infinity-track {
          0%,
          100% {
            transform: translate(4ch, 0);
          }

          12.5% {
            transform: translate(0, 0);
          }

          25% {
            transform: translate(0, 4ch);
          }

          37.5% {
            transform: translate(4ch, 4ch);
          }

          50% {
            transform: translate(4ch, 0);
          }

          62.5% {
            transform: translate(8ch, 0);
          }

          75% {
            transform: translate(8ch, 4ch);
          }

          87.5% {
            transform: translate(4ch, 4ch);
          }
        }
      `}</style>
      <span
        role="status"
        className={cn(
          "relative inline-flex h-[5ch] w-[9ch] overflow-hidden font-mono leading-none text-current select-none",
          className,
        )}
        style={
          {
            "--duration": duration,
          } as React.CSSProperties
        }
        {...props}
      >
        {/* Track layer */}
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0 grid grid-cols-9 grid-rows-5 text-muted-foreground/35 dark:text-zinc-600",
            trackColor,
          )}
        >
          {gridCells.map((glyph, index) => (
            <span
              key={index}
              className="flex h-[1ch] w-[1ch] items-center justify-center font-mono leading-none"
            >
              {glyph}
            </span>
          ))}
        </span>

        {/* Animated runner blocks */}
        {glyphs.map((glyph, index) => (
          <span
            key={`${glyph}-${index}`}
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute top-0 left-0 flex h-[1ch] w-[1ch] items-center justify-center font-mono leading-none text-foreground",
              runnerColor,
              ["z-30", "z-20", "z-10"][index],
            )}
            style={{
              animation:
                "loading-ui-infinity-track var(--duration, 2.8s) linear infinite",
              animationDelay: `calc(0.12s * ${index})`,
              backgroundColor: "var(--mask-color, hsl(var(--background)))",
            }}
          >
            {glyph}
          </span>
        ))}
        <span className="sr-only">Loading</span>
      </span>
    </>
  );
}

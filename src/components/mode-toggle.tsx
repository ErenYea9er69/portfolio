"use client";

import * as React from "react";
import { flushSync } from "react-dom";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { sound } from "@/lib/sound-fx";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Sun, Moon, Flame, Flower2, Zap } from "lucide-react";

export const THEME_CYCLE = [
  { id: "dark", name: "Modern Dark", icon: Moon, color: "#a1a1aa" },
  { id: "japanese", name: "Old Japanese (Katana)", icon: SwordIcon, color: "#d4af37" },
  { id: "minecraft", name: "Minecraft (Voxel)", icon: PickaxeIcon, color: "#4deeea" },
  { id: "cyberpunk", name: "100kV Cyberpunk", icon: Zap, color: "#ffe600" },
  { id: "e33", name: "Expedition 33", icon: Flower2, color: "#e8d08a" },
  { id: "ember", name: "Ember & Ash", icon: Flame, color: "#e0a45c" },
  { id: "light", name: "Daylight", icon: Sun, color: "#f59e0b" },
];

function SwordIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5" />
      <line x1="13" y1="19" x2="19" y2="13" />
      <line x1="16" y1="16" x2="20" y2="20" />
      <line x1="19" y1="21" x2="21" y2="19" />
    </svg>
  );
}

function PickaxeIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <path d="M14.5 4l-4 4 2.5 2.5L17 6.5c1.5-1.5 3.5-2.5 5-2.5-0 1.5-1 3.5-2.5 5l-4 4 2.5 2.5 4-4" />
      <path d="M3 21l8.5-8.5" />
    </svg>
  );
}

export function ModeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const ref = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const currentThemeId = theme || resolvedTheme || "dark";
  const currentIndex = THEME_CYCLE.findIndex((t) => t.id === currentThemeId);
  const safeIndex = currentIndex === -1 ? 0 : currentIndex;
  const currentTheme = THEME_CYCLE[safeIndex];

  const nextIndex = (safeIndex + 1) % THEME_CYCLE.length;
  const nextTheme = THEME_CYCLE[nextIndex];

  const cycleTheme = async () => {
    const targetTheme = nextTheme.id;

    sound.playThemeSwitch(targetTheme);

    // Synchronize HTML data-theme and dark class
    const updateDOM = () => {
      setTheme(targetTheme);
      document.documentElement.setAttribute("data-theme", targetTheme);
      if (targetTheme === "light") {
        document.documentElement.classList.remove("dark");
      } else {
        document.documentElement.classList.add("dark");
      }
    };

    if (
      !ref.current ||
      !document.startViewTransition ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      updateDOM();
      return;
    }

    const { top, left, width, height } = ref.current.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;
    const right = window.innerWidth - left;
    const bottom = window.innerHeight - top;
    const maxRadius = Math.hypot(Math.max(left, right), Math.max(top, bottom));

    await document.startViewTransition(() => {
      flushSync(() => {
        updateDOM();
      });
    }).ready;

    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${maxRadius}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration: 450,
        easing: "cubic-bezier(0.16, 1, 0.3, 1)",
        pseudoElement: "::view-transition-new(root)",
      }
    );
  };

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="size-9 rounded-lg" aria-label="Toggle theme">
        <Moon className="size-4" />
      </Button>
    );
  }

  const IconComponent = currentTheme.icon;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          ref={ref}
          variant="ghost"
          size="icon"
          className="relative size-9 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95"
          onClick={cycleTheme}
          aria-label={`Current theme: ${currentTheme.name}. Click to switch to ${nextTheme.name}`}
        >
          <IconComponent
            className="size-4.5 transition-transform duration-300"
            style={{ color: currentTheme.color }}
          />
          <span className="sr-only">Toggle theme (Next: {nextTheme.name})</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={8}>
        <div className="flex flex-col gap-0.5 text-center">
          <p className="text-xs font-semibold text-foreground">{currentTheme.name}</p>
          <p className="text-[10px] text-muted-foreground">Click to cycle: {nextTheme.name}</p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

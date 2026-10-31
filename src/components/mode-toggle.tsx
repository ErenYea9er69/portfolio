"use client";

import * as React from "react";
import { flushSync } from "react-dom";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { sound } from "@/lib/sound-fx";
import { Sun, Moon, Flower2, Zap, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const THEME_CYCLE = [
  { id: "dark", name: "Modern Dark", tag: "Minimalist obsidian", icon: Moon, color: "#a1a1aa" },
  { id: "japanese", name: "Old Japanese", tag: "Katana slash & ink", icon: SwordIcon, color: "#d4af37" },
  { id: "minecraft", name: "Minecraft", tag: "Voxel pickaxe & burst", icon: PickaxeIcon, color: "#4deeea" },
  { id: "cyberpunk", name: "100kV Cyberpunk", tag: "Industrial electric arc", icon: Zap, color: "#ffe600" },
  { id: "e33", name: "Expedition 33", tag: "Belle Époque rose petal", icon: Flower2, color: "#e8d08a" },
  { id: "light", name: "Daylight", tag: "Warm golden sun", icon: Sun, color: "#f59e0b" },
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
  const [isOpen, setIsOpen] = React.useState(false);

  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const closeTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const currentThemeId = theme || resolvedTheme || "dark";
  const currentIndex = THEME_CYCLE.findIndex((t) => t.id === currentThemeId);
  const safeIndex = currentIndex === -1 ? 0 : currentIndex;
  const currentTheme = THEME_CYCLE[safeIndex];

  const nextIndex = (safeIndex + 1) % THEME_CYCLE.length;
  const nextTheme = THEME_CYCLE[nextIndex];

  // Graceful hover open/close logic with 200ms debounce
  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  // Close when focus completely moves outside container
  const handleBlur = (e: React.FocusEvent) => {
    if (!containerRef.current?.contains(e.relatedTarget as Node)) {
      setIsOpen(false);
    }
  };

  // Keyboard navigation & outside click dismissal
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    const handlePointerDownOutside = (e: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("pointerdown", handlePointerDownOutside);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("pointerdown", handlePointerDownOutside);
    };
  }, [isOpen]);

  // Clean up timer on unmount
  React.useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  const applyTheme = async (targetTheme: string) => {
    if (targetTheme === currentThemeId) return;

    sound.playThemeSwitch(targetTheme);

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
      !buttonRef.current ||
      !document.startViewTransition ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      updateDOM();
      return;
    }

    const { top, left, width, height } = buttonRef.current.getBoundingClientRect();
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

  const cycleTheme = () => {
    applyTheme(nextTheme.id);
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
    <div
      ref={containerRef}
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={() => setIsOpen(true)}
      onBlur={handleBlur}
    >
      {/* Switcher Toggle Button */}
      <Button
        ref={buttonRef}
        variant="ghost"
        size="icon"
        className="relative size-9 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
        onClick={cycleTheme}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Current theme: ${currentTheme.name}. Click to switch to ${nextTheme.name}, or hover to view all themes`}
      >
        <IconComponent
          className="size-4.5 transition-transform duration-300"
          style={{ color: currentTheme.color }}
        />
        <span className="sr-only">Toggle theme (Next: {nextTheme.name})</span>
      </Button>

      {/* Hover Dropdown Theme List */}
      <div
        role="listbox"
        aria-label="Available themes"
        className={cn(
          "absolute right-0 top-full pt-2 z-[9990] min-w-[230px] transition-all duration-200 ease-out origin-top-right",
          isOpen
            ? "opacity-100 scale-100 pointer-events-auto translate-y-0"
            : "opacity-0 scale-95 pointer-events-none -translate-y-1"
        )}
      >
        <div className="rounded-xl border border-border/80 bg-background/95 p-1.5 shadow-2xl backdrop-blur-xl ring-1 ring-black/5 dark:ring-white/10">
          <div className="px-2.5 py-1.5 mb-1 border-b border-border/50 flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Themes
            </span>
            <span className="text-[10px] text-muted-foreground/80 font-mono">
              {safeIndex + 1}/{THEME_CYCLE.length}
            </span>
          </div>

          <div className="space-y-0.5">
            {THEME_CYCLE.map((t) => {
              const ItemIcon = t.icon;
              const isSelected = t.id === currentThemeId;

              return (
                <button
                  key={t.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    applyTheme(t.id);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left text-xs transition-colors group",
                    isSelected
                      ? "bg-accent text-accent-foreground font-semibold shadow-xs"
                      : "text-foreground/80 hover:bg-muted/70 hover:text-foreground"
                  )}
                >
                  <div
                    className={cn(
                      "size-6 rounded-md flex items-center justify-center shrink-0 border transition-transform duration-150 group-hover:scale-110",
                      isSelected
                        ? "border-foreground/30 bg-background/80"
                        : "border-border/60 bg-muted/40"
                    )}
                  >
                    <ItemIcon className="size-3.5" style={{ color: t.color }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="truncate">{t.name}</span>
                      {isSelected && (
                        <Check className="size-3.5 text-foreground shrink-0" />
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground font-normal truncate">
                      {t.tag}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-1.5 pt-1.5 border-t border-border/40 px-2 py-0.5 text-center">
            <span className="text-[10px] text-muted-foreground/75">
              Click icon to cycle · Click list to pick
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

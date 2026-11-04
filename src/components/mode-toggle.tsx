"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export function ModeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const isTransitioningRef = React.useRef(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = theme || resolvedTheme || "dark";
  const isDark = currentTheme === "dark";

  const toggleTheme = async () => {
    if (isTransitioningRef.current) return;

    const nextTheme = isDark ? "light" : "dark";

    // Immediate zero-overhead fallback for reduced motion or browsers without View Transitions
    if (
      !buttonRef.current ||
      !document.startViewTransition ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setTheme(nextTheme);
      return;
    }

    isTransitioningRef.current = true;
    document.documentElement.classList.add("theme-transitioning");

    try {
      const rect = buttonRef.current.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      const right = window.innerWidth - rect.left;
      const bottom = window.innerHeight - rect.top;
      const maxRadius = Math.hypot(Math.max(rect.left, right), Math.max(rect.top, bottom));

      const isMobile = window.innerWidth < 768;

      const transition = document.startViewTransition(() => {
        setTheme(nextTheme);
      });

      await transition.ready;

      if (isMobile) {
        // Ultra-fluid 200ms compositor crossfade on mobile (zero mask rasterization, locked 120fps)
        const anim = document.documentElement.animate(
          {
            opacity: [0, 1],
          },
          {
            duration: 200,
            easing: "cubic-bezier(0.22, 1, 0.36, 1)",
            pseudoElement: "::view-transition-new(root)",
          }
        );
        await anim.finished;
      } else {
        // Crisp, high-performance circular reveal on desktop (320ms snappy cubic-bezier)
        const anim = document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${maxRadius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration: 320,
            easing: "cubic-bezier(0.16, 1, 0.3, 1)",
            pseudoElement: "::view-transition-new(root)",
          }
        );
        await anim.finished;
      }
    } catch {
      // In case transition was aborted or interrupted
      setTheme(nextTheme);
    } finally {
      document.documentElement.classList.remove("theme-transitioning");
      isTransitioningRef.current = false;
    }
  };

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="size-9 rounded-lg"
        aria-label="Toggle theme"
      >
        <Moon className="size-4.5 text-muted-foreground" />
      </Button>
    );
  }

  return (
    <Button
      ref={buttonRef}
      variant="ghost"
      size="icon"
      className="relative size-9 rounded-lg transition-transform duration-200 hover:scale-105 active:scale-95"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
    >
      <Sun className="size-4.5 rotate-0 scale-100 transition-all duration-300 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] dark:-rotate-90 dark:scale-0 text-amber-500" />
      <Moon className="absolute size-4.5 rotate-90 scale-0 transition-all duration-300 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] dark:rotate-0 dark:scale-100 text-foreground" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

"use client";

import React, {
  useState,
  useEffect,
  createContext,
  useContext,
} from "react";
import { DATA } from "@/data/resume";
import { AnimatedCircularProgressBar } from "@/components/ui/animated-circular-progress-bar";
import { InfinityTrack } from "@/components/ui/infinity-track";

// ─── Initial Loader Context ───
interface InitialLoaderContextValue {
  isLoaded: boolean;
  isLoading: boolean;
}

const InitialLoaderContext = createContext<InitialLoaderContextValue>({
  isLoaded: true,
  isLoading: false,
});

export function useInitialLoader() {
  return useContext(InitialLoaderContext);
}

// ─── Critical resources to preload ───
const CRITICAL_IMAGES = [
  DATA.avatarUrl,
].filter(Boolean) as string[];

const MIN_DISPLAY_MS = 2900; // ~3 seconds on first visit / reload
const MAX_WAIT_MS = 6500;    // Sensible safety fallback to prevent infinite hanging
const RESOURCE_TIMEOUT_MS = 3000;

function preloadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !src) {
      resolve();
      return;
    }

    let settled = false;
    const finish = () => {
      if (!settled) {
        settled = true;
        resolve();
      }
    };

    // Timeout per image so broken or slow assets never block
    const timer = setTimeout(finish, RESOURCE_TIMEOUT_MS);

    const img = new Image();
    img.onload = () => {
      clearTimeout(timer);
      finish();
    };
    img.onerror = () => {
      clearTimeout(timer);
      finish();
    };
    img.src = src;

    // Fast-path: image already in memory or disk cache (warm cache / reload)
    if (img.complete) {
      clearTimeout(timer);
      finish();
    }
  });
}

function preloadFonts(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof document === "undefined" || !document.fonts?.ready) {
      resolve();
      return;
    }

    let settled = false;
    const finish = () => {
      if (!settled) {
        settled = true;
        resolve();
      }
    };

    const timer = setTimeout(finish, RESOURCE_TIMEOUT_MS);

    document.fonts.ready
      .then(() => {
        clearTimeout(timer);
        finish();
      })
      .catch(() => {
        clearTimeout(timer);
        finish();
      });
  });
}

export function InitialLoader({ children }: { children: React.ReactNode }) {
  // Always initialize synchronously to "loading" on both SSR and client to guarantee 0 hydration mismatch
  const [phase, setPhase] = useState<"loading" | "revealing" | "done">("loading");
  const [isLoaded, setIsLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stepLabel, setStepLabel] = useState("INITIALIZING CORE");

  useEffect(() => {
    let isMounted = true;
    let animFrame: number | null = null;
    let minTimer: ReturnType<typeof setTimeout> | null = null;
    let safetyTimer: ReturnType<typeof setTimeout> | null = null;
    let holdTimer: ReturnType<typeof setTimeout> | null = null;
    let revealTimer: ReturnType<typeof setTimeout> | null = null;

    let criticalReady = false;
    let minTimeElapsed = false;
    let isRevealing = false;

    // Lock body scroll while loader is visible
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const triggerReveal = () => {
      if (!isMounted || isRevealing) return;
      isRevealing = true;

      if (animFrame !== null) {
        cancelAnimationFrame(animFrame);
        animFrame = null;
      }

      setProgress(100);
      setStepLabel("SYSTEM READY");

      // Brief hold at 100% for visual completion
      holdTimer = setTimeout(() => {
        if (!isMounted) return;
        setPhase("revealing");
        setIsLoaded(true);
        document.body.style.overflow = originalOverflow;

        // Transition from revealing to done
        revealTimer = setTimeout(() => {
          if (!isMounted) return;
          setPhase("done");
        }, 700);
      }, 250);
    };

    const checkReadiness = () => {
      if (criticalReady && minTimeElapsed) {
        triggerReveal();
      }
    };

    // 1. Preload hero avatar & webfonts in parallel with individual resilience timeouts
    const imagePreloadPromise = Promise.all(CRITICAL_IMAGES.map(preloadImage));
    const fontPreloadPromise = preloadFonts();

    Promise.all([imagePreloadPromise, fontPreloadPromise]).then(() => {
      if (!isMounted) return;
      criticalReady = true;
      checkReadiness();
    });

    // 2. Smooth progress easing across MIN_DISPLAY_MS (0% -> 98%)
    const startTime = Date.now();

    const tick = () => {
      if (!isMounted || isRevealing) return;

      const elapsed = Date.now() - startTime;
      const t = Math.min(elapsed / MIN_DISPLAY_MS, 1);
      // Cubic ease-out
      const eased = 1 - Math.pow(1 - t, 3);
      const currentPct = Math.min(Math.round(eased * 98), 98);

      setProgress(currentPct);

      if (currentPct < 25) {
        setStepLabel("INITIALIZING CORE");
      } else if (currentPct < 60) {
        setStepLabel("PRELOADING ASSETS");
      } else if (currentPct < 90) {
        setStepLabel("COMPOSING DOM");
      } else {
        setStepLabel("PREPARING INTERFACE");
      }

      if (t < 1) {
        animFrame = requestAnimationFrame(tick);
      }
    };

    animFrame = requestAnimationFrame(tick);

    // 3. Minimum display timer
    minTimer = setTimeout(() => {
      if (!isMounted) return;
      minTimeElapsed = true;
      checkReadiness();
    }, MIN_DISPLAY_MS);

    // 4. Maximum safety fallback: unconditionally trigger reveal if anything hung
    safetyTimer = setTimeout(() => {
      if (!isMounted) return;
      criticalReady = true;
      minTimeElapsed = true;
      triggerReveal();
    }, MAX_WAIT_MS);

    return () => {
      isMounted = false;
      if (animFrame !== null) cancelAnimationFrame(animFrame);
      if (minTimer !== null) clearTimeout(minTimer);
      if (safetyTimer !== null) clearTimeout(safetyTimer);
      if (holdTimer !== null) clearTimeout(holdTimer);
      if (revealTimer !== null) clearTimeout(revealTimer);
      document.body.style.overflow = originalOverflow;
    };
  }, []); // Run ONCE on mount

  return (
    <InitialLoaderContext.Provider
      value={{
        isLoaded: phase === "done" || phase === "revealing",
        isLoading: phase === "loading",
      }}
    >
      {/* 
        Children are rendered directly in the natural DOM without any transform wrapper,
        preserving fixed positioning on Navbar, Dock, CommandPalette, and Toaster.
      */}
      {children}

      {/* Loading Screen Overlay Curtain */}
      {phase !== "done" && (
        <div
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-background select-none px-4"
          style={{
            opacity: phase === "revealing" ? 0 : 1,
            transform: phase === "revealing" ? "translateY(-14px)" : "translateY(0)",
            transition:
              "opacity 0.65s cubic-bezier(0.16, 1, 0.3, 1), transform 0.65s cubic-bezier(0.16, 1, 0.3, 1)",
            pointerEvents: phase === "revealing" ? "none" : "auto",
          }}
          aria-live="polite"
          aria-label="Loading portfolio"
          role="status"
        >
          {/* Subtle atmospheric vignette */}
          <div
            className="pointer-events-none absolute inset-0 opacity-40 dark:opacity-20"
            style={{
              background:
                "radial-gradient(circle at center, transparent 40%, hsl(var(--background)) 100%)",
            }}
          />

          <div className="relative z-10 flex flex-col items-center gap-6">
            {/* 
              ─── The Synthesis: Magic UI Circular Progress Bar + Loading UI Infinity Track ───
              The animated circular gauge smoothly tracks 0% -> 100% progress around the perimeter,
              while the monospace Unicode Infinity Track animates in the center.
            */}
            <AnimatedCircularProgressBar
              max={100}
              min={0}
              value={progress}
              gaugePrimaryColor="hsl(var(--foreground))"
              gaugeSecondaryColor="hsl(var(--muted) / 0.45)"
              className="size-48 sm:size-52"
            >
              <div className="flex flex-col items-center justify-center gap-1.5 pt-1">
                {/* Monospace Infinity Track glyph runner */}
                <InfinityTrack
                  className="text-xs sm:text-sm tracking-normal"
                  duration="2.4s"
                />

                {/* Numerical percentage readout */}
                <span className="font-mono text-base sm:text-lg font-bold tracking-tight text-foreground tabular-nums">
                  {progress}%
                </span>
              </div>
            </AnimatedCircularProgressBar>

            {/* Technical Status Telemetry */}
            <div className="flex flex-col items-center gap-1.5 text-center">
              <div className="flex items-center gap-2 font-mono text-[11px] sm:text-xs text-muted-foreground tracking-widest uppercase">
                <span
                  className={`inline-block size-1.5 rounded-full ${
                    progress === 100
                      ? "bg-emerald-500 animate-none"
                      : "bg-foreground/80 animate-pulse"
                  }`}
                />
                <span>{stepLabel}</span>
              </div>

              {/* Developer Monogram Subtitle */}
              <span className="font-mono text-[10px] tracking-wider text-muted-foreground/60 uppercase">
                {DATA.name} &bull; {DATA.initials}
              </span>
            </div>
          </div>
        </div>
      )}
    </InitialLoaderContext.Provider>
  );
}

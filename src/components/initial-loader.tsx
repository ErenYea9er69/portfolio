"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
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
];

const MIN_DISPLAY_MS = 2900; // ~3 seconds on first visit
const MAX_WAIT_MS = 7000;    // Safety fallback
const SESSION_KEY = "portfolio_session_initialized";

function preloadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve();
      return;
    }
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve(); // Non-blocking
    img.src = src;
  });
}

export function InitialLoader({ children }: { children: React.ReactNode }) {
  // Synchronous initial state check to prevent flash
  const [phase, setPhase] = useState<"loading" | "revealing" | "done">(() => {
    if (typeof window !== "undefined") {
      try {
        if (sessionStorage.getItem(SESSION_KEY) === "true") {
          return "done";
        }
      } catch {}
    }
    return "loading";
  });

  const [isLoaded, setIsLoaded] = useState(() => phase === "done");
  const [progress, setProgress] = useState(0);
  const [stepLabel, setStepLabel] = useState("INITIALIZING CORE");

  const criticalReady = useRef(false);
  const timerFired = useRef(false);
  const skippedRef = useRef(phase === "done");

  const tryReveal = useCallback(() => {
    if (skippedRef.current) return;
    if (criticalReady.current && timerFired.current) {
      setProgress(100);
      setStepLabel("SYSTEM READY");

      // Brief hold at 100% for visual completion
      setTimeout(() => {
        setPhase("revealing");
        setIsLoaded(true);
        try {
          sessionStorage.setItem(SESSION_KEY, "true");
        } catch {}
      }, 250);
    }
  }, []);

  // Mount effect: handle preloading, timing, and progress interpolation
  useEffect(() => {
    if (phase === "done") {
      setIsLoaded(true);
      return;
    }

    try {
      if (sessionStorage.getItem(SESSION_KEY) === "true") {
        skippedRef.current = true;
        setPhase("done");
        setIsLoaded(true);
        return;
      }
    } catch {}

    // Lock body scroll while loader is visible
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // 1. Preload hero avatar assets
    const imgPromises = Promise.all(CRITICAL_IMAGES.map(preloadImage));

    // 2. Preload webfonts
    const fontPromise =
      typeof document !== "undefined" && document.fonts?.ready
        ? document.fonts.ready
        : Promise.resolve();

    // Mark critical resources ready
    Promise.all([imgPromises, fontPromise]).then(() => {
      criticalReady.current = true;
      tryReveal();
    });

    // 4. Smooth progress easing across MIN_DISPLAY_MS
    const startTime = Date.now();
    let animFrame: number;

    const tick = () => {
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

    // Minimum display timer
    const minTimer = setTimeout(() => {
      timerFired.current = true;
      tryReveal();
    }, MIN_DISPLAY_MS);

    // Safety fallback timer to prevent infinite loading
    const safetyTimer = setTimeout(() => {
      criticalReady.current = true;
      timerFired.current = true;
      tryReveal();
    }, MAX_WAIT_MS);

    return () => {
      cancelAnimationFrame(animFrame);
      clearTimeout(minTimer);
      clearTimeout(safetyTimer);
      document.body.style.overflow = originalOverflow;
    };
  }, [phase, tryReveal]);

  // Transition from revealing to done
  useEffect(() => {
    if (phase !== "revealing") return;
    document.body.style.overflow = "";

    const timer = setTimeout(() => {
      setPhase("done");
    }, 700);

    return () => clearTimeout(timer);
  }, [phase]);

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

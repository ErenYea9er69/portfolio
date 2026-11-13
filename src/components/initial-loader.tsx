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
  "/github-avatar.png",
];

const PROJECT_IMAGES = DATA.projects
  .map((p) => p.image)
  .filter((img) => img.length > 0) as string[];

const MIN_DISPLAY_MS = 2800; // ~3s professional duration on first visit
const MAX_WAIT_MS = 6000;    // Sensible safety fallback to prevent infinite hanging
const SESSION_KEY = "portfolio_session_initialized";

function preloadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve();
      return;
    }
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve(); // Non-blocking on network failure
    img.src = src;
  });
}

export function InitialLoader({ children }: { children: React.ReactNode }) {
  // Always initialize synchronously to determine state
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

      // Brief hold at 100% before smooth reveal
      setTimeout(() => {
        setPhase("revealing");
        setIsLoaded(true);
        try {
          sessionStorage.setItem(SESSION_KEY, "true");
        } catch {}
      }, 220);
    }
  }, []);

  // 1. Initial mount & preloading flow
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

    // Preload critical assets
    const imgPromises = Promise.all(CRITICAL_IMAGES.map(preloadImage));
    const fontPromise =
      typeof document !== "undefined" && document.fonts?.ready
        ? document.fonts.ready
        : Promise.resolve();

    // Secondary asset preloading in background
    PROJECT_IMAGES.forEach((src) => {
      const img = new Image();
      img.src = src;
    });

    // Mark critical ready when hero images and webfonts resolve
    Promise.all([imgPromises, fontPromise]).then(() => {
      criticalReady.current = true;
      tryReveal();
    });

    // Natural progress tick (0% -> 98% smoothly over MIN_DISPLAY_MS)
    const startTime = Date.now();
    let animFrame: number;

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const t = Math.min(elapsed / MIN_DISPLAY_MS, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      const currentPct = Math.min(Math.round(eased * 98), 98);
      setProgress(currentPct);

      if (currentPct < 30) {
        setStepLabel("INITIALIZING CORE");
      } else if (currentPct < 65) {
        setStepLabel("PRELOADING ASSETS");
      } else {
        setStepLabel("HYDRATING INTERFACE");
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

  // Handle transition from revealing to completely done
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
        Children are rendered directly in the natural DOM tree without any transform wrapper.
        This preserves all position:fixed elements (Navbar, CommandPalette, Toaster) perfectly.
      */}
      {children}

      {/* Loading Overlay Curtain */}
      {phase !== "done" && (
        <div
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-background select-none"
          style={{
            opacity: phase === "revealing" ? 0 : 1,
            transform: phase === "revealing" ? "translateY(-12px)" : "translateY(0)",
            transition:
              "opacity 0.65s cubic-bezier(0.16, 1, 0.3, 1), transform 0.65s cubic-bezier(0.16, 1, 0.3, 1)",
            pointerEvents: phase === "revealing" ? "none" : "auto",
          }}
          aria-live="polite"
          aria-label="Loading portfolio"
          role="status"
        >
          {/* Subtle ambient background glow */}
          <div
            className="absolute pointer-events-none rounded-full blur-[90px] opacity-25 dark:opacity-35"
            style={{
              width: 280,
              height: 280,
              background:
                "radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)",
            }}
          />

          <div className="relative z-10 flex flex-col items-center gap-7 px-4">
            {/* Precision Monogram with SVG Circular Progress Ring */}
            <div className="relative flex items-center justify-center">
              <svg
                className="size-24 sm:size-28 -rotate-90 transform"
                viewBox="0 0 100 100"
              >
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-muted/40 dark:stroke-white/[0.08]"
                  strokeWidth="2.5"
                  fill="none"
                />
                {/* Active Progress Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-foreground transition-[stroke-dashoffset] duration-150 ease-out"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                  strokeDasharray={263.89}
                  strokeDashoffset={263.89 - (progress / 100) * 263.89}
                />
              </svg>

              {/* Centered Monogram */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-mono text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  {DATA.initials}
                </span>
              </div>
            </div>

            {/* Progress Telemetry */}
            <div className="flex flex-col items-center gap-2.5 text-center">
              {/* Minimalist Progress Track */}
              <div className="h-[2px] w-36 sm:w-44 overflow-hidden rounded-full bg-muted/60 dark:bg-white/[0.08]">
                <div
                  className="h-full rounded-full bg-foreground transition-[width] duration-150 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Status and Percentage Readout */}
              <div className="flex items-center gap-3 font-mono text-[11px] sm:text-xs text-muted-foreground tracking-wider uppercase">
                <span className="flex items-center gap-1.5">
                  <span
                    className={`inline-block size-1.5 rounded-full ${
                      progress === 100
                        ? "bg-emerald-500 animate-none"
                        : "bg-foreground/80 animate-pulse"
                    }`}
                  />
                  <span>{stepLabel}</span>
                </span>
                <span className="text-foreground/90 font-semibold tabular-nums">
                  {String(progress).padStart(3, "0")}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </InitialLoaderContext.Provider>
  );
}

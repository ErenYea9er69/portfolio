"use client";

import { useEffect, useState } from "react";
import { DecryptedText } from "@/components/decrypted-text";

const BIRTH_DATE = new Date("2004-09-16T16:00:00").getTime();
const MS_PER_YEAR = 1000 * 60 * 60 * 24 * 365.2425;

const calculateYears = () => {
  const now = Date.now();
  const ageInYears = (now - BIRTH_DATE) / MS_PER_YEAR;
  return ageInYears.toFixed(2);
};

export function AgeCounter() {
  const [years, setYears] = useState<string | null>(null);

  useEffect(() => {
    // Immediate calculation on client
    setYears(calculateYears());

    let intervalId: NodeJS.Timeout | null = null;

    const startTicker = () => {
      if (intervalId) clearInterval(intervalId);
      intervalId = setInterval(() => {
        if (!document.hidden) {
          setYears(calculateYears());
        }
      }, 1000);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      } else {
        setYears(calculateYears());
        startTicker();
      }
    };

    startTicker();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (intervalId) clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Placeholder with identical layout dimensions to prevent layout shifts
  if (years === null) {
    return (
      <div className="text-xs sm:text-sm font-medium text-muted-foreground min-h-[20px] flex items-center">
        <span className="tabular-nums opacity-0">21.00 years old</span>
      </div>
    );
  }

  return (
    <div className="text-xs sm:text-sm font-medium text-muted-foreground min-h-[20px] flex items-center gap-1.5 select-none">
      <span className="inline-block size-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-pulse" />
      <span className="tabular-nums text-foreground font-semibold">
        {years}
      </span>
      <span>
        <DecryptedText
          text="years old"
          animateOn="hover"
          speed={25}
          maxIterations={6}
          className="text-muted-foreground"
        />
      </span>
    </div>
  );
}

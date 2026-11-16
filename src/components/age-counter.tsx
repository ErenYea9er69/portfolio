"use client";

import { useEffect, useState } from "react";
import { calculateAgeYears } from "@/lib/birthday";

export function AgeCounter() {
  const [years, setYears] = useState<string | null>(null);

  useEffect(() => {
    setYears(calculateAgeYears());

    let intervalId: NodeJS.Timeout | null = null;

    const startTicker = () => {
      if (intervalId) clearInterval(intervalId);
      intervalId = setInterval(() => {
        if (!document.hidden) {
          setYears(calculateAgeYears());
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
        setYears(calculateAgeYears());
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

  if (years === null) {
    return (
      <div className="text-xs sm:text-sm font-medium text-muted-foreground min-h-[20px] flex items-center">
        <span className="tabular-nums opacity-0">21.00 years old</span>
      </div>
    );
  }

  return (
    <div className="text-xs sm:text-sm font-medium text-muted-foreground min-h-[20px] flex items-center gap-1.5 select-none">
      <span className="tabular-nums text-foreground font-semibold">
        {years}
      </span>
      <span>years old</span>
    </div>
  );
}

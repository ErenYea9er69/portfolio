"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { MeteorsBackground } from "./meteors-background";
import { useInitialLoader } from "@/components/initial-loader";

export function PageBackground() {
  const pathname = usePathname();
  const { isLoaded } = useInitialLoader();
  const [mounted, setMounted] = useState(false);
  const isBlogPage = pathname?.includes("/blog");

  useEffect(() => {
    if (!isLoaded) return;
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, [isLoaded]);

  if (isBlogPage || !mounted) {
    return null;
  }

  return <MeteorsBackground />;
}

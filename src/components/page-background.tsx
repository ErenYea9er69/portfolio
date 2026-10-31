"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { AmbientFx } from "./ambient-fx";

export function PageBackground() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const isBlogPage = pathname?.includes("/blog");

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  if (isBlogPage || !mounted) {
    return null;
  }

  return <AmbientFx />;
}

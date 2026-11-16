"use client";

import { usePathname } from "next/navigation";
import { MeteorsBackground } from "./meteors-background";
import { useInitialLoader } from "@/components/initial-loader";

export function PageBackground() {
  const pathname = usePathname();
  const { isLoaded } = useInitialLoader();

  if (pathname === "/cli" || !isLoaded) {
    return null;
  }

  return <MeteorsBackground />;
}

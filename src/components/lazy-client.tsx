"use client";

// Next 15 disallows `ssr: false` with next/dynamic inside Server Components;
// these client-side wrappers keep the browser-only rendering behavior for the
// homepage (visitor counter and GitHub contributions calendar).
import dynamic from "next/dynamic";

export const VisitorCounter = dynamic(
  () => import("@/components/visitor-counter"),
  { ssr: false }
);



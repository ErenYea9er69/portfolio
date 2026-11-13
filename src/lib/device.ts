"use client";

import { useSyncExternalStore } from "react";
import { toast } from "@/components/ui/toast";

const mobileQuery =
  typeof window !== "undefined" ? window.matchMedia("(max-width: 767px)") : null;

function subscribe(callback: () => void) {
  if (!mobileQuery) return () => {};
  mobileQuery.addEventListener("change", callback);
  return () => mobileQuery.removeEventListener("change", callback);
}

function getSnapshot() {
  return mobileQuery ? mobileQuery.matches : false;
}

function getServerSnapshot() {
  return false;
}

/**
 * Shared zero-overhead mobile detection hook powered by useSyncExternalStore.
 * Avoids cascading useState/useEffect re-renders across dozens of components.
 */
export function useIsMobile(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Detects whether the current client is a mobile phone device.
 */
export function isMobilePhone(): boolean {
  if (typeof window === "undefined") return false;

  const mobileUA = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

  const isSmallScreen = window.innerWidth < 768;

  return mobileUA || isSmallScreen;
}

/**
 * Guard for CLI mode links. Blocks navigation on mobile phones and shows an error toast.
 * Returns true if allowed, false if blocked.
 */
export function guardCliAccess(e?: React.MouseEvent): boolean {
  if (isMobilePhone()) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    toast.create({
      type: "error",
      title: "Desktop Only",
      description: "CLI Terminal Mode is only available on PC / desktop.",
    });
    return false;
  }
  return true;
}


"use client";

import { toast } from "@/components/ui/toast";

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


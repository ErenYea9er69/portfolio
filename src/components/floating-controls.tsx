"use client";

import { ModeToggle } from "@/components/mode-toggle";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Terminal } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

/**
 * Minimal floating controls — theme toggle + CLI link.
 * Replaces the full navbar; section navigation is handled
 * by the ScrollRail component.
 */
export function FloatingControls() {
  const pathname = usePathname();

  // Hide on CLI page (it has its own chrome)
  if (pathname === "/cli") return null;

  return (
    <div className="fixed top-4 right-4 sm:top-5 sm:right-6 z-50 flex items-center gap-1 rounded-full border border-border/40 bg-background/70 backdrop-blur-xl px-1 py-1 shadow-sm">
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href="/cli"
            className="rounded-full p-2 text-muted-foreground transition-colors duration-200 hover:text-foreground hover:bg-muted/60"
            aria-label="CLI Mode"
          >
            <Terminal className="size-4" />
          </Link>
        </TooltipTrigger>
        <TooltipContent side="bottom" sideOffset={8}>
          <p className="text-xs font-medium">CLI Terminal Mode</p>
        </TooltipContent>
      </Tooltip>

      <ModeToggle />
    </div>
  );
}

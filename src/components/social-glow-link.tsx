"use client";

import { ReactNode } from "react";

interface SocialGlowLinkProps {
  href: string;
  name: string;
  brandColor?: string;
  children: ReactNode;
}

export function SocialGlowLink({ href, name, brandColor, children }: SocialGlowLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center size-9 rounded-full border border-border/60 bg-muted/20 hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-all duration-200 hover:-translate-y-0.5 hover:border-border shadow-xs"
      aria-label={name}
    >
      {children}
    </a>
  );
}

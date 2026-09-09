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
      className="social-icon-glow rounded-full border border-border/60 bg-card/40 p-2.5 text-muted-foreground"
      aria-label={name}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        const color = brandColor || 'hsl(var(--foreground))';
        el.style.color = color;
        el.style.borderColor = color;
        el.style.boxShadow = `0 0 12px ${brandColor || 'transparent'}40, 0 4px 16px ${brandColor || 'transparent'}20`;
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        el.style.color = '';
        el.style.borderColor = '';
        el.style.boxShadow = '';
      }}
    >
      {children}
    </a>
  );
}

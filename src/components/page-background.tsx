"use client";

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { MeteorsBackground } from './meteors-background';

export function PageBackground() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const isBlogPage = pathname?.includes('/blog');

  useEffect(() => {
    // Mount background after initial paint so main thread is 100% free for FCP/LCP
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  if (isBlogPage || !mounted) {
    return null;
  }

  return <MeteorsBackground />;
}
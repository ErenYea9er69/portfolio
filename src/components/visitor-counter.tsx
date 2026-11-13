'use client';
import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Eye } from 'lucide-react';

// Helper to get ordinal suffix (1st, 2nd, 3rd, etc.)
function getOrdinalSuffix(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

const SESSION_COUNT_KEY = 'site_visitor_count_cache';

export default function VisitorCounter() {
  const [count, setCount] = useState<number | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = sessionStorage.getItem(SESSION_COUNT_KEY);
        if (cached) {
          const parsed = Number(cached);
          if (!isNaN(parsed) && parsed > 0) return parsed;
        }
      } catch {}
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(() => count === null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fetchedRef = useRef(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const fetchVisitorCount = async () => {
      if (fetchedRef.current) return;
      fetchedRef.current = true;

      try {
        const response = await fetch('/api/visitor-count', {
          method: 'GET',
          credentials: 'include',
          signal: controller.signal,
        });

        if (response.ok) {
          const data = await response.json();
          if (typeof data.count === 'number') {
            setCount(data.count);
            try {
              sessionStorage.setItem(SESSION_COUNT_KEY, String(data.count));
            } catch {}
          }
        }
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error('Error fetching visitor count:', error);
        }
      } finally {
        setIsLoading(false);
        clearTimeout(timeoutId);
      }
    };

    if (!('IntersectionObserver' in window)) {
      fetchVisitorCount();
      return () => {
        clearTimeout(timeoutId);
        controller.abort();
      };
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          fetchVisitorCount();
          observer.disconnect();
        }
      },
      { rootMargin: '300px' }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  // Show placeholder until mounted or loaded
  if (isLoading || count === null || count <= 0) {
    return (
      <div ref={containerRef} className="text-sm text-muted-foreground flex items-center gap-2">
        <Eye className="size-4" />
        <span className="opacity-50">{isLoading ? "Loading..." : "Visitors"}</span>
      </div>
    );
  }

  return (
    <div ref={containerRef}>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-sm text-muted-foreground flex items-center gap-2"
        title="You are a unique visitor!"
      >
        <Eye className="size-4" />
        <span>
          You are the{' '}
          <motion.span
            key={count}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-semibold text-foreground tabular-nums"
            suppressHydrationWarning
          >
            {count.toLocaleString()}
            <sup className="text-xs">{getOrdinalSuffix(count)}</sup>
          </motion.span>
          {' '}visitor
        </span>
      </motion.div>
    </div>
  );
}

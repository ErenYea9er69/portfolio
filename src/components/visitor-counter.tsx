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
const BASELINE_COUNT = 290;

export default function VisitorCounter() {
  const [count, setCount] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = sessionStorage.getItem(SESSION_COUNT_KEY) || localStorage.getItem(SESSION_COUNT_KEY);
        if (cached) {
          const parsed = Number(cached);
          if (!isNaN(parsed) && parsed > 0) return Math.max(parsed, BASELINE_COUNT);
        }
      } catch {}
    }
    return BASELINE_COUNT;
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const fetchedRef = useRef(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Accommodate Neon serverless cold start latency (up to 10s)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

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
          if (typeof data.count === 'number' && data.count > 0) {
            const resolvedCount = Math.max(data.count, BASELINE_COUNT);
            setCount(resolvedCount);
            try {
              sessionStorage.setItem(SESSION_COUNT_KEY, String(resolvedCount));
              localStorage.setItem(SESSION_COUNT_KEY, String(resolvedCount));
            } catch {}
          }
        }
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error('Error fetching visitor count:', error);
        }
      } finally {
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

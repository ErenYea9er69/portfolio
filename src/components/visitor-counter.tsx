'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Eye } from 'lucide-react';
import {
  BASELINE_VISITORS,
  getCachedVisitorCount,
  trackVisitor,
  subscribeVisitorCount,
} from '@/lib/visitor-tracker';

// Helper to get ordinal suffix (1st, 2nd, 3rd, etc.)
function getOrdinalSuffix(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

export default function VisitorCounter() {
  const [count, setCount] = useState<number>(() => getCachedVisitorCount());

  useEffect(() => {
    // 1. Subscribe to any count changes
    const unsubscribe = subscribeVisitorCount((newCount) => {
      if (newCount >= BASELINE_VISITORS) {
        setCount(newCount);
      }
    });

    // 2. Trigger tracking immediately on mount
    trackVisitor().then((data) => {
      if (typeof data.count === 'number' && data.count >= BASELINE_VISITORS) {
        setCount(data.count);
      }
    });

    // 3. Re-verify when tab becomes visible
    const handleVisibilityChange = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        trackVisitor(true).then((data) => {
          if (typeof data.count === 'number' && data.count >= BASELINE_VISITORS) {
            setCount(data.count);
          }
        });
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    return () => {
      unsubscribe();
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, []);

  return (
    <div>
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

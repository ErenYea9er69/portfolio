'use client';

import { useSyncExternalStore } from 'react';
import { motion } from 'framer-motion';
import { Eye } from 'lucide-react';
import {
  BASELINE_VISITORS,
  getCachedVisitorCount,
  subscribeVisitorCount,
} from '@/lib/visitor-tracker';

function getOrdinalSuffix(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

export default function VisitorCounter() {
  const count = useSyncExternalStore(
    subscribeVisitorCount,
    getCachedVisitorCount,
    () => BASELINE_VISITORS
  );

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

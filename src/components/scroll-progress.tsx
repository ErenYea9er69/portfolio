// src/components/scroll-progress.tsx
"use client";

import { motion, useScroll, useSpring } from "framer-motion";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 280,
    damping: 40,
    restDelta: 0.001
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[2px] bg-foreground/70 origin-left z-[60]"
      style={{ scaleX }}
    >
      {/* Leading glow dot */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 size-1.5 rounded-full bg-foreground shadow-[0_0_8px_hsl(var(--foreground)/0.5)]" />
    </motion.div>
  );
}
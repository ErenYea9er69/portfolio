"use client";

import { AnimatePresence, motion, useInView, Variants } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface BlurFadeProps {
  children: React.ReactNode;
  className?: string;
  variant?: {
    hidden: { y: number };
    visible: { y: number };
  };
  duration?: number;
  delay?: number;
  yOffset?: number;
  inView?: boolean;
  inViewMargin?: string;
  blur?: string;
  priority?: boolean;
}
const BlurFade = ({
  children,
  className,
  variant,
  duration = 0.4,
  delay = 0,
  yOffset = 6,
  inView = false,
  inViewMargin = "-50px",
  blur = "6px",
  priority = false,
}: BlurFadeProps) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const inViewResult = useInView(ref, { once: true, margin: inViewMargin as any });
  const isInView = !inView || inViewResult;

  // SSR-safe mobile detection
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  // Priority items render instantly on both mobile and desktop
  if (priority) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  // Mobile: plain div with CSS opacity transition (no framer-motion overhead)
  if (isMobile) {
    return (
      <div
        ref={ref}
        className={className}
        style={{
          opacity: isInView ? 1 : 0,
          transition: "opacity 0.3s ease-out",
        }}
      >
        {children}
      </div>
    );
  }

  // Desktop: full framer-motion animation
  const defaultVariants: Variants = {
    hidden: { y: yOffset, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };
  const combinedVariants = variant || defaultVariants;
  return (
    <AnimatePresence>
      <motion.div
        ref={ref}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        exit="hidden"
        variants={combinedVariants}
        transition={{
          delay: 0.04 + delay,
          duration,
          ease: "easeOut",
        }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default BlurFade;

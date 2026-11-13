"use client";

import { motion, useInView, Variants } from "framer-motion";
import { useRef } from "react";
import { useIsMobile } from "@/lib/device";

interface BlurFadeProps {
  children: React.ReactNode;
  className?: string;
  variant?: {
    hidden: { y: number; opacity?: number };
    visible: { y: number; opacity?: number };
  };
  duration?: number;
  delay?: number;
  yOffset?: number;
  inView?: boolean;
  inViewMargin?: string;
  blur?: string;
  priority?: boolean;
}

export const BlurFade = (props: BlurFadeProps) => {
  // Priority items render immediately on both platforms with 0 motion/hooks overhead
  if (props.priority) {
    return <div className={props.className}>{props.children}</div>;
  }
  return <ClientBlurFade {...props} />;
};

function ClientBlurFade(props: BlurFadeProps) {
  const isMobile = useIsMobile();

  // Mobile: Pure GPU-accelerated CSS keyframe animation, 0 Framer Motion JS solver/RAF
  if (isMobile) {
    const { children, className, duration = 0.4, delay = 0, yOffset = 6 } = props;
    return (
      <div
        className={className}
        style={{
          opacity: 1,
          transform: "translateY(0)",
          animation: `blurFadeIn ${duration}s ease-out ${delay}s both`,
        }}
      >
        {children}
      </div>
    );
  }

  return <DesktopBlurFade {...props} />;
}

function DesktopBlurFade({
  children,
  className,
  variant,
  duration = 0.4,
  delay = 0,
  yOffset = 6,
  inView = false,
  inViewMargin = "-50px",
}: BlurFadeProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const inViewResult = useInView(ref, { once: true, margin: inViewMargin as any });
  const isInView = !inView || inViewResult;

  const defaultVariants: Variants = {
    hidden: { y: yOffset, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };
  const combinedVariants = variant || defaultVariants;

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
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
  );
}

export default BlurFade;

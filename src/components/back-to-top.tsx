"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { ArrowUp } from "lucide-react";

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const { scrollYProgress } = useScroll();

  // Create a circular progress indicator
  const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1]);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.2 }}
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 p-2 rounded-full 
            bg-foreground/90 text-background 
            shadow-lg hover:shadow-xl
            hover:scale-110 active:scale-95
            transition-all duration-200
            backdrop-blur-sm
            group
            max-md:bottom-24 max-md:right-4"
          aria-label="Back to top"
        >
          {/* Scroll progress ring */}
          <svg
            className="absolute inset-0 -rotate-90"
            viewBox="0 0 40 40"
            fill="none"
          >
            <circle
              cx="20"
              cy="20"
              r="18"
              strokeWidth="2"
              stroke="currentColor"
              className="text-background/20"
            />
            <motion.circle
              cx="20"
              cy="20"
              r="18"
              strokeWidth="2"
              stroke="currentColor"
              className="text-background/60"
              strokeLinecap="round"
              style={{ pathLength }}
            />
          </svg>
          <ArrowUp className="size-4 group-hover:-translate-y-0.5 transition-transform relative z-10" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

"use client";

import { ModeToggle } from "@/components/mode-toggle";
import { DATA } from "@/data/resume";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Menu, X, Terminal, Home, Code2, Briefcase, GraduationCap, Mail, FolderKanban } from "lucide-react";
import { Dock, DockIcon } from "@/components/magicui/dock";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { buttonVariants } from "@/components/ui/button";

const DESKTOP_NAV_LINKS = [
  { href: "/projects", label: "Projects" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [activeRect, setActiveRect] = useState<{ left: number; width: number } | null>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  useEffect(() => {
    setIsMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile, { passive: true });
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isScrolled) return;
    const raf = requestAnimationFrame(() => {
      const activeIndex = DESKTOP_NAV_LINKS.findIndex((item) => item.href === pathname);
      if (activeIndex !== -1 && itemRefs.current[activeIndex] && navRef.current) {
        const itemEl = itemRefs.current[activeIndex]!;
        const navEl = navRef.current;
        const itemRect = itemEl.getBoundingClientRect();
        const navRect = navEl.getBoundingClientRect();
        setActiveRect({
          left: itemRect.left - navRect.left,
          width: itemRect.width,
        });
      } else {
        setActiveRect(null);
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [pathname, isMounted, isScrolled]);

  if (pathname === "/cli") {
    return null;
  }

  return (
    <>
      {/* ─── Expanded navbar (top of page / always on mobile) ─── */}
      <AnimatePresence>
        {(!isScrolled || isMobile) && (
          <motion.nav
            initial={isMounted ? { y: 0, opacity: 1 } : { y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed top-0 left-0 right-0 z-50"
          >
            {/* Generous width container so navbar is well-proportioned and never looks cramped or small */}
            <div className="mx-auto max-w-4xl px-4 sm:px-6">
              <div className={cn(
                "mt-3 flex items-center justify-between rounded-2xl py-2 px-4 backdrop-blur-xl border border-border/30 transition-all duration-300 w-full shadow-xs",
                isScrolled
                  ? "bg-background/90 dark:bg-zinc-950/90 shadow-md border-border/50"
                  : "bg-background/60 shadow-xs"
              )}>
                {/* Brand / Home on Left */}
                <Link
                  href="/"
                  className="flex items-center justify-center rounded-xl p-2 text-muted-foreground transition-all duration-200 hover:text-foreground hover:bg-muted/60"
                  aria-label="Home"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Home className="size-4.5" />
                </Link>

                {/* Desktop nav links - spacious and prominent */}
                <div className="hidden md:flex items-center gap-1">
                  <div
                    ref={navRef}
                    className="relative flex items-center gap-0.5 rounded-xl bg-muted/40 p-1 border border-border/30"
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    {activeRect && (
                      <motion.div
                        layoutId="nav-active"
                        className="absolute top-1 bottom-1 rounded-[9px] bg-background shadow-xs border border-border/20"
                        style={{ left: activeRect.left, width: activeRect.width }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}

                    {DESKTOP_NAV_LINKS.map((item, index) => {
                      const isActive = pathname === item.href;
                      const isHovered = hoveredIndex === index;
                      return (
                        <Link
                          key={item.href}
                          ref={(el) => { itemRefs.current[index] = el; }}
                          href={item.href}
                          onMouseEnter={() => setHoveredIndex(index)}
                          className={cn(
                            "relative z-10 rounded-[9px] px-3.5 py-1.5 text-[13px] font-medium transition-colors duration-200",
                            isActive
                              ? "text-foreground font-semibold"
                              : isHovered
                                ? "text-foreground"
                                : "text-muted-foreground"
                          )}
                        >
                          {isHovered && !isActive && (
                            <motion.span
                              layoutId="nav-hover"
                              className="absolute inset-0 rounded-[9px] bg-muted/60"
                              style={{ zIndex: -1 }}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.15 }}
                            />
                          )}
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>

                  <div className="mx-2 h-4 w-px bg-border/60" />

                  {/* Actions on right: CLI & Theme Toggle (Sound toggle deleted as requested) */}
                  <div className="flex items-center gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          href="/cli"
                          className="rounded-lg p-2 text-muted-foreground transition-all duration-200 hover:text-foreground hover:bg-muted/60"
                          aria-label="CLI Mode"
                        >
                          <Terminal className="size-4.5" />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" sideOffset={8}>
                        <p className="text-xs font-medium">CLI Terminal Mode</p>
                      </TooltipContent>
                    </Tooltip>

                    <ModeToggle />
                  </div>
                </div>

                {/* Mobile controls */}
                <div className="flex md:hidden items-center gap-1.5">
                  <ModeToggle />
                  <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/60"
                    aria-label="Toggle menu"
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      {isMobileMenuOpen ? (
                        <motion.span
                          key="close"
                          initial={{ rotate: -90, opacity: 0 }}
                          animate={{ rotate: 0, opacity: 1 }}
                          exit={{ rotate: 90, opacity: 0 }}
                          transition={{ duration: 0.15 }}
                        >
                          <X className="size-5" />
                        </motion.span>
                      ) : (
                        <motion.span
                          key="menu"
                          initial={{ rotate: 90, opacity: 0 }}
                          animate={{ rotate: 0, opacity: 1 }}
                          exit={{ rotate: -90, opacity: 0 }}
                          transition={{ duration: 0.15 }}
                        >
                          <Menu className="size-5" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile menu dropdown */}
            <AnimatePresence>
              {isMobileMenuOpen && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="relative z-50 mx-4 mt-2 overflow-hidden rounded-2xl border border-border/40 bg-background/95 shadow-lg backdrop-blur-xl md:hidden"
                  >
                    <div className="p-2 space-y-0.5">
                      <Link
                        href="/"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                          pathname === "/"
                            ? "bg-muted/60 text-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                        )}
                      >
                        <Home className="size-4" />
                        Home
                      </Link>

                      <Link
                        href="/projects"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                          pathname === "/projects"
                            ? "bg-muted/60 text-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                        )}
                      >
                        <FolderKanban className="size-4" />
                        Projects
                      </Link>

                      <div className="my-1 h-px bg-border/40" />

                      <Link
                        href="/cli"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/40"
                      >
                        <Terminal className="size-4" />
                        CLI Mode
                      </Link>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* ─── Dock navbar (on scroll, desktop only) ─── */}
      <AnimatePresence>
        {isScrolled && !isMobile && (
          <motion.div
            initial={{ y: 60, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 60, opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="hidden md:flex fixed bottom-5 left-0 right-0 z-50 justify-center px-4"
          >
            <Dock
              magnification={50}
              distance={120}
              className="border border-white/20 bg-background/30 dark:border-white/10 dark:bg-background/20 backdrop-saturate-150 shadow-lg px-3"
            >
              {DATA.navbar.map((item) => (
                <DockIcon key={item.href}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href}
                        className={cn(
                          buttonVariants({ variant: "ghost", size: "icon" }),
                          "size-10 rounded-full",
                          pathname === item.href && "bg-muted/80 text-foreground"
                        )}
                        aria-label={item.label}
                      >
                        <item.icon className="size-[18px]" />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent sideOffset={10}>
                      <p>{item.label}</p>
                    </TooltipContent>
                  </Tooltip>
                </DockIcon>
              ))}

              <div className="mx-0.5 h-8 w-px shrink-0 bg-border/40" />

              <DockIcon>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href="/cli"
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "icon" }),
                        "size-10 rounded-full"
                      )}
                      aria-label="CLI Mode"
                    >
                      <Terminal className="size-[18px]" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent sideOffset={10}>
                    <p>CLI Mode</p>
                  </TooltipContent>
                </Tooltip>
              </DockIcon>

              <DockIcon>
                <ModeToggle />
              </DockIcon>
            </Dock>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-16" />
    </>
  );
}

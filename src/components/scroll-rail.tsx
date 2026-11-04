"use client";

import { useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";

/**
 * vs-scroll-rail — instrument-style chapter rail for long pages.
 * Ported from VividSites (https://vividsites.app/c/scroll-rail).
 *
 * Renders a fixed tick-scale rail on the right edge with:
 *  - a lit fill + sprung needle riding the scroll position
 *  - chapter marks whose labels spring out on arrival
 *  - dock-style magnification on hover
 *  - click/drag to scrub
 *
 * Hidden on mobile (< 1024px) via CSS — the viewport is too narrow
 * for a fixed rail and still leaves room for content.
 */

interface Chapter {
  /** The label displayed on the rail */
  label: string;
  /** CSS selector for the chapter element (must match a single element) */
  selector: string;
}

interface ScrollRailProps {
  chapters: Chapter[];
  /** "right" (default) or "left" */
  side?: "right" | "left";
  /** "hover" (default) or "always" */
  labels?: "hover" | "always";
  /** Number of minor ticks (default 48) */
  ticks?: number;
}

export function ScrollRail({
  chapters,
  side = "right",
  labels = "hover",
  ticks = 48,
}: ScrollRailProps) {
  const navRef = useRef<HTMLElement>(null);
  const pathname = usePathname();

  const mountRail = useCallback(() => {
    const navRaw = navRef.current;
    if (!navRaw) return;
    const nav: HTMLElement = navRaw; // non-null for closures

    // Gather the actual chapter elements from the DOM
    const chapterEls: HTMLElement[] = [];
    for (const ch of chapters) {
      const el = document.querySelector<HTMLElement>(ch.selector);
      if (el) {
        el.dataset.railLabel = ch.label;
        if (!el.id) {
          el.id =
            "vs-rail-ch-" +
            ch.label.toLowerCase().replace(/[^a-z0-9]+/g, "-") +
            "-" +
            Math.random().toString(36).slice(2, 6);
        }
        chapterEls.push(el);
      }
    }

    if (!chapterEls.length) return;

    // ── Reduced-motion preference ──
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");

    // ── Animation loop ──
    const live = new Set<any>();
    let raf = 0;
    let last = 0;

    const tick = (now: number) => {
      const dt = Math.min(0.064, (now - last) / 1000 || 0.016);
      last = now;
      for (const s of live) {
        if (!s.update(dt, now)) live.delete(s);
      }
      raf = live.size ? requestAnimationFrame(tick) : 0;
    };

    const wake = (s: any) => {
      live.add(s);
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };

    // ── Spring utilities ──
    const sp = (
      x: number,
      k: number,
      z: number,
      eps = 0.001
    ): {
      x: number;
      v: number;
      g: number;
      k: number;
      z: number;
      eps: number;
      at: number;
      next: number | null;
    } => ({ x, v: 0, g: x, k, z, eps, at: 0, next: null });

    const step = (s: any, h: number) => {
      s.v +=
        (-s.k * (s.x - s.g) - 2 * Math.sqrt(s.k) * s.z * s.v) * h;
      s.x += s.v * h;
    };

    const clamp = (x: number, a: number, b: number) =>
      Math.min(b, Math.max(a, x));
    const pad = (n: number) => String(n).padStart(2, "0");

    // ── Scroller helpers (always the window) ──
    const topFn = () => scrollY;
    const maxTopFn = () =>
      Math.max(
        1,
        document.documentElement.scrollHeight - innerHeight
      );
    const viewHFn = () => innerHeight;
    const setTopFn = (y: number) => window.scrollTo(0, y);
    const sideFn = () => (nav.dataset.side === "left" ? -1 : 1);
    const alwaysFn = () => nav.dataset.labels === "always";

    // ── Build the rail markup ──
    if (!nav.hasAttribute("aria-label"))
      nav.setAttribute("aria-label", "Chapters");

    nav.innerHTML =
      `<div class="vs-scroll-rail-count" aria-hidden="true"><span><b>01</b></span><small>/${pad(
        chapterEls.length
      )}</small></div>` +
      '<div class="vs-scroll-rail-track"><span class="vs-scroll-rail-spine"></span><span class="vs-scroll-rail-grip" aria-hidden="true"></span><span class="vs-scroll-rail-ticks" aria-hidden="true"></span>' +
      '<span class="vs-scroll-rail-fill"></span><ol class="vs-scroll-rail-list">' +
      chapterEls
        .map(
          (c, i) =>
            `<li><a class="vs-scroll-rail-ch" href="#${c.id}"><span class="vs-scroll-rail-lab">${c.dataset.railLabel}</span>` +
            `<span class="vs-scroll-rail-num" aria-hidden="true">${pad(
              i + 1
            )}</span><span class="vs-scroll-rail-tk" aria-hidden="true"></span></a></li>`
        )
        .join("") +
      '</ol><span class="vs-scroll-rail-head" aria-hidden="true"><i></i><em>000</em></span></div>';

    const track = nav.querySelector<HTMLElement>(
      ".vs-scroll-rail-track"
    )!;
    const grip = nav.querySelector<HTMLElement>(
      ".vs-scroll-rail-grip"
    )!;
    const fill = nav.querySelector<HTMLElement>(
      ".vs-scroll-rail-fill"
    )!;
    const ticksEl = nav.querySelector<HTMLElement>(
      ".vs-scroll-rail-ticks"
    )!;
    const head = nav.querySelector<HTMLElement>(
      ".vs-scroll-rail-head"
    )!;
    const readout = head.lastChild as HTMLElement;
    const countB = nav.querySelector<HTMLElement>(
      ".vs-scroll-rail-count b"
    )!;

    const items = [
      ...nav.querySelectorAll<HTMLAnchorElement>(".vs-scroll-rail-ch"),
    ].map((a, i) => ({
      a,
      li: a.parentNode as HTMLElement,
      lab: a.firstChild as HTMLElement,
      num: a.children[1] as HTMLElement,
      tk: a.lastChild as HTMLElement,
      tkW: 0,
      f: 0,
      top: 0,
      vis: sp(0, 300, 0.62),
      act: sp(0, 260, 0.55),
    }));

    let tickArr: {
      el: HTMLElement;
      f: number;
      past?: boolean;
    }[] = [];
    let H = 1;
    let active = -1;
    let hover = false;
    let focusIn = false;
    let scrub: { id: number } | null = null;
    let glide: any = null;
    let lastPct = -1;

    const P = sp(0, 210, 0.92, 0.0002);
    const M = sp(0, 260, 0.9);
    const MY = sp(0, 520, 1, 0.1);

    function buildTicks() {
      const n = clamp(
        parseInt(nav.dataset.ticks || "48", 10) || 48,
        4,
        240
      );
      let h = "";
      for (let k = 0; k <= n; k++)
        h += `<i style="top:${((k / n) * 100).toFixed(4)}%"></i>`;
      ticksEl.innerHTML = h;
      tickArr = [...ticksEl.children].map((el, k) => ({
        el: el as HTMLElement,
        f: k / n,
      }));
      measure();
    }

    function measure() {
      H = track.clientHeight || 1;
      const max = maxTopFn();
      const base = -scrollY;
      items.forEach((it, i) => {
        it.tkW = it.tk.offsetWidth;
        it.top = chapterEls[i].getBoundingClientRect().top - base;
        it.f = clamp(it.top / max, 0, 1);
        it.li.style.transform = `translateY(${(it.f * H).toFixed(
          2
        )}px)`;
      });
      onScroll(true);
    }

    function onScroll(silent?: boolean) {
      const t = topFn();
      const max = maxTopFn();
      const p = clamp(t / max, 0, 1);
      P.g = p;
      if (reduce.matches || (silent === true && active < 0))
        P.x = p;

      const vH = viewHFn();
      // Mid-screen trigger (50% of viewport): as soon as a chapter heading
      // enters the upper half of the screen, it becomes active.
      const triggerLine = vH * 0.5;

      let a = 0;
      for (let i = 0; i < chapterEls.length; i++) {
        const rect = chapterEls[i].getBoundingClientRect();
        if (rect.top <= triggerLine) {
          a = i;
        }
      }

      // Special handling for the bottom chapters (Career/Education & Contact):
      // When nearing the bottom of the page, shorter sections can't scroll all
      // the way up to 50% because the document terminates.
      const scrollRemaining = max - t;
      const scrollRatio = max > 0 ? t / max : 0;

      if (scrollRemaining < vH * 0.45 || scrollRatio > 0.8) {
        const contactIdx = chapterEls.length - 1;
        const careerIdx = chapterEls.length - 2;
        const contactRect = chapterEls[contactIdx]?.getBoundingClientRect();
        const careerRect = chapterEls[careerIdx]?.getBoundingClientRect();

        if (contactRect && (contactRect.top <= vH * 0.72 || scrollRemaining < 70)) {
          a = contactIdx;
        } else if (careerRect && (careerRect.top <= vH * 0.72 || scrollRatio > 0.78)) {
          a = careerIdx;
        }
      }

      // Re-sync cached positions for chapter ticks so they adapt to layout shifts
      items.forEach((it, i) => {
        const el = chapterEls[i];
        if (!el) return;
        const newTop = el.getBoundingClientRect().top + t;
        if (Math.abs(newTop - it.top) > 4) {
          it.top = newTop;
          it.f = clamp(it.top / max, 0, 1);
          it.li.style.transform = `translateY(${(it.f * H).toFixed(2)}px)`;
        }
      });

      if (a !== active) setActive(a);
      wake(api);
    }

    function setActive(a: number) {
      const prev = active;
      active = a;
      items.forEach((it, i) => {
        it.a.classList.toggle("is-active", i === a);
        it.a.classList.toggle("is-past", i < a);
        if (i === a) it.a.setAttribute("aria-current", "true");
        else it.a.removeAttribute("aria-current");
      });
      countB.textContent = pad(a + 1);
      if (prev >= 0 && !reduce.matches && countB.animate) {
        const d = a > prev ? 1 : -1;
        countB.animate(
          [
            {
              transform: `translateY(${d * 70}%)`,
              opacity: 0,
            },
            { transform: "translateY(0)", opacity: 1 },
          ],
          {
            duration: 520,
            easing: "cubic-bezier(.2,1.25,.35,1)",
          }
        );
      }
      reveal();
    }

    function reveal() {
      const now = performance.now();
      const open = hover || focusIn || alwaysFn();
      const from = open && hover ? MY.g / H : P.g;
      items.forEach((it, i) => {
        const g =
          i === active
            ? 1
            : open
            ? alwaysFn() && !hover && !focusIn
              ? 0.55
              : 0.8
            : 0;
        const d = Math.abs(it.f - from) * items.length;
        it.vis.next = g;
        it.vis.at =
          now +
          (reduce.matches
            ? 0
            : Math.round(d * (g > it.vis.g ? 34 : 18)));
        it.act.g = i === active ? 1 : 0;
      });
      wake(api);
    }

    const api = {
      update(dt: number, now: number) {
        const n = Math.max(1, Math.round(dt * 240));
        const h = dt / n;
        let moving = false;

        if (glide) {
          const g = glide;
          step(g, dt);
          if (
            Math.abs(g.v) < 2 &&
            Math.abs(g.x - g.g) < 0.5
          ) {
            setTopFn(g.g);
            glide = null;
          } else {
            setTopFn(g.x);
            moving = true;
          }
        }

        const all: any[] = [P, M, MY];
        for (const it of items) {
          if (it.vis.next != null && now >= it.vis.at) {
            it.vis.g = it.vis.next;
            it.vis.next = null;
          }
          if (it.vis.next != null) moving = true;
          all.push(it.vis, it.act);
        }

        for (const s of all) {
          if (
            Math.abs(s.v) < s.eps &&
            Math.abs(s.x - s.g) < s.eps
          ) {
            s.x = s.g;
            s.v = 0;
            continue;
          }
          moving = true;
          if (reduce.matches) {
            s.x = s.g;
            s.v = 0;
            continue;
          }
          for (let i = 0; i < n; i++) step(s, h);
        }

        const dir = sideFn();
        const p = clamp(P.x, 0, 1);
        fill.style.transform = `scaleY(${p.toFixed(5)})`;
        head.style.transform = `translate3d(0,${(p * H).toFixed(
          2
        )}px,0)`;
        const pct = Math.round(P.g * 100);
        if (pct !== lastPct) {
          lastPct = pct;
          readout.textContent = String(pct).padStart(3, "0");
        }

        // Dock-style magnification
        const m = M.x;
        const my = MY.x;
        const R = Math.max(26, H * 0.075);
        for (const t of tickArr) {
          const y = t.f * H;
          const g =
            m > 0.002
              ? m * Math.exp(-(((y - my) / R) ** 2))
              : 0;
          t.el.style.transform = g
            ? `scaleX(${(1 + g * 2.1).toFixed(3)})`
            : "";
          const past = t.f <= p + 1e-6;
          if (past !== t.past) {
            t.past = past;
            t.el.classList.toggle("is-past", past);
          }
        }

        items.forEach((it) => {
          const y = it.f * H;
          const g =
            m > 0.002
              ? m * Math.exp(-(((y - my) / R) ** 2))
              : 0;
          const v = clamp(it.vis.x, 0, 1.4);
          const a = it.act.x;
          it.lab.style.opacity = clamp(v, 0, 1).toFixed(3);
          const grow = a * 0.75 + g * 0.7;
          const ext = it.tkW * grow;
          it.lab.style.transform = `translate3d(${(
            dir *
            ((1 - clamp(v, 0, 1)) * 18 - a * 6 - ext)
          ).toFixed(2)}px,0,0) scale(${(1 + a * 0.42).toFixed(
            4
          )})`;
          it.num.style.transform =
            ext > 0.05
              ? `translate3d(${(-dir * ext).toFixed(2)}px,0,0)`
              : "";
          it.tk.style.transform = `scaleX(${(1 + grow).toFixed(
            4
          )})`;
        });

        return moving || !!scrub;
      },
      refresh: () => buildTicks(),
      go: (i: number) => goTo(i),
    };

    function goTo(i: number) {
      const it = items[i];
      if (!it) return;
      const el = chapterEls[i];
      const target = el
        ? clamp(el.getBoundingClientRect().top + topFn(), 0, maxTopFn())
        : clamp(it.top, 0, maxTopFn());
      if (reduce.matches) {
        setTopFn(target);
        return;
      }
      glide = glide || {
        x: topFn(),
        v: 0,
        g: target,
        k: 90,
        z: 1,
      };
      glide.g = target;
      glide.x = topFn();
      wake(api);
    }

    const stopGlide = () => {
      glide = null;
    };

    const scrollHandler = () => onScroll();

    // ── Event listeners ──
    window.addEventListener("wheel", stopGlide, {
      passive: true,
    });
    window.addEventListener("touchstart", stopGlide, {
      passive: true,
    });
    window.addEventListener("scroll", scrollHandler, {
      passive: true,
    });

    // ── Periodic re-measure to catch lazy-loaded content shifting positions ──
    const remeasureInterval = setInterval(() => {
      measure();
    }, 2000);

    items.forEach((it, i) => {
      it.a.addEventListener("click", (e) => {
        e.preventDefault();
        goTo(i);
      });
      it.a.addEventListener("keydown", (e) => {
        const d: Record<string, number> = {
          ArrowDown: 1,
          ArrowRight: 1,
          ArrowUp: -1,
          ArrowLeft: -1,
        };
        if (
          d[e.key] == null &&
          e.key !== "Home" &&
          e.key !== "End"
        )
          return;
        e.preventDefault();
        const j =
          e.key === "Home"
            ? 0
            : e.key === "End"
            ? items.length - 1
            : clamp(i + d[e.key], 0, items.length - 1);
        items[j].a.focus();
      });
    });

    nav.addEventListener("focusin", () => {
      focusIn =
        nav.querySelector(":focus-visible") != null;
      reveal();
    });
    nav.addEventListener("focusout", () =>
      setTimeout(() => {
        focusIn =
          nav.contains(document.activeElement) &&
          nav.querySelector(":focus-visible") != null;
        reveal();
      })
    );

    const localY = (e: PointerEvent | MouseEvent) =>
      clamp(
        e.clientY - track.getBoundingClientRect().top,
        0,
        H
      );

    nav.addEventListener("pointermove", (e) => {
      if ((e as PointerEvent).pointerType === "mouse" || scrub) {
        MY.g = localY(e);
        if (M.x < 0.01 && !scrub) MY.x = MY.g;
      }
      if (
        scrub &&
        (e as PointerEvent).pointerId === scrub.id
      ) {
        glide = null;
        setTopFn((localY(e) / H) * maxTopFn());
      }
      wake(api);
    });

    nav.addEventListener("pointerenter", (e) => {
      if ((e as PointerEvent).pointerType !== "mouse") return;
      hover = true;
      MY.x = MY.g = localY(e);
      M.g = 1;
      reveal();
    });
    nav.addEventListener("pointerleave", (e) => {
      if ((e as PointerEvent).pointerType !== "mouse") return;
      hover = false;
      M.g = 0;
      reveal();
    });

    grip.addEventListener("pointerdown", (e) => {
      if ((e as PointerEvent).button > 0) return;
      scrub = { id: (e as PointerEvent).pointerId };
      MY.x = MY.g = localY(e);
      M.g = 1;
      try {
        grip.setPointerCapture(
          (e as PointerEvent).pointerId
        );
      } catch (_) {}
      const f = localY(e) / H;
      glide = {
        x: topFn(),
        v: 0,
        g: f * maxTopFn(),
        k: 140,
        z: 1,
      };
      wake(api);
    });

    const endScrub = (e: PointerEvent) => {
      if (!scrub || e.pointerId !== scrub.id) return;
      scrub = null;
      if (!hover) M.g = 0;
      wake(api);
    };
    grip.addEventListener("pointerup", endScrub as any);
    grip.addEventListener("pointercancel", endScrub as any);

    // ── Observers ──
    const mo = new MutationObserver((ms) => {
      if (
        ms.some((m) => m.attributeName === "data-ticks")
      )
        buildTicks();
      reveal();
    });
    mo.observe(nav, {
      attributes: true,
      attributeFilter: [
        "data-ticks",
        "data-labels",
        "data-side",
      ],
    });

    const ro = new ResizeObserver(() => measure());
    ro.observe(track);
    chapterEls.forEach((c) => ro.observe(c));
    if (typeof document !== "undefined" && document.body) {
      ro.observe(document.body);
    }

    (nav as any).__vsSr = api;
    buildTicks();

    // Initialize visual state
    items.forEach((it, i) => {
      it.vis.x = it.vis.g =
        i === active ? 1 : alwaysFn() ? 0.55 : 0;
      it.act.x = it.act.g = i === active ? 1 : 0;
    });
    P.x = P.g;
    api.update(0, performance.now());

    // ── Cleanup function ──
    return () => {
      if (raf) cancelAnimationFrame(raf);
      live.clear();
      ro.disconnect();
      mo.disconnect();
      clearInterval(remeasureInterval);
      window.removeEventListener("wheel", stopGlide);
      window.removeEventListener("touchstart", stopGlide);
      window.removeEventListener("scroll", scrollHandler);
      // Remove data-rail-label from chapter elements
      chapterEls.forEach((el) => {
        delete el.dataset.railLabel;
      });
      nav.innerHTML = "";
      delete (nav as any).__vsSr;
    };
  }, [chapters]);

  useEffect(() => {
    // Delay mount so lazy-loaded content (GitHub calendar, images) has
    // time to render before we measure chapter positions.
    let cleanup: (() => void) | undefined;
    const timer = setTimeout(() => {
      cleanup = mountRail();
    }, 600);

    return () => {
      clearTimeout(timer);
      cleanup?.();
    };
  }, [mountRail, pathname]);

  return (
    <nav
      ref={navRef}
      className="vs-scroll-rail"
      aria-label="Chapters"
      data-labels={labels}
      data-side={side}
      data-ticks={String(ticks)}
    />
  );
}

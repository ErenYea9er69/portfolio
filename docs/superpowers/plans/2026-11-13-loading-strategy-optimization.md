# Portfolio Loading Strategy Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the portfolio loading strategy into a high-performance progressive hydration architecture without modifying the loading screen UI, preserving all visual design and animations while deferring non-critical assets and making all APIs fast, cached, and resilient.

**Architecture:** 
1. Restrict initial loading screen preloads strictly to first-viewport critical assets (Inter webfont and hero `/avatar.jpg`), removing the 1.12 MB raw project image preload and deferring GPU-intensive background loops.
2. Fix the `lazy-client.tsx` `requestIdleCallback` bypass bug by introducing anticipatory `IntersectionObserver` wrappers (with 350px `rootMargin`) for `#github-activity`, `#skills`, `#projects`, and `#visitor-counter`.
3. Harden and optimize all external and internal API interactions (GitHub REST rate-limit guard, deduplicated snake mode contributions, instant client year caching, local avatar for X hover card, and 5s cold-start timeout for Neon visitor counter).

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, Framer Motion.

**Spec:** `docs/superpowers/specs/2026-11-13-loading-strategy-optimization-design.md`

## Global Constraints
- Preserve 100% of the initial loading screen UI, circular progress bar, infinity track, step labels, and visual timing.
- Preserve all existing animations, visual styling, typography, and functional behavior.
- Zero new runtime dependencies.
- Never block the homepage or any section on an external API or database failure.
- Never hardcode dynamic stats that can become outdated; use resilient live fetching with stale-while-revalidate caching and graceful fallbacks.
- Ensure Cumulative Layout Shift (CLS) remains 0 by preserving skeleton placeholder dimensions.

## Review Focus
1. **Initial screen bundle & network requests**: Ensure only critical font and hero avatar load during the 2.9s loader curtain; zero project images load before scrolling.
2. **IntersectionObserver triggering**: Verify that `#github-activity`, `#skills`, `#projects`, and footer components load cleanly before entering the viewport without lag or jarring pop-in.
3. **GitHub API rate limit resilience**: If GitHub returns 403 or network is disconnected, ensure repo count and calendar fail gracefully without crashing or showing broken layouts.
4. **Snake Mode data flow**: Verify Snake Mode renders immediately using already-fetched contribution data without any duplicate network request.
5. **Visitor counter accuracy**: Verify `/api/visitor-count` increments on first visit, does not duplicate on re-renders, and times out safely after 5s if Neon Postgres takes too long.

---

### Task 1: Verify Codebase Baseline & Audit Initial Loader

**Files:**
- Modify: `src/components/initial-loader.tsx`
- Modify: `src/components/page-background.tsx`

**Interfaces:**
- Consumes: `useInitialLoader()` (`{ isLoaded, isLoading }`)
- Produces: Streamlined asset preload sequence; background effect deferral until reveal.

- [ ] **Step 1: Inspect and verify existing preload logic in `initial-loader.tsx`**
  Verify lines 30-45 and 115-135 where `PROJECT_IMAGES` are mapped and loaded via `new Image().src = src`.
- [ ] **Step 2: Streamline `initial-loader.tsx` preloading**
  - Keep `CRITICAL_IMAGES = [DATA.avatarUrl]` (`/avatar.jpg`).
  - Remove `PROJECT_IMAGES.forEach((src) => { const img = new Image(); ... })`.
  - Preserve `MIN_DISPLAY_MS = 2900`, step labels, circular progress bar, infinity track, and monogram styling intact.
- [ ] **Step 3: Update `page-background.tsx` to coordinate with `InitialLoader`**
  - Use `useInitialLoader()` so that background meteor and heavy floating cloud animations activate as the curtain reveals (`isLoaded`), preventing GPU/CPU contention while the loader progress bar is animating.
- [ ] **Step 4: Verify build and test**
  Run `npm run build` to confirm zero compilation errors.

---

### Task 2: Progressive Hydration & IntersectionObserver in `lazy-client.tsx`

**Files:**
- Modify: `src/components/lazy-client.tsx`

**Interfaces:**
- Consumes: `dynamic()` imports for `GitHubCalendarSection`, `TechStackSection`, `ProjectsSection`, `VisitorCounter`, `CommandPalette`.
- Produces: Viewport-aware dynamic client wrappers with 350px anticipatory `rootMargin`.

- [ ] **Step 1: Fix `GitHubCalendarSection` in `lazy-client.tsx`**
  - Replace the flawed `requestIdleCallback` early return.
  - Implement a clean `IntersectionObserver` observing the container with `rootMargin: "350px"`.
  - Fall back to idle callback or timeout only if `IntersectionObserver` is not supported in the browser.
- [ ] **Step 2: Wrap `TechStackSection` and `ProjectsSection` with progressive viewport loading**
  - Create reusable `ViewportLazy` or wrap `TechStackSection` and `ProjectsSection` with `IntersectionObserver` (350px rootMargin) matching the height skeletons (`h-48` and `h-72`) to eliminate any CLS while preventing premature JS execution during initial load.
- [ ] **Step 3: Optimize `CommandPalette` loading**
  - Ensure `CommandPalette` does not run idle prefetching while the initial loader is active; trigger prefetch only after `isLoaded` is true, or immediately on `keydown` (Ctrl+K / Cmd+K).
- [ ] **Step 4: Verify build and test**
  Run `npm run build` to confirm zero compilation errors.

---

### Task 3: External API Hardening & Caching in `github-calendar-section.tsx` & `x-hover-card.tsx`

**Files:**
- Modify: `src/components/github-calendar-section.tsx`
- Modify: `src/components/x-hover-card.tsx`

**Interfaces:**
- Consumes: GitHub REST API (`api.github.com/users/...`), GitHub Contributions API (`jogruber.de`).
- Produces: Resilient, cached GitHub stats and 0ms local avatar for X hover card.

- [ ] **Step 1: Harden GitHub public repos fetching in `github-calendar-section.tsx`**
  - Wrap fetch in an `AbortController` with a 4000ms timeout.
  - Check `localStorage` cache first: if valid, use it immediately (stale-while-revalidate).
  - If rate limited (HTTP 403), offline, or timed out, gracefully retain cached value or fall back safely without console errors.
- [ ] **Step 2: Eliminate duplicate Snake Mode fetch & add year contributions cache**
  - In snake mode toggle: check if `rawContributions` for the selected year is already in state or cache; only fetch if data is completely missing.
  - Add in-memory cache ref for year datasets (`contributionsCacheRef.current[year] = data`) so switching between "last", "2026", and "2025" is instant (0ms) without redundant network requests.
- [ ] **Step 3: Optimize `x-hover-card.tsx`**
  - Change `X_PROFILE.avatar` from `https://unavatar.io/x/ErenYea9er` to `/avatar.jpg`.
  - Eliminate the 810ms third-party network request and external dependency.
- [ ] **Step 4: Verify build and test**
  Run `npm run build` to confirm zero compilation errors.

---

### Task 4: Visitor Counter Viewport Trigger & Neon Cold-Start Protection

**Files:**
- Modify: `src/components/visitor-counter.tsx`
- Modify: `src/app/api/visitor-count/route.ts`

**Interfaces:**
- Consumes: `/api/visitor-count` route handler.
- Produces: Protected, viewport-triggered visitor counter with 5s timeout and session caching.

- [ ] **Step 1: Optimize `visitor-counter.tsx`**
  - Replace unconditional timer with `IntersectionObserver` (`rootMargin: "300px"`) on the counter element.
  - Wrap fetch in an `AbortController` with a 5000ms timeout to protect against Neon Postgres cold-start hanging.
  - Check `sessionStorage` for last known count in current session; display immediately to prevent layout shifts.
  - Ensure server cookie deduplication is preserved so counting logic remains 100% accurate.
- [ ] **Step 2: Add cache control headers in `/api/visitor-count/route.ts`**
  - When visitor is already counted (`alreadyCounted === true`), add `Cache-Control: private, max-age=60` to avoid redundant database round trips within 60 seconds.
- [ ] **Step 3: Verify build and test**
  Run `npm run build` to confirm zero compilation errors.

---

### Task 5: Cold Load Verification, Benchmarking & Performance Audit

**Files:**
- Test script: `C:\Users\hp\.gemini\antigravity\brain\b14d8c36-6b47-44dc-b7fa-457bbe31cc3f\scratch\verify-performance.mjs`

- [ ] **Step 1: Run production build and start server**
  Run `npm run build` followed by test server run.
- [ ] **Step 2: Measure cold load network requests and asset weights**
  - Compare initial loader phase asset transfers (before vs after).
  - Verify zero project PNGs downloaded during initial load (saving > 1.12 MB).
- [ ] **Step 3: Measure API performance & caching**
  - Verify GitHub repo count renders smoothly.
  - Verify Snake Mode toggles with 0 duplicate requests.
  - Verify year switching latency is 0ms on cached years.
  - Verify X hover card renders avatar in 0ms.
- [ ] **Step 4: Verify mobile & desktop UI, responsiveness, and animations**
  - Ensure loading screen UI (circular progress bar, infinity track, step labels) is 100% pixel-perfect and visually unchanged.
  - Ensure smooth scrolling, zero CLS, and no console errors.

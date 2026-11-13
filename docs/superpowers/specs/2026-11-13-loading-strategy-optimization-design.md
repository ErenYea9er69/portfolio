# Design Document: Portfolio Loading Strategy Optimization

## Intent & The Why
The portfolio currently exhibits resource contention during the initial load:
- Over 1.12 MB of below-the-fold raw project images are preloaded via unthrottled `new Image()` calls during the initial 2.9-second loading screen.
- A logic bug in `lazy-client.tsx` prematurely fires heavy below-the-fold component bundles and unauthenticated external API calls (GitHub REST API, GitHub Contributions API) during the initial loader curtain via an early-return `requestIdleCallback`.
- External APIs suffer from rate limits (GitHub REST API 60 req/hr), high latency (Unavatar 810ms, Contributions 320–970ms), and Neon serverless cold starts (800–2500ms).

The goal is to streamline the initial loading screen to only critical first-viewport assets, defer all below-the-fold resources until near-viewport intersection, and make all API calls resilient, cached, and non-blocking.

---

## Goals, Non-Goals & Constraints

### Goals
- **Strict Resource Prioritization**: First viewport assets (font, hero avatar, core layout) load cleanly without bandwidth contention.
- **Zero Wasted Bandwidth**: Defer all below-the-fold images and components until the user scrolls within 300–400px of them.
- **API Hardening**: Eliminate duplicate requests (Snake Mode), eliminate external latency bottlenecks (Unavatar), guard against GitHub rate limits and Neon cold starts with sensible timeouts and stale-while-revalidate caching.
- **Zero Layout Shifts (CLS = 0)**: Maintain exact skeleton dimensions for deferred sections.

### Non-Goals
- Modifying the visual UI, animation sequence, or styling of the initial loading screen (circular progress bar, infinity track, monospace typography remain visually identical).
- Modifying the portfolio layout, visual design, colors, or copy.

### Anti-Goals & Constraints
- Never block homepage visibility on an external API or database call.
- Never expose any API credentials or sensitive tokens.
- Never download heavy unoptimized raw image files when Next.js responsive image optimization is available.

---

## Approaches Considered

### Approach A: Strict Viewport-Driven Progressive Hydration (Selected)
- **Initial Screen**: Preload only critical first-viewport resources (Inter font, `/avatar.jpg`). Remove 1.12 MB project image preload. Defer background particle/meteor animation loops until curtain reveals.
- **Intersection-Driven Hydration**: Fix `lazy-client.tsx` to use true `IntersectionObserver` with an anticipatory `rootMargin` (300px–400px) for `#github-activity`, `#skills`, `#projects`, and `#visitor-counter`.
- **API Optimization**:
  - GitHub Repos: Baseline 72, stale-while-revalidate localStorage, 4s `AbortController` timeout.
  - GitHub Calendar: Deduplicate Snake Mode fetch, add in-memory/session year cache for instant year switching.
  - X Hover Card: Use local `/avatar.jpg` (0ms, 0 external network requests).
  - Visitor Counter: Viewport-triggered with 5s timeout and session cache.
- **Tradeoffs**: Requires true scroll intersection to trigger heavy bundles; ideal for real users and mobile devices.

### Approach B: Aggressive Post-Curtain Idle Prefetching
- Preloads only critical assets during the initial loader, but starts downloading all below-the-fold sections and images as soon as the loader finishes, regardless of scroll.
- **Tradeoffs**: Wastes bandwidth and battery on mobile for users who bounce after viewing the hero; increases risk of GitHub API rate limits.

---

## Detailed Implementation Specification

### 1. `src/components/initial-loader.tsx`
- **Asset Pipeline**:
  - Keep `CRITICAL_IMAGES = ["/avatar.jpg"]`.
  - Remove `PROJECT_IMAGES.forEach((src) => { new Image().src = src; })`. Project images will be loaded by Next.js `<Image />` when `#projects` enters the viewport.
  - Remove `/github-avatar.png` from initial critical blocking (handled on hover by `FlipAvatar`).
- **Visual & UI**:
  - Preserve `MIN_DISPLAY_MS = 2900`, circular progress bar, monospace infinity track, and step labels without any UI changes.

### 2. `src/components/page-background.tsx` & `src/components/meteors-background.tsx`
- Coordinate with `useInitialLoader()` so that intensive GPU animation loops (meteors, floating clouds) initialize when `isLoaded` becomes true (or revealing), ensuring 100% of CPU/GPU is dedicated to the 60fps loader gauge.

### 3. `src/components/lazy-client.tsx`
- **Fix Lazy Wrappers**:
  - In `GitHubCalendarSection`: Fix the `requestIdleCallback` bug by prioritizing `IntersectionObserver` with `rootMargin: "350px"`. Fall back to idle callback only when `IntersectionObserver` is unsupported.
  - In `TechStackSection`: Wrap with viewport-intersection observer (`rootMargin: "350px"`) before dynamic import loads.
  - In `ProjectsSection`: Wrap with viewport-intersection observer (`rootMargin: "350px"`).
  - In `CommandPalette`: Listen for `keydown` (Ctrl+K / Cmd+K); prefetch chunk only on idle *after* the initial loader has completed.

### 4. `src/components/github-calendar-section.tsx`
- **Repos Count API**:
  - Seed initial state with fallback 72 (actual public repos count).
  - Check `localStorage` for cached count; if present, display immediately.
  - Revalidate in background with an `AbortController` (4-second timeout).
  - If rate limited (HTTP 403) or offline, silently retain cached/baseline count without throwing errors.
- **Snake Mode Deduplication**:
  - If `rawContributions.length > 0`, reuse existing contributions. Do not issue a redundant `fetch` to `jogruber.de`.
- **Year Cache**:
  - Store contribution datasets by year in a local cache ref/sessionStorage so switching between "last", "2026", and "2025" is instant (0ms).

### 5. `src/components/x-hover-card.tsx`
- Replace `avatar: "https://unavatar.io/x/ErenYea9er"` with `avatar: "/avatar.jpg"`.
- Instant 0ms load, immune to external CDN downtime or tracking blockers.

### 6. `src/components/visitor-counter.tsx` & `/api/visitor-count/route.ts`
- **Component**:
  - Attach `IntersectionObserver` (`rootMargin: "300px"`) to only trigger fetch when approaching the footer.
  - Add 5-second `AbortController` timeout to guard against Neon Postgres cold starts.
  - Cache result in `sessionStorage` for instant display on revisiting footer.
- **Route Handler**:
  - Add `Cache-Control: private, max-age=60` header for `alreadyCounted` queries.

---

## Verification Plan
1. **Build Verification**: Run `npm run build` and ensure clean compile with zero type errors.
2. **Cold Load Network Audit**:
   - Verify network requests during the 2.9s loader: only `/avatar.jpg`, fonts, and app shell scripts load.
   - Verify project images and below-the-fold bundles do NOT load until scrolled into view.
3. **API Performance Verification**:
   - Verify GitHub repo count renders instantly (72) without "—" flash.
   - Verify Snake Mode toggles without triggering duplicate network requests.
   - Verify year tab switching is instant once loaded.
   - Verify XHoverCard renders avatar with 0ms external latency.
   - Verify VisitorCounter only fires when scrolling near footer.

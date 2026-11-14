'use client';

export const BASELINE_VISITORS = 290;
const SESSION_CACHE_KEY = 'site_visitor_count_cache_v3';

let currentPromise: Promise<{ count: number; incremented: boolean }> | null = null;
const listeners = new Set<(count: number) => void>();
let latestCount: number | null = null;

export function getCachedVisitorCount(): number {
  if (typeof window === 'undefined') return BASELINE_VISITORS;
  if (latestCount !== null && latestCount >= BASELINE_VISITORS) return latestCount;

  try {
    const cached = sessionStorage.getItem(SESSION_CACHE_KEY) || localStorage.getItem(SESSION_CACHE_KEY);
    if (cached) {
      const parsed = Number(cached);
      if (!isNaN(parsed) && parsed >= BASELINE_VISITORS) {
        latestCount = parsed;
        return parsed;
      }
    }
  } catch {}

  return BASELINE_VISITORS;
}

export function trackVisitor(forceRefresh = false): Promise<{ count: number; incremented: boolean }> {
  if (typeof window === 'undefined') {
    return Promise.resolve({ count: BASELINE_VISITORS, incremented: false });
  }

  if (forceRefresh) {
    currentPromise = null;
  }

  if (!currentPromise) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    currentPromise = fetch(`/api/visitor-count?t=${Date.now()}`, {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
      signal: controller.signal,
    })
      .then(async (res) => {
        clearTimeout(timeoutId);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return (await res.json()) as { count: number; incremented: boolean };
      })
      .then((data) => {
        if (typeof data.count === 'number' && data.count >= BASELINE_VISITORS) {
          latestCount = data.count;
          try {
            sessionStorage.setItem(SESSION_CACHE_KEY, String(data.count));
            localStorage.setItem(SESSION_CACHE_KEY, String(data.count));
          } catch {}
          listeners.forEach((fn) => {
            try {
              fn(data.count);
            } catch (err) {
              console.error('Visitor listener error:', err);
            }
          });
        }
        return data;
      })
      .catch((err) => {
        clearTimeout(timeoutId);
        if (err.name !== 'AbortError') {
          console.error('Visitor tracking error:', err);
        }
        currentPromise = null; // allow retry on subsequent trigger
        return { count: latestCount ?? BASELINE_VISITORS, incremented: false };
      });
  }

  return currentPromise;
}

export function subscribeVisitorCount(fn: (count: number) => void): () => void {
  listeners.add(fn);
  if (latestCount !== null) {
    fn(latestCount);
  }
  return () => {
    listeners.delete(fn);
  };
}

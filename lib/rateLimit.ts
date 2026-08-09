type Attempt = { count: number; resetAt: number };

const store = new Map<string, Attempt>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

export function isRateLimited(key: string): boolean {
  const now = Date.now();
  const rec = store.get(key);
  if (!rec || now > rec.resetAt) return false;
  return rec.count >= MAX_ATTEMPTS;
}

export function recordFailure(key: string): void {
  const now = Date.now();
  const rec = store.get(key);
  if (!rec || now > rec.resetAt) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS });
  } else {
    rec.count++;
  }
}

export function resetAttempts(key: string): void {
  store.delete(key);
}

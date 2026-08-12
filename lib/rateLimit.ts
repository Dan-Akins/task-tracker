type Attempt = { count: number; resetAt: number };

function createLimiter(maxAttempts: number, windowMs: number) {
  const store = new Map<string, Attempt>();

  return {
    isRateLimited(key: string): boolean {
      const now = Date.now();
      const rec = store.get(key);
      if (!rec || now > rec.resetAt) return false;
      return rec.count >= maxAttempts;
    },
    recordFailure(key: string): void {
      const now = Date.now();
      const rec = store.get(key);
      if (!rec || now > rec.resetAt) {
        store.set(key, { count: 1, resetAt: now + windowMs });
      } else {
        rec.count++;
      }
    },
    resetAttempts(key: string): void {
      store.delete(key);
    },
  };
}

const emailLimiter = createLimiter(5, 15 * 60 * 1000);

export const isRateLimited = emailLimiter.isRateLimited;
export const recordFailure = emailLimiter.recordFailure;
export const resetAttempts = emailLimiter.resetAttempts;

const ipLimiter = createLimiter(5, 60 * 1000);

export const isIpRateLimited = ipLimiter.isRateLimited;
export const recordIpFailure = ipLimiter.recordFailure;
export const resetIpAttempts = ipLimiter.resetAttempts;

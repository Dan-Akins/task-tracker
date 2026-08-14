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

// General request-quota limiting (distinct from the login-attempt limiters
// above): every call counts against the quota, not just failures.
function createRequestLimiter(maxRequests: number, windowMs: number) {
  const store = new Map<string, Attempt>();

  return {
    consume(key: string): boolean {
      const now = Date.now();
      const rec = store.get(key);
      if (!rec || now > rec.resetAt) {
        store.set(key, { count: 1, resetAt: now + windowMs });
        return true;
      }
      if (rec.count >= maxRequests) return false;
      rec.count++;
      return true;
    },
  };
}

const writeLimiter = createRequestLimiter(30, 60 * 1000);
const readLimiter = createRequestLimiter(60, 60 * 1000);

/** Returns false once `key` has made 30 write requests within the last minute. */
export function consumeWriteQuota(key: string): boolean {
  return writeLimiter.consume(key);
}

/** Returns false once `key` has made 60 read requests within the last minute. */
export function consumeReadQuota(key: string): boolean {
  return readLimiter.consume(key);
}

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

export const RATE_LIMIT_MESSAGE = "Too many requests. Please try again in a minute.";

// Failed-login lockouts: keyed by email, a longer window protects one
// targeted account; keyed by IP, a shorter window mainly slows spray
// attacks across many emails from the same source.
const LOGIN_ATTEMPT_LIMIT = 5;
const LOGIN_LOCKOUT_WINDOW_MS = 15 * 60 * 1000;
const IP_ATTEMPT_LIMIT = 5;
const IP_LOCKOUT_WINDOW_MS = 60 * 1000;

// Request quotas: every call counts, not just failures.
const WRITE_QUOTA_LIMIT = 30;
const WRITE_QUOTA_WINDOW_MS = 60 * 1000;
const READ_QUOTA_LIMIT = 60;
const READ_QUOTA_WINDOW_MS = 60 * 1000;

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

const emailLimiter = createLimiter(LOGIN_ATTEMPT_LIMIT, LOGIN_LOCKOUT_WINDOW_MS);

export const isRateLimited = emailLimiter.isRateLimited;
export const recordFailure = emailLimiter.recordFailure;
export const resetAttempts = emailLimiter.resetAttempts;

const ipLimiter = createLimiter(IP_ATTEMPT_LIMIT, IP_LOCKOUT_WINDOW_MS);

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

const writeLimiter = createRequestLimiter(WRITE_QUOTA_LIMIT, WRITE_QUOTA_WINDOW_MS);
const readLimiter = createRequestLimiter(READ_QUOTA_LIMIT, READ_QUOTA_WINDOW_MS);

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

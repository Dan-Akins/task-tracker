import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  isRateLimited,
  recordFailure,
  resetAttempts,
  consumeWriteQuota,
  consumeReadQuota,
  getClientIp,
} from "./rateLimit";

describe("rateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("is not rate limited when no attempts have been recorded", () => {
    expect(isRateLimited("new@example.com")).toBe(false);
  });

  it("is not rate limited before reaching the max attempts", () => {
    const key = "under-limit@example.com";
    for (let i = 0; i < 4; i++) recordFailure(key);
    expect(isRateLimited(key)).toBe(false);
  });

  it("is rate limited once the max attempts is reached", () => {
    const key = "over-limit@example.com";
    for (let i = 0; i < 5; i++) recordFailure(key);
    expect(isRateLimited(key)).toBe(true);
  });

  it("stops being rate limited after the window expires", () => {
    const key = "expired@example.com";
    for (let i = 0; i < 5; i++) recordFailure(key);
    expect(isRateLimited(key)).toBe(true);

    vi.setSystemTime(new Date("2026-01-01T00:15:00.001Z"));
    expect(isRateLimited(key)).toBe(false);
  });

  it("resets the counter after the window expires instead of accumulating", () => {
    const key = "reset-window@example.com";
    for (let i = 0; i < 5; i++) recordFailure(key);

    vi.setSystemTime(new Date("2026-01-01T00:15:00.001Z"));
    recordFailure(key);
    expect(isRateLimited(key)).toBe(false);
  });

  it("resetAttempts clears the record so the key is no longer limited", () => {
    const key = "cleared@example.com";
    for (let i = 0; i < 5; i++) recordFailure(key);
    expect(isRateLimited(key)).toBe(true);

    resetAttempts(key);
    expect(isRateLimited(key)).toBe(false);
  });
});

describe("consumeWriteQuota", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows requests up to the 30/minute limit", () => {
    const key = "write-under-limit";
    for (let i = 0; i < 30; i++) {
      expect(consumeWriteQuota(key)).toBe(true);
    }
  });

  it("rejects the 31st request within the same window", () => {
    const key = "write-over-limit";
    for (let i = 0; i < 30; i++) consumeWriteQuota(key);
    expect(consumeWriteQuota(key)).toBe(false);
  });

  it("allows requests again once the window rolls over", () => {
    const key = "write-window-reset";
    for (let i = 0; i < 30; i++) consumeWriteQuota(key);
    expect(consumeWriteQuota(key)).toBe(false);

    vi.setSystemTime(new Date("2026-01-01T00:01:00.001Z"));
    expect(consumeWriteQuota(key)).toBe(true);
  });

  it("tracks separate keys independently", () => {
    const a = "write-key-a";
    const b = "write-key-b";
    for (let i = 0; i < 30; i++) consumeWriteQuota(a);
    expect(consumeWriteQuota(a)).toBe(false);
    expect(consumeWriteQuota(b)).toBe(true);
  });
});

describe("consumeReadQuota", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows requests up to the 60/minute limit", () => {
    const key = "read-under-limit";
    for (let i = 0; i < 60; i++) {
      expect(consumeReadQuota(key)).toBe(true);
    }
  });

  it("rejects the 61st request within the same window", () => {
    const key = "read-over-limit";
    for (let i = 0; i < 60; i++) consumeReadQuota(key);
    expect(consumeReadQuota(key)).toBe(false);
  });

  it("allows requests again once the window rolls over", () => {
    const key = "read-window-reset";
    for (let i = 0; i < 60; i++) consumeReadQuota(key);
    expect(consumeReadQuota(key)).toBe(false);

    vi.setSystemTime(new Date("2026-01-01T00:01:00.001Z"));
    expect(consumeReadQuota(key)).toBe(true);
  });

  it("does not share quota with consumeWriteQuota for the same key", () => {
    const key = "shared-key-name";
    for (let i = 0; i < 30; i++) consumeWriteQuota(key);
    expect(consumeWriteQuota(key)).toBe(false);
    expect(consumeReadQuota(key)).toBe(true);
  });
});

describe("getClientIp", () => {
  it("uses the first address in x-forwarded-for", () => {
    const req = new Request("http://localhost", {
      headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" },
    });
    expect(getClientIp(req)).toBe("1.2.3.4");
  });

  it("falls back to x-real-ip when x-forwarded-for is absent", () => {
    const req = new Request("http://localhost", {
      headers: { "x-real-ip": "9.9.9.9" },
    });
    expect(getClientIp(req)).toBe("9.9.9.9");
  });

  it("falls back to 'unknown' when neither header is present", () => {
    const req = new Request("http://localhost");
    expect(getClientIp(req)).toBe("unknown");
  });
});

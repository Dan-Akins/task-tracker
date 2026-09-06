import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import type { NextFetchEvent } from "next/server";

// proxy.ts delegates non-API paths to NextAuth's own middleware (`auth`),
// whose redirect/allow behavior is already covered by
// auth.config.test.ts's tests of the `authorized` callback. Mocking
// "next-auth" here isolates proxy.ts's own logic — routing by path and the
// CORS allowlist for /api/* — from NextAuth's request/session internals.
const authMiddleware = vi.fn((_req: NextRequest) => new Response("auth-middleware-response"));

vi.mock("next-auth", () => ({
  default: vi.fn(() => ({ auth: authMiddleware })),
}));

const { default: proxyMiddleware } = await import("@/proxy");

// proxy.ts's inferred return type includes `undefined` (the shape any
// Next.js middleware may return to mean "continue"), but every path this
// file exercises returns an actual Response — assert that non-null once
// here rather than at every call site.
async function proxy(req: NextRequest, event: NextFetchEvent): Promise<Response> {
  const res = await proxyMiddleware(req, event);
  if (!res) throw new Error("Expected proxy() to return a Response.");
  return res;
}

function makeRequest(path: string, opts: { method?: string; origin?: string } = {}): NextRequest {
  const headers = new Headers();
  if (opts.origin) headers.set("origin", opts.origin);
  return new NextRequest(`http://localhost:3000${path}`, { method: opts.method ?? "GET", headers });
}

const fakeEvent = {} as NextFetchEvent;

describe("proxy", () => {
  beforeEach(() => {
    authMiddleware.mockClear();
  });

  it("delegates non-API paths to the NextAuth middleware", async () => {
    const req = makeRequest("/dashboard");
    await proxy(req, fakeEvent);
    expect(authMiddleware).toHaveBeenCalledWith(req, fakeEvent);
  });

  it("does not run CORS logic on non-API paths", async () => {
    const req = makeRequest("/dashboard", { origin: "https://evil.example.com" });
    const res = await proxy(req, fakeEvent);
    expect(res).toBeInstanceOf(Response);
    expect(authMiddleware).toHaveBeenCalled();
  });

  it("rejects an API request from a disallowed origin with 403, without calling the auth middleware", async () => {
    const req = makeRequest("/api/tasks", { origin: "https://evil.example.com" });
    const res = await proxy(req, fakeEvent);
    expect(res.status).toBe(403);
    expect(authMiddleware).not.toHaveBeenCalled();
  });

  it("responds to an OPTIONS preflight from an allowed origin with the CORS headers", async () => {
    const req = makeRequest("/api/tasks", { method: "OPTIONS", origin: "http://localhost:3000" });
    const res = await proxy(req, fakeEvent);
    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("http://localhost:3000");
    expect(res.headers.get("Access-Control-Allow-Methods")).toContain("POST");
  });

  it("responds to an OPTIONS preflight with no Origin header without setting CORS headers", async () => {
    const req = makeRequest("/api/tasks", { method: "OPTIONS" });
    const res = await proxy(req, fakeEvent);
    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBeNull();
  });

  it("sets CORS headers on a normal API request from an allowed origin", async () => {
    const req = makeRequest("/api/tasks", { origin: "http://localhost:3000" });
    const res = await proxy(req, fakeEvent);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("http://localhost:3000");
    expect(res.headers.get("Access-Control-Allow-Credentials")).toBe("true");
    expect(res.headers.get("Vary")).toBe("Origin");
  });

  it("passes an API request with no Origin header through without CORS headers or a 403", async () => {
    const req = makeRequest("/api/tasks");
    const res = await proxy(req, fakeEvent);
    expect(res.status).not.toBe(403);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBeNull();
  });
});

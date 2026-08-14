import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const { mockGet, mockPost } = vi.hoisted(() => ({
  mockGet: vi.fn(async () => new Response("ok-get")),
  mockPost: vi.fn(async () => new Response("ok-post")),
}));

vi.mock("@/auth", () => ({
  handlers: { GET: mockGet, POST: mockPost },
}));

import { GET, POST } from "./route";

function req(method: "GET" | "POST", ip: string): NextRequest {
  return new NextRequest("http://localhost/api/auth/session", {
    method,
    headers: { "x-forwarded-for": ip },
  });
}

describe("app/api/auth/[...nextauth] rate limiting", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("delegates GET to the NextAuth handler under the read limit", async () => {
    const res = await GET(req("GET", "1.1.1.1"));
    expect(mockGet).toHaveBeenCalledTimes(1);
    expect(await res.text()).toBe("ok-get");
  });

  it("delegates POST to the NextAuth handler under the write limit", async () => {
    const res = await POST(req("POST", "2.2.2.2"));
    expect(mockPost).toHaveBeenCalledTimes(1);
    expect(await res.text()).toBe("ok-post");
  });

  it("blocks GET with 429 past 60 requests/minute from the same IP, without calling the handler", async () => {
    const ip = "3.3.3.3";
    for (let i = 0; i < 60; i++) await GET(req("GET", ip));
    expect(mockGet).toHaveBeenCalledTimes(60);

    const blocked = await GET(req("GET", ip));
    expect(blocked.status).toBe(429);
    expect(mockGet).toHaveBeenCalledTimes(60);
  });

  it("blocks POST with 429 past 30 requests/minute from the same IP, without calling the handler", async () => {
    const ip = "4.4.4.4";
    for (let i = 0; i < 30; i++) await POST(req("POST", ip));
    expect(mockPost).toHaveBeenCalledTimes(30);

    const blocked = await POST(req("POST", ip));
    expect(blocked.status).toBe(429);
    expect(mockPost).toHaveBeenCalledTimes(30);
  });

  it("keeps GET and POST quotas independent for the same IP", async () => {
    const ip = "5.5.5.5";
    for (let i = 0; i < 30; i++) await POST(req("POST", ip));
    const stillOk = await GET(req("GET", ip));
    expect(stillOk.status).not.toBe(429);
  });
});

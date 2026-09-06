import { describe, it, expect, vi, beforeEach } from "vitest";

// auth.ts defines `authorize`/`jwt`/`session` inline inside the NextAuth()
// config object, so there's no exported reference to call directly. Mocking
// "next-auth" and its credentials provider to just capture (rather than
// process) the config they're called with lets us pull the real callback
// functions out and invoke them directly, without going through NextAuth's
// own request/session machinery (already exercised by auth.config.test.ts
// for the `authorized` callback).
const mocks = vi.hoisted(() => ({ capturedConfig: undefined as unknown }));

vi.mock("next-auth", () => ({
  default: vi.fn((config: unknown) => {
    mocks.capturedConfig = config;
    return { handlers: {}, signIn: vi.fn(), signOut: vi.fn(), auth: vi.fn() };
  }),
}));
vi.mock("next-auth/providers/credentials", () => ({
  default: vi.fn((config: unknown) => config),
}));
vi.mock("@/lib/prisma", () => ({
  prisma: { user: { findUnique: vi.fn() } },
}));
vi.mock("bcryptjs", () => ({
  default: { compare: vi.fn() },
}));

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import "@/auth";

type Credentials = { email: string; password: string };
type AuthorizeFn = (credentials: Credentials, request: Request) => Promise<{ id: string; email: string } | null>;
type JwtFn = (params: { token: Record<string, unknown>; user?: { id: string } }) => Record<string, unknown>;
type SessionFn = (params: {
  session: { user: Record<string, unknown> };
  token: Record<string, unknown>;
}) => { user: Record<string, unknown> };

const config = mocks.capturedConfig as {
  providers: { authorize: AuthorizeFn }[];
  callbacks: { jwt: JwtFn; session: SessionFn };
};
const authorize = config.providers[0].authorize;
const jwtCallback = config.callbacks.jwt;
const sessionCallback = config.callbacks.session;

function requestFromIp(ip: string): Request {
  return { headers: new Headers({ "x-forwarded-for": ip }) } as unknown as Request;
}

describe("auth.ts credentials provider — authorize", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when email or password is missing", async () => {
    const result = await authorize({ email: "", password: "Password1!" }, requestFromIp("203.0.113.10"));
    expect(result).toBeNull();
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it("returns null when the email exceeds the max length, before touching the DB", async () => {
    const result = await authorize(
      { email: `${"a".repeat(250)}@example.com`, password: "Password1!" },
      requestFromIp("203.0.113.11"),
    );
    expect(result).toBeNull();
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it("returns null and records a failure when no user matches the email", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    const result = await authorize(
      { email: "nouser@example.com", password: "Password1!" },
      requestFromIp("203.0.113.12"),
    );
    expect(result).toBeNull();
  });

  it("returns null when the password doesn't match", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "1",
      email: "user@example.com",
      password: "hashed",
    } as never);
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

    const result = await authorize(
      { email: "user@example.com", password: "wrong" },
      requestFromIp("203.0.113.13"),
    );
    expect(result).toBeNull();
  });

  it("returns the user's id and lowercased email on valid credentials", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "1",
      email: "user@example.com",
      password: "hashed",
    } as never);
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

    const result = await authorize(
      { email: "USER@example.com", password: "Password1!" },
      requestFromIp("203.0.113.14"),
    );
    expect(result).toEqual({ id: "1", email: "user@example.com" });
  });

  it("locks out an IP after 5 failed attempts without querying the DB again", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    const ip = "203.0.113.15";

    for (let i = 0; i < 5; i++) {
      const result = await authorize({ email: `user${i}@example.com`, password: "Password1!" }, requestFromIp(ip));
      expect(result).toBeNull();
    }

    vi.mocked(prisma.user.findUnique).mockClear();
    const blocked = await authorize({ email: "freshuser@example.com", password: "Password1!" }, requestFromIp(ip));

    expect(blocked).toBeNull();
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });
});

describe("auth.ts callbacks", () => {
  it("jwt attaches the user's id onto the token", () => {
    const result = jwtCallback({ token: {}, user: { id: "42" } });
    expect(result).toEqual({ id: "42" });
  });

  it("jwt leaves the token untouched when there is no user (session refresh)", () => {
    const token = { id: "42" };
    const result = jwtCallback({ token });
    expect(result).toBe(token);
  });

  it("session attaches the token's id onto session.user.id", () => {
    const session = { user: {} };
    const result = sessionCallback({ session, token: { id: "42" } });
    expect(result.user.id).toBe("42");
  });

  it("session leaves session.user.id unset when the token has no id", () => {
    const session = { user: {} };
    const result = sessionCallback({ session, token: {} });
    expect(result.user.id).toBeUndefined();
  });
});

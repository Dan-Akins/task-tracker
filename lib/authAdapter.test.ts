import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: vi.fn() },
    session: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";
import { authAdapter } from "./authAdapter";

const user = {
  id: "user-1",
  email: "person@example.com",
  emailVerified: null,
  name: "Person",
  image: null,
  password: "hashed",
};

describe("authAdapter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getUser", () => {
    it("returns the adapter user shape when found", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(user as never);
      const result = await authAdapter.getUser!("user-1");
      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: "user-1" } });
      expect(result).toEqual({
        id: "user-1",
        email: "person@example.com",
        emailVerified: null,
        name: "Person",
        image: null,
      });
    });

    it("returns null when not found", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      const result = await authAdapter.getUser!("missing");
      expect(result).toBeNull();
    });
  });

  describe("getUserByEmail", () => {
    it("looks up by email and maps the user", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(user as never);
      const result = await authAdapter.getUserByEmail!("person@example.com");
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: "person@example.com" },
      });
      expect(result?.id).toBe("user-1");
    });

    it("returns null when no user has that email", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      const result = await authAdapter.getUserByEmail!("nobody@example.com");
      expect(result).toBeNull();
    });
  });

  describe("createSession", () => {
    it("delegates to prisma.session.create", async () => {
      const session = { sessionToken: "tok", userId: "user-1", expires: new Date() };
      vi.mocked(prisma.session.create).mockResolvedValue(session as never);
      const result = await authAdapter.createSession!(session);
      expect(prisma.session.create).toHaveBeenCalledWith({ data: session });
      expect(result).toBe(session);
    });
  });

  describe("getSessionAndUser", () => {
    it("returns null when no session is found", async () => {
      vi.mocked(prisma.session.findUnique).mockResolvedValue(null);
      const result = await authAdapter.getSessionAndUser!("tok");
      expect(result).toBeNull();
    });

    it("returns null when the session has expired", async () => {
      vi.mocked(prisma.session.findUnique).mockResolvedValue({
        sessionToken: "tok",
        userId: "user-1",
        expires: new Date(Date.now() - 1000),
        user,
      } as never);
      const result = await authAdapter.getSessionAndUser!("tok");
      expect(result).toBeNull();
    });

    it("returns the session and mapped user when valid", async () => {
      const expires = new Date(Date.now() + 1000 * 60);
      vi.mocked(prisma.session.findUnique).mockResolvedValue({
        sessionToken: "tok",
        userId: "user-1",
        expires,
        user,
      } as never);
      const result = await authAdapter.getSessionAndUser!("tok");
      expect(result).toEqual({
        session: { sessionToken: "tok", userId: "user-1", expires },
        user: {
          id: "user-1",
          email: "person@example.com",
          emailVerified: null,
          name: "Person",
          image: null,
        },
      });
    });
  });

  describe("updateSession", () => {
    it("passes through an explicit expires value", async () => {
      const expires = new Date("2026-06-01");
      vi.mocked(prisma.session.update).mockResolvedValue({} as never);
      await authAdapter.updateSession!({ sessionToken: "tok", expires });
      expect(prisma.session.update).toHaveBeenCalledWith({
        where: { sessionToken: "tok" },
        data: { expires },
      });
    });

    it("defaults expires to 30 days out when omitted", async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
      vi.mocked(prisma.session.update).mockResolvedValue({} as never);

      await authAdapter.updateSession!({ sessionToken: "tok" });

      expect(prisma.session.update).toHaveBeenCalledWith({
        where: { sessionToken: "tok" },
        data: { expires: new Date("2026-01-31T00:00:00Z") },
      });
      vi.useRealTimers();
    });
  });

  describe("deleteSession", () => {
    it("deletes the session by token", async () => {
      vi.mocked(prisma.session.delete).mockResolvedValue({} as never);
      await authAdapter.deleteSession!("tok");
      expect(prisma.session.delete).toHaveBeenCalledWith({ where: { sessionToken: "tok" } });
    });

    it("swallows errors from a missing session", async () => {
      vi.mocked(prisma.session.delete).mockRejectedValue(new Error("not found"));
      await expect(authAdapter.deleteSession!("missing")).resolves.toBeUndefined();
    });
  });
});

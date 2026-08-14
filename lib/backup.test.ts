import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findMany: vi.fn() },
    task: { findMany: vi.fn() },
    session: { findMany: vi.fn() },
  },
}));

import { prisma } from "@/lib/prisma";
import { exportDatabase } from "./backup";

describe("exportDatabase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns every table's rows verbatim, including password hashes", async () => {
    const user = { id: "u1", email: "a@example.com", password: "bcrypt-hash-not-plaintext" };
    const task = { id: 1, title: "Buy milk", userId: "u1" };
    const session = { id: "s1", sessionToken: "tok", userId: "u1" };

    vi.mocked(prisma.user.findMany).mockResolvedValue([user] as never);
    vi.mocked(prisma.task.findMany).mockResolvedValue([task] as never);
    vi.mocked(prisma.session.findMany).mockResolvedValue([session] as never);

    const result = await exportDatabase();

    expect(result.users).toEqual([user]);
    expect(result.users[0]).toHaveProperty("password", "bcrypt-hash-not-plaintext");
    expect(result.tasks).toEqual([task]);
    expect(result.sessions).toEqual([session]);
  });

  it("reports accurate counts alongside the data", async () => {
    vi.mocked(prisma.user.findMany).mockResolvedValue([{}, {}] as never);
    vi.mocked(prisma.task.findMany).mockResolvedValue([{}, {}, {}] as never);
    vi.mocked(prisma.session.findMany).mockResolvedValue([] as never);

    const result = await exportDatabase();

    expect(result.counts).toEqual({ users: 2, tasks: 3, sessions: 0 });
  });

  it("returns empty arrays and zero counts for an empty database", async () => {
    vi.mocked(prisma.user.findMany).mockResolvedValue([] as never);
    vi.mocked(prisma.task.findMany).mockResolvedValue([] as never);
    vi.mocked(prisma.session.findMany).mockResolvedValue([] as never);

    const result = await exportDatabase();

    expect(result).toMatchObject({
      counts: { users: 0, tasks: 0, sessions: 0 },
      users: [],
      tasks: [],
      sessions: [],
    });
  });

  it("stamps exportedAt with a valid ISO timestamp", async () => {
    vi.mocked(prisma.user.findMany).mockResolvedValue([] as never);
    vi.mocked(prisma.task.findMany).mockResolvedValue([] as never);
    vi.mocked(prisma.session.findMany).mockResolvedValue([] as never);

    const before = Date.now();
    const result = await exportDatabase();
    const after = Date.now();

    const stamped = new Date(result.exportedAt).getTime();
    expect(stamped).toBeGreaterThanOrEqual(before);
    expect(stamped).toBeLessThanOrEqual(after);
  });
});

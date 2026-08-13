import { afterAll, afterEach, describe, expect, it, vi } from "vitest";

// Real CRUD path: no mocked Prisma client here. `@/lib/prisma` is swapped for
// a PrismaClient backed by an in-memory PGlite (WASM Postgres) instance with
// the project's actual migrations applied — see test/pglite-test-db.ts.
vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/prisma", async () => {
  const { getTestDb } = await import("../test/pglite-test-db");
  const { prisma } = await getTestDb();
  return { prisma };
});

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/app/generated/prisma/client";
import { createTask, deleteTask, cycleStatus } from "./actions";
import { teardownTestDb } from "../test/pglite-test-db";

function mockSession(userId: string | null) {
  if (userId === null) {
    vi.mocked(auth).mockResolvedValue(null);
  } else {
    vi.mocked(auth).mockResolvedValue({ user: { id: userId } } as never);
  }
}

function formData(fields: Record<string, string>) {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) fd.set(key, value);
  return fd;
}

let userCounter = 0;
async function createUser() {
  userCounter += 1;
  return prisma.user.create({
    data: { email: `user-${userCounter}@example.com`, password: "hashed-password" },
  });
}

describe("app/actions (integration, real database)", () => {
  afterEach(async () => {
    vi.clearAllMocks();
    await prisma.task.deleteMany();
    await prisma.session.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await teardownTestDb();
  });

  describe("createTask", () => {
    it("persists a task scoped to the authenticated user", async () => {
      const user = await createUser();
      mockSession(user.id);

      const result = await createTask(formData({ title: "Buy milk", priority: "high" }));

      expect(result).toBeUndefined();
      const tasks = await prisma.task.findMany({ where: { userId: user.id } });
      expect(tasks).toHaveLength(1);
      expect(tasks[0]).toMatchObject({
        title: "Buy milk",
        priority: "high",
        status: "todo",
        userId: user.id,
      });
    });

    it("returns an error and persists nothing when the title is missing", async () => {
      const user = await createUser();
      mockSession(user.id);

      const result = await createTask(formData({ title: "   " }));

      expect(result).toEqual({ error: "Title is required." });
      expect(await prisma.task.count()).toBe(0);
    });

    it("returns an error and persists nothing for an invalid priority", async () => {
      const user = await createUser();
      mockSession(user.id);

      const result = await createTask(formData({ title: "Ship it", priority: "urgent" }));

      expect(result).toEqual({ error: "Invalid priority." });
      expect(await prisma.task.count()).toBe(0);
    });

    it("throws and persists nothing when there is no authenticated user", async () => {
      mockSession(null);

      await expect(createTask(formData({ title: "Buy milk" }))).rejects.toThrow("Unauthorized");
      expect(await prisma.task.count()).toBe(0);
    });
  });

  describe("reading the task list", () => {
    it("returns only the requesting user's tasks, most recently created first", async () => {
      const owner = await createUser();
      const other = await createUser();

      await prisma.task.create({
        data: { title: "Older", userId: owner.id, createdAt: new Date("2026-01-01T00:00:00Z") },
      });
      await prisma.task.create({
        data: { title: "Newer", userId: owner.id, createdAt: new Date("2026-02-01T00:00:00Z") },
      });
      await prisma.task.create({ data: { title: "Someone else's task", userId: other.id } });

      const tasks = await prisma.task.findMany({
        where: { userId: owner.id },
        orderBy: { createdAt: "desc" },
      });

      expect(tasks.map((t) => t.title)).toEqual(["Newer", "Older"]);
    });

    it("returns an empty list for a user with no tasks", async () => {
      const user = await createUser();
      const tasks = await prisma.task.findMany({ where: { userId: user.id } });
      expect(tasks).toEqual([]);
    });
  });

  describe("cycleStatus (updating a task's status)", () => {
    it("advances the status and persists the change", async () => {
      const user = await createUser();
      const task = await prisma.task.create({
        data: { title: "Ship it", userId: user.id, status: "todo" },
      });
      mockSession(user.id);

      await cycleStatus(task.id, "todo");

      const updated = await prisma.task.findUniqueOrThrow({ where: { id: task.id } });
      expect(updated.status).toBe("in_progress");
    });

    it("throws and leaves the status unchanged when there is no authenticated user", async () => {
      const user = await createUser();
      const task = await prisma.task.create({
        data: { title: "Ship it", userId: user.id, status: "todo" },
      });
      mockSession(null);

      await expect(cycleStatus(task.id, "todo")).rejects.toThrow("Unauthorized");

      const unchanged = await prisma.task.findUniqueOrThrow({ where: { id: task.id } });
      expect(unchanged.status).toBe("todo");
    });

    it("rejects updating another user's task and leaves it unchanged", async () => {
      const owner = await createUser();
      const attacker = await createUser();
      const task = await prisma.task.create({
        data: { title: "Private", userId: owner.id, status: "todo" },
      });
      mockSession(attacker.id);

      const attempt = cycleStatus(task.id, "todo");
      await expect(attempt).rejects.toBeInstanceOf(Prisma.PrismaClientKnownRequestError);
      await expect(attempt).rejects.toMatchObject({ code: "P2025" });

      const unchanged = await prisma.task.findUniqueOrThrow({ where: { id: task.id } });
      expect(unchanged.status).toBe("todo");
    });

    it("rejects a status value outside the enum and leaves the task unchanged", async () => {
      const user = await createUser();
      const task = await prisma.task.create({
        data: { title: "Ship it", userId: user.id, status: "todo" },
      });
      mockSession(user.id);

      // Bypasses the TypeScript union on purpose: a server action is reachable
      // over the network with arbitrary arguments regardless of caller-side types.
      await expect(cycleStatus(task.id, "archived" as never)).rejects.toThrow("Invalid status.");

      const unchanged = await prisma.task.findUniqueOrThrow({ where: { id: task.id } });
      expect(unchanged.status).toBe("todo");
    });
  });

  describe("deleteTask", () => {
    it("deletes the task for the owning user", async () => {
      const user = await createUser();
      const task = await prisma.task.create({ data: { title: "Gone soon", userId: user.id } });
      mockSession(user.id);

      await deleteTask(task.id);

      expect(await prisma.task.findUnique({ where: { id: task.id } })).toBeNull();
    });

    it("throws and leaves the task in place when there is no authenticated user", async () => {
      const user = await createUser();
      const task = await prisma.task.create({ data: { title: "Stays", userId: user.id } });
      mockSession(null);

      await expect(deleteTask(task.id)).rejects.toThrow("Unauthorized");
      expect(await prisma.task.findUnique({ where: { id: task.id } })).not.toBeNull();
    });

    it("rejects deleting another user's task and leaves it in place", async () => {
      const owner = await createUser();
      const attacker = await createUser();
      const task = await prisma.task.create({ data: { title: "Private", userId: owner.id } });
      mockSession(attacker.id);

      const attempt = deleteTask(task.id);
      await expect(attempt).rejects.toBeInstanceOf(Prisma.PrismaClientKnownRequestError);
      await expect(attempt).rejects.toMatchObject({ code: "P2025" });

      expect(await prisma.task.findUnique({ where: { id: task.id } })).not.toBeNull();
    });

    it("rejects deleting a task that does not exist", async () => {
      const user = await createUser();
      mockSession(user.id);

      await expect(deleteTask(999999)).rejects.toMatchObject({ code: "P2025" });
    });
  });
});

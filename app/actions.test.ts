import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    task: { create: vi.fn(), delete: vi.fn(), update: vi.fn() },
  },
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createTask, deleteTask, cycleStatus } from "./actions";

function formData(fields: Record<string, string>) {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) fd.set(key, value);
  return fd;
}

describe("app/actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createTask", () => {
    it("throws when there is no authenticated user", async () => {
      vi.mocked(auth).mockResolvedValue(null);
      await expect(createTask(formData({ title: "Buy milk" }))).rejects.toThrow("Unauthorized");
      expect(prisma.task.create).not.toHaveBeenCalled();
    });

    it("returns an error and no-ops when the title is blank", async () => {
      vi.mocked(auth).mockResolvedValue({ user: { id: "u1" } } as never);
      const result = await createTask(formData({ title: "   " }));
      expect(result).toEqual({ error: "Title is required." });
      expect(prisma.task.create).not.toHaveBeenCalled();
      expect(revalidatePath).not.toHaveBeenCalled();
    });

    it("returns an error when the title exceeds the max length", async () => {
      vi.mocked(auth).mockResolvedValue({ user: { id: "u1" } } as never);
      const result = await createTask(formData({ title: "a".repeat(201) }));
      expect(result).toEqual({ error: "Title must be 200 characters or fewer." });
      expect(prisma.task.create).not.toHaveBeenCalled();
    });

    it("returns an error when the description exceeds the max length", async () => {
      vi.mocked(auth).mockResolvedValue({ user: { id: "u1" } } as never);
      const result = await createTask(
        formData({ title: "Buy milk", description: "a".repeat(2001) }),
      );
      expect(result).toEqual({ error: "Description must be 2000 characters or fewer." });
      expect(prisma.task.create).not.toHaveBeenCalled();
    });

    it("strips HTML tags from title and description before saving", async () => {
      vi.mocked(auth).mockResolvedValue({ user: { id: "u1" } } as never);
      vi.mocked(prisma.task.create).mockResolvedValue({} as never);

      await createTask(
        formData({
          title: "<script>alert(1)</script>Buy milk",
          description: "<b>2%</b> milk",
        }),
      );

      expect(prisma.task.create).toHaveBeenCalledWith({
        data: {
          title: "alert(1)Buy milk",
          description: "2% milk",
          priority: "medium",
          dueDate: null,
          category: null,
          userId: "u1",
        },
      });
    });

    it("neutralizes a reported script-injection title, storing it as inert text", async () => {
      vi.mocked(auth).mockResolvedValue({ user: { id: "u1" } } as never);
      vi.mocked(prisma.task.create).mockResolvedValue({} as never);

      await createTask(formData({ title: "<script>alert('hacked')</script>" }));

      expect(prisma.task.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ title: "alert('hacked')" }),
      });
    });

    it("creates a task with trimmed fields and defaults, then revalidates", async () => {
      vi.mocked(auth).mockResolvedValue({ user: { id: "u1" } } as never);
      vi.mocked(prisma.task.create).mockResolvedValue({} as never);

      const result = await createTask(
        formData({
          title: "  Buy milk  ",
          description: "  2%  ",
          category: "  errands  ",
        }),
      );

      expect(result).toBeUndefined();
      expect(prisma.task.create).toHaveBeenCalledWith({
        data: {
          title: "Buy milk",
          description: "2%",
          priority: "medium",
          dueDate: null,
          category: "errands",
          userId: "u1",
        },
      });
      expect(revalidatePath).toHaveBeenCalledWith("/");
    });

    it("parses a provided due date and priority", async () => {
      vi.mocked(auth).mockResolvedValue({ user: { id: "u1" } } as never);
      vi.mocked(prisma.task.create).mockResolvedValue({} as never);

      await createTask(
        formData({ title: "Ship it", priority: "high", dueDate: "2026-03-01" }),
      );

      expect(prisma.task.create).toHaveBeenCalledWith({
        data: {
          title: "Ship it",
          description: null,
          priority: "high",
          dueDate: new Date("2026-03-01"),
          category: null,
          userId: "u1",
        },
      });
    });

    it("returns an error for an invalid priority", async () => {
      vi.mocked(auth).mockResolvedValue({ user: { id: "u1" } } as never);
      const result = await createTask(formData({ title: "Ship it", priority: "urgent" }));
      expect(result).toEqual({ error: "Invalid priority." });
      expect(prisma.task.create).not.toHaveBeenCalled();
    });

    it("returns an error for an invalid due date", async () => {
      vi.mocked(auth).mockResolvedValue({ user: { id: "u1" } } as never);
      const result = await createTask(formData({ title: "Ship it", dueDate: "not-a-date" }));
      expect(result).toEqual({ error: "Invalid due date." });
      expect(prisma.task.create).not.toHaveBeenCalled();
    });
  });

  describe("deleteTask", () => {
    it("throws when there is no authenticated user", async () => {
      vi.mocked(auth).mockResolvedValue(null);
      await expect(deleteTask(1)).rejects.toThrow("Unauthorized");
      expect(prisma.task.delete).not.toHaveBeenCalled();
    });

    it("deletes the task scoped to the current user and revalidates", async () => {
      vi.mocked(auth).mockResolvedValue({ user: { id: "u1" } } as never);
      vi.mocked(prisma.task.delete).mockResolvedValue({} as never);

      await deleteTask(42);

      expect(prisma.task.delete).toHaveBeenCalledWith({ where: { id: 42, userId: "u1" } });
      expect(revalidatePath).toHaveBeenCalledWith("/");
    });
  });

  describe("cycleStatus", () => {
    it("throws when there is no authenticated user", async () => {
      vi.mocked(auth).mockResolvedValue(null);
      await expect(cycleStatus(1, "todo")).rejects.toThrow("Unauthorized");
      expect(prisma.task.update).not.toHaveBeenCalled();
    });

    it.each([
      ["todo", "in_progress"],
      ["in_progress", "done"],
      ["done", "todo"],
    ] as const)("cycles %s to %s", async (current, expected) => {
      vi.mocked(auth).mockResolvedValue({ user: { id: "u1" } } as never);
      vi.mocked(prisma.task.update).mockResolvedValue({} as never);

      await cycleStatus(7, current);

      expect(prisma.task.update).toHaveBeenCalledWith({
        where: { id: 7, userId: "u1" },
        data: { status: expected },
      });
      expect(revalidatePath).toHaveBeenCalledWith("/");
    });
  });
});

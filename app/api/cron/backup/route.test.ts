import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

const { mockPut, mockExportDatabase } = vi.hoisted(() => ({
  mockPut: vi.fn(),
  mockExportDatabase: vi.fn(),
}));

vi.mock("@vercel/blob", () => ({ put: mockPut }));
vi.mock("@/lib/backup", () => ({ exportDatabase: mockExportDatabase }));

import { GET } from "./route";

function req(headers: Record<string, string> = {}): NextRequest {
  return new NextRequest("http://localhost/api/cron/backup", { headers });
}

const SAMPLE_BACKUP = {
  exportedAt: "2026-08-14T06:00:00.000Z",
  counts: { users: 2, tasks: 5, sessions: 1 },
  users: [{ id: "u1" }],
  tasks: [{ id: 1 }],
  sessions: [{ id: "s1" }],
};

describe("GET /api/cron/backup", () => {
  const ORIGINAL_SECRET = process.env.CRON_SECRET;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CRON_SECRET = "test-cron-secret";
    mockExportDatabase.mockResolvedValue(SAMPLE_BACKUP);
    mockPut.mockResolvedValue({ pathname: "backups/task-tracker-backup-2026-08-14-abc123.json" });
  });

  afterEach(() => {
    process.env.CRON_SECRET = ORIGINAL_SECRET;
  });

  it("rejects a request with no Authorization header", async () => {
    const res = await GET(req());
    expect(res.status).toBe(401);
    expect(mockExportDatabase).not.toHaveBeenCalled();
    expect(mockPut).not.toHaveBeenCalled();
  });

  it("rejects a request with the wrong secret", async () => {
    const res = await GET(req({ authorization: "Bearer wrong-secret" }));
    expect(res.status).toBe(401);
    expect(mockPut).not.toHaveBeenCalled();
  });

  it("rejects every request when CRON_SECRET is not configured", async () => {
    delete process.env.CRON_SECRET;
    const res = await GET(req({ authorization: "Bearer undefined" }));
    expect(res.status).toBe(401);
  });

  it("exports and uploads to Blob as a private, non-guessable path when authorized", async () => {
    const res = await GET(req({ authorization: "Bearer test-cron-secret" }));

    expect(mockExportDatabase).toHaveBeenCalledTimes(1);
    expect(mockPut).toHaveBeenCalledWith(
      "backups/task-tracker-backup-2026-08-14.json",
      JSON.stringify(SAMPLE_BACKUP),
      expect.objectContaining({ access: "private", addRandomSuffix: true }),
    );

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({
      success: true,
      pathname: "backups/task-tracker-backup-2026-08-14-abc123.json",
      counts: SAMPLE_BACKUP.counts,
    });
  });

  it("never echoes the exported data (users/tasks/sessions) back in the response", async () => {
    const res = await GET(req({ authorization: "Bearer test-cron-secret" }));
    const json = await res.json();
    expect(json).not.toHaveProperty("users");
    expect(json).not.toHaveProperty("tasks");
    expect(json).not.toHaveProperty("sessions");
  });
});

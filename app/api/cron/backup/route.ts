import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { exportDatabase } from "@/lib/backup";

// Vercel Cron sends `Authorization: Bearer ${CRON_SECRET}` on every invocation
// of a scheduled route. Without this check, the backup endpoint's URL would
// be a public, unauthenticated way to trigger (and read the response of) a
// full database export.
function isAuthorizedCronRequest(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!isAuthorizedCronRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const backup = await exportDatabase();
  const dateStamp = backup.exportedAt.slice(0, 10);

  // access: "private" — this export includes password hashes, so it must
  // only be reachable with a signed URL or an authenticated Blob API call,
  // never a publicly guessable/listable link.
  const blob = await put(`backups/task-tracker-backup-${dateStamp}.json`, JSON.stringify(backup), {
    access: "private",
    addRandomSuffix: true,
    contentType: "application/json",
  });

  return NextResponse.json({
    success: true,
    pathname: blob.pathname,
    counts: backup.counts,
  });
}

// Standalone backup script for manual runs or a local scheduler (e.g. Windows
// Task Scheduler — there's no cron on Windows). Writes to ./backups locally,
// separate from the Vercel Cron route (app/api/cron/backup/route.ts), which
// uploads to Vercel Blob for production instead of writing to serverless
// local disk (which doesn't persist between invocations).
//
// Usage:
//   npm run backup                    # loads .env.local
//   npm run backup -- .env.production.local

import fs from "node:fs";
import path from "node:path";
import { config } from "dotenv";

// Static imports are hoisted above this file's own code by the ES module
// spec, so lib/prisma (which reads process.env.DATABASE_URL at import time)
// must be loaded dynamically, after config() has actually run.
const envFile = process.argv[2] ?? ".env.local";
config({ path: envFile });

async function main() {
  const { exportDatabase } = await import("@/lib/backup");
  const { prisma } = await import("@/lib/prisma");

  const backup = await exportDatabase();
  const dateStamp = backup.exportedAt.slice(0, 10);

  const outDir = path.resolve(process.cwd(), "backups");
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `task-tracker-backup-${dateStamp}.json`);
  fs.writeFileSync(outPath, JSON.stringify(backup, null, 2), "utf8");

  console.log(`Backup written to ${outPath}`);
  console.log(
    `Users: ${backup.counts.users}, Tasks: ${backup.counts.tasks}, Sessions: ${backup.counts.sessions}`,
  );

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Backup failed:", err);
  process.exitCode = 1;
});

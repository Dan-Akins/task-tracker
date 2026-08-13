import fs from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/app/generated/prisma/client";

const MIGRATIONS_DIR = path.resolve(__dirname, "../prisma/migrations");

// Prisma's migration engine can't drive PGlite directly (it isn't a real TCP
// server), so we replay the same migration.sql files it would apply, in
// order, straight into the embedded engine.
function readMigrationSql(): string {
  return fs
    .readdirSync(MIGRATIONS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()
    .map((dir) => fs.readFileSync(path.join(MIGRATIONS_DIR, dir, "migration.sql"), "utf8"))
    .join("\n");
}

export type TestDb = {
  prisma: PrismaClient;
  teardown: () => Promise<void>;
};

async function createTestDb(): Promise<TestDb> {
  const pglite = new PGlite();
  await pglite.waitReady;
  await pglite.exec(readMigrationSql());

  // PGlite has no native TCP listener, so front it with a real Postgres wire
  // socket and talk to it with the same @prisma/adapter-pg driver the app uses.
  const socket = new PGLiteSocketServer({
    db: pglite,
    host: "127.0.0.1",
    port: 0,
    maxConnections: 10,
  });
  await socket.start();

  const adapter = new PrismaPg({
    connectionString: `postgres://postgres:postgres@${socket.getServerConn()}/postgres`,
  });
  const prisma = new PrismaClient({ adapter });

  return {
    prisma,
    teardown: async () => {
      await prisma.$disconnect();
      await socket.stop();
      await pglite.close();
    },
  };
}

let dbPromise: Promise<TestDb> | null = null;

export function getTestDb(): Promise<TestDb> {
  if (!dbPromise) dbPromise = createTestDb();
  return dbPromise;
}

export async function teardownTestDb(): Promise<void> {
  if (!dbPromise) return;
  const promise = dbPromise;
  dbPromise = null;
  const db = await promise;
  await db.teardown();
}

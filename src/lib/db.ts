import fs from "fs";
import path from "path";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// Walk up to the first existing ancestor, then create each missing segment
// downward. Avoids relying on { recursive: true } which fails on some runtimes.
function mkdirpSync(dir: string): void {
  if (fs.existsSync(dir)) return;
  const parent = path.dirname(dir);
  if (parent !== dir) mkdirpSync(parent);
  try {
    fs.mkdirSync(dir);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "EEXIST") throw err;
  }
}

function createClient(): PrismaClient {
  const raw = process.env.DATABASE_URL ?? `file:${path.join(process.cwd(), "dev.db")}`;
  // Resolve to an absolute path so the adapter never sees a relative URL.
  const filePath = path.isAbsolute(raw)
    ? raw
    : path.resolve(
        process.cwd(),
        raw.startsWith("file:") ? raw.slice(5) : raw
      );
  mkdirpSync(path.dirname(filePath));
  const url = `file:${filePath}`;
  const adapter = new PrismaBetterSqlite3({ url });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

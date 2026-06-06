import fs from "fs";
import path from "path";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createClient(): PrismaClient {
  const raw = process.env.DATABASE_URL ?? `file:${path.join(process.cwd(), "dev.db")}`;
  // Resolve to an absolute file path so the adapter never sees a relative path.
  const filePath = path.isAbsolute(raw)
    ? raw
    : path.resolve(
        process.cwd(),
        raw.startsWith("file:") ? raw.slice(5) : raw
      );
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const url = `file:${filePath}`;
  const adapter = new PrismaBetterSqlite3({ url });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

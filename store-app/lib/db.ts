import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __cityWalletPrisma: PrismaClient | undefined;
}

export const db =
  global.__cityWalletPrisma ??
  new PrismaClient({
    adapter: new PrismaLibSql({
      url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
    }),
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.__cityWalletPrisma = db;
}

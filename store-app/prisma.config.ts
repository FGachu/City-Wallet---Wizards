import "dotenv/config";
import { defineConfig } from "prisma/config";

/** Same default as `lib/db.ts` so Prisma CLI works without a `.env` file. */
const databaseUrl =
  process.env.DATABASE_URL?.trim() || "file:./prisma/dev.db";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: databaseUrl,
  },
});

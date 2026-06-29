// Prisma 7 configuration: datasource URL goes here (not in schema.prisma).
// The PrismaClient at runtime uses a driver adapter (see src/lib/db.ts).
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
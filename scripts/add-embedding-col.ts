import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

async function main() {
  const adapter = new PrismaLibSql({
    url: process.env.DATABASE_URL!,
    authToken: process.env.TURSO_TOKEN!,
  });
  const p = new PrismaClient({ adapter });
  try {
    await p.$executeRawUnsafe("ALTER TABLE Product ADD COLUMN embedding TEXT");
    console.log("✓ embedding column added");
  } catch (e) {
    console.log("note:", (e as Error).message);
  }
  await p.$disconnect();
}

main().catch((e) => {
  console.error("ERR:", e.message);
  process.exit(1);
});
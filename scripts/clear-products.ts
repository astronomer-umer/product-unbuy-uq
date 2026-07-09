import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

async function main() {
  const adapter = new PrismaLibSql({
    url: process.env.DATABASE_URL!,
    authToken: process.env.TURSO_TOKEN!,
  });
  const p = new PrismaClient({ adapter });

  const before = await p.product.count();
  await p.productImage.deleteMany({});
  await p.product.deleteMany({});
  const after = await p.product.count();

  console.log(`✓ cleared ${before} fabricated products; ${after} remain`);
  console.log("(Shoe Monkey PK seller record preserved)");

  await p.$disconnect();
}

main().catch((e) => {
  console.error("ERR:", e.message);
  process.exit(1);
});
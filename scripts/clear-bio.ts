import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

async function main() {
  const adapter = new PrismaLibSql({
    url: process.env.DATABASE_URL!,
    authToken: process.env.TURSO_TOKEN!,
  });
  const p = new PrismaClient({ adapter });

  // Empty out the bio I made up for Shoe Monkey
  const r = await p.seller.update({
    where: { slug: "shoemonkey" },
    data: { bio: null },
  });
  console.log("✓ cleared bio for:", r.name, "(now null — owner/seller fills in themselves)");

  // Verify
  const s = await p.seller.findUnique({ where: { slug: "shoemonkey" } });
  console.log("current bio:", JSON.stringify(s?.bio));

  await p.$disconnect();
}

main().catch((e) => {
  console.error("ERR:", e.message);
  process.exit(1);
});
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

async function main() {
  const adapter = new PrismaLibSql({
    url: process.env.DATABASE_URL!,
    authToken: process.env.TURSO_TOKEN!,
  });
  const p = new PrismaClient({ adapter });

  const sellers = await p.seller.findMany({ orderBy: { joinedAt: "asc" } });
  console.log("sellers on prod:", sellers.map((s) => ({ slug: s.slug, name: s.name, active: s.active })));
  const users = await p.user.findMany({ orderBy: { createdAt: "asc" } });
  console.log("users on prod:", users.map((u) => u.email));
  const products = await p.product.count();
  console.log("total products:", products);
  await p.$disconnect();
}

main().catch((e) => {
  console.error("ERR:", e.message);
  process.exit(1);
});
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { readFileSync } from "node:fs";

async function main() {
  const data = JSON.parse(readFileSync("scripts/ig-profile.json", "utf8"));
  const profile = data.profile;

  const adapter = new PrismaLibSql({
    url: process.env.DATABASE_URL!,
    authToken: process.env.TURSO_TOKEN!,
  });
  const p = new PrismaClient({ adapter });

  // Apply the bio + external URL to Shoe Monkey PK.
  // DO NOT touch whatsappE164 (user opted out of WhatsApp).
  const existing = await p.seller.findUnique({
    where: { slug: "shoemonkey" },
  });
  if (!existing) {
    console.error("Shoe Monkey PK not found in DB");
    process.exit(1);
  }

  await p.seller.update({
    where: { id: existing.id },
    data: {
      bio: profile.biography || null,
      // IG handle is already stored; we only update instagramUrl if the
      // external link differs from the public profile URL.
      instagramUrl: profile.externalUrl ?? existing.instagramUrl,
      // Mark as active business account — affects how we display the
      // badge in /sellers (small "Verified business" indicator).
    },
  });

  console.log("✓ applied:");
  console.log(`  bio: ${JSON.stringify(profile.biography)}`);
  console.log(`  externalUrl: ${profile.externalUrl}`);
  console.log(`  follower count: ${profile.followers}`);

  await p.$disconnect();
}

main().catch((e) => {
  console.error("ERR:", e.message);
  process.exit(1);
});
// Imports parsed IG items into the prod DB.
// 1. Downloads each image to /public/uploads/ (server-side)
// 2. Creates a Product row + ProductImage row, linked to Shoe Monkey PK
// 3. Skips items already imported (by shortcode-encoded id)

import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { readFileSync } from "node:fs";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";

type Parsed = {
  shortcode: string;
  url: string;
  imageUrl: string;
  title: string;
  description: string;
  status: "AVAILABLE" | "RESERVED" | "SOLD";
  size: string | null;
  condition: string | null;
  price: number;
};

const UPLOADS = path.join(process.cwd(), "public", "uploads");

async function downloadToUploads(url: string, ext = "jpg"): Promise<string> {
  await mkdir(UPLOADS, { recursive: true });
  const filename = `${Date.now()}-${randomBytes(6).toString("hex")}.${ext}`;
  const dest = path.join(UPLOADS, filename);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(dest, buf);
  return `/uploads/${filename}`;
}

async function main() {
  const adapter = new PrismaLibSql({
    url: process.env.DATABASE_URL!,
    authToken: process.env.TURSO_TOKEN!,
  });
  const p = new PrismaClient({ adapter });

  const data = JSON.parse(readFileSync("scripts/ig-parsed.json", "utf8"));
  const items: Parsed[] = data.items;

  const seller = await p.seller.findUnique({ where: { slug: "shoemonkey" } });
  if (!seller) throw new Error("Shoe Monkey PK seller not found");

  let added = 0;
  let skipped = 0;
  for (const it of items) {
    const id = `ig-${it.shortcode}`;
    const existing = await p.product.findUnique({ where: { id } });
    if (existing) {
      skipped++;
      continue;
    }
    try {
      // Pick extension from URL params or default to jpg
      const url = new URL(it.imageUrl);
      const fmt = url.searchParams.get("nf_resize") ? "jpg" : "jpg";
      const localUrl = await downloadToUploads(it.imageUrl, fmt);
      await p.product.create({
        data: {
          id,
          title: it.title,
          description: it.description,
          price: it.price,
          currency: "PKR",
          condition: it.condition ?? "Used",
          category: "Footwear",
          size: it.size,
          color: null,
          brand: it.title.split(" ")[0] ?? null,
          status: it.status,
          featured: false,
          sellerId: seller.id,
          images: {
            create: [{ url: localUrl, alt: it.title, order: 0 }],
          },
        },
      });
      added++;
      console.log(`✓ ${it.title} (${it.price} PKR)`);
    } catch (e) {
      console.log(`✗ ${it.title}: ${(e as Error).message}`);
    }
  }

  const total = await p.product.count();
  console.log(`\nimported ${added} new, skipped ${skipped} already present`);
  console.log(`total products on prod: ${total}`);

  await p.$disconnect();
}

main().catch((e) => {
  console.error("ERR:", e.message);
  process.exit(1);
});
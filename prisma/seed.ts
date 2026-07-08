import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import bcrypt from "bcryptjs";

const url = process.env.DATABASE_URL ?? "file:./dev.db";
const authToken = process.env.TURSO_TOKEN;
const adapter = new PrismaLibSql(authToken ? { url, authToken } : { url });
const prisma = new PrismaClient({ adapter });

type SeedImage = string;
type SeedProduct = {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  condition: string;
  category: string;
  size?: string;
  color?: string;
  brand?: string;
  images: SeedImage[];
  tags: string[];
  status: string;
  createdAt: string;
  featured: boolean;
};

import products from "../src/data/catalog.json";

const OWNER_EMAIL = "owner@unbuy.local";
const OWNER_PASSWORD = "unbuy-owner-dev";

async function main() {
  const ownerHash = await bcrypt.hash(OWNER_PASSWORD, 12);
  const owner = await prisma.user.upsert({
    where: { email: OWNER_EMAIL },
    update: {},
    create: {
      email: OWNER_EMAIL,
      name: "Unbuy Owner",
      password: ownerHash,
    },
  });
  console.log(`✓ owner: ${owner.email}`);

  const sellerHash = await bcrypt.hash("shoemonkey-dev", 12);
  const shoemonkeyUser = await prisma.user.upsert({
    where: { email: "shoemonkey@unbuy.local" },
    update: {},
    create: {
      email: "shoemonkey@unbuy.local",
      name: "Shoe Monkey PK",
      password: sellerHash,
    },
  });

  const shoemonkey = await prisma.seller.upsert({
    where: { slug: "shoemonkey" },
    update: {},
    create: {
      slug: "shoemonkey",
      name: "Shoe Monkey PK",
      handle: "shoemonkey.pk2",
      bio: "Preloved kicks, picked and priced. Pakistan's most honest used-shoe shelf.",
      category: "Sneakers",
      whatsappE164: "923001234567",
      instagramUrl: "https://www.instagram.com/shoemonkey.pk2/",
      featured: true,
      ownerId: shoemonkeyUser.id,
    },
  });
  console.log(`✓ seller: ${shoemonkey.name} (@${shoemonkey.handle})`);

  await prisma.productImage.deleteMany({});
  await prisma.product.deleteMany({});

  const sellerBySlug = new Map<string, string>([
    ["shoemonkey-pk", shoemonkey.id],
  ]);

  let count = 0;
  for (const p of (products as { products: SeedProduct[] }).products) {
    const sellerId = sellerBySlug.get(p.sellerId);
    if (!sellerId) {
      console.warn(`! skipping ${p.id}: unknown seller ${p.sellerId}`);
      continue;
    }
    await prisma.product.create({
      data: {
        id: p.id,
        title: p.title,
        description: p.description,
        price: p.price,
        currency: p.currency,
        condition: p.condition,
        category: p.category,
        size: p.size ?? null,
        color: p.color ?? null,
        brand: p.brand ?? null,
        status: p.status === "available" ? "AVAILABLE" : "SOLD",
        featured: p.featured,
        createdAt: new Date(p.createdAt),
        sellerId,
        images: {
          create: p.images.map((url, i) => ({
            url,
            alt: p.title,
            order: i,
          })),
        },
      },
    });
    count++;
  }
  console.log(`✓ seeded ${count} products`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
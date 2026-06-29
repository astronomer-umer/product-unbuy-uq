import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const adapter = new PrismaLibSql({ url: process.env.DATABASE_URL ?? "file:./dev.db" });
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

import catalog from "../src/data/catalog.json";
import bcrypt from "bcryptjs";

const OWNER_EMAIL = "owner@unbuy.local";
const OWNER_PASSWORD = "unbuy-owner-dev"; // change in real env

async function main() {
  const hashed = await bcrypt.hash(OWNER_PASSWORD, 10);
  const owner = await prisma.user.upsert({
    where: { email: OWNER_EMAIL },
    update: {},
    create: {
      email: OWNER_EMAIL,
      name: "Unbuy Owner",
      password: hashed,
    },
  });
  console.log(`✓ owner: ${owner.email} (password: ${OWNER_PASSWORD})`);

  // Wipe existing products to make seed idempotent
  await prisma.productImage.deleteMany({});
  await prisma.product.deleteMany({});

  for (const p of catalog.products as SeedProduct[]) {
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
        ownerId: owner.id,
        images: {
          create: p.images.map((url, i) => ({
            url,
            alt: p.title,
            order: i,
          })),
        },
      },
    });
  }
  console.log(`✓ seeded ${catalog.products.length} products`);

  // Also seed a "seller" account so your friend can log in too
  const sellerEmail = "shoemonkey@unbuy.local";
  const sellerPassword = "shoemonkey-dev";
  const sellerHash = await bcrypt.hash(sellerPassword, 10);
  await prisma.user.upsert({
    where: { email: sellerEmail },
    update: {},
    create: {
      email: sellerEmail,
      name: "Shoe Monkey PK",
      password: sellerHash,
    },
  });
  console.log(`✓ seller: ${sellerEmail} (password: ${sellerPassword})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
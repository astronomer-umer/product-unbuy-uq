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
  // --- Users ---
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

  // --- Sellers ---
  const seller1Hash = await bcrypt.hash("shoemonkey-dev", 12);
  const shoemonkeyUser = await prisma.user.upsert({
    where: { email: "shoemonkey@unbuy.local" },
    update: {},
    create: {
      email: "shoemonkey@unbuy.local",
      name: "Shoe Monkey PK",
      password: seller1Hash,
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

  const seller2Hash = await bcrypt.hash("secondhand-dev", 12);
  const secondUser = await prisma.user.upsert({
    where: { email: "secondhand@unbuy.local" },
    update: {},
    create: {
      email: "secondhand@unbuy.local",
      name: "Secondhand Studio",
      password: seller2Hash,
    },
  });

  const secondhand = await prisma.seller.upsert({
    where: { slug: "secondhand-studio" },
    update: {},
    create: {
      slug: "secondhand-studio",
      name: "Secondhand Studio",
      handle: "secondhand.studio",
      bio: "Vintage tees, denim, and the occasional oddity. Lahore.",
      category: "Vintage Clothing",
      whatsappE164: "923009876543",
      instagramUrl: "https://www.instagram.com/secondhand.studio/",
      featured: false,
      ownerId: secondUser.id,
    },
  });
  console.log(`✓ seller: ${secondhand.name} (@${secondhand.handle})`);

  // --- Products ---
  await prisma.productImage.deleteMany({});
  await prisma.product.deleteMany({});

  // Group products by seller slug. catalog.json used sellerId like "shoemonkey-pk";
  // map those to the new Seller.id.
  const sellerBySlug = new Map([
    ["shoemonkey-pk", shoemonkey.id],
    ["secondhand", secondhand.id],
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

  // Add a few secondhand items so the second seller has stock
  const moreItems: SeedProduct[] = [
    {
      id: "ss-001",
      sellerId: "secondhand",
      title: "Levi's 501 — Light wash, W32 L32",
      description: "Genuine vintage. Faded perfectly. No rips, just stories.",
      price: 3800,
      currency: "PKR",
      condition: "Excellent",
      category: "Denim",
      size: "W32 L32",
      color: "Light Wash",
      brand: "Levi's",
      images: [
        "https://images.unsplash.com/photo-1542272604-787c3835535d?w=900",
      ],
      tags: ["denim", "levis", "vintage"],
      status: "available",
      createdAt: "2026-06-20T10:00:00Z",
      featured: true,
    },
    {
      id: "ss-002",
      sellerId: "secondhand",
      title: "Stussy World Tour Tee — Black, M",
      description: "Original 2019 drop. Worn a handful of times. Soft hand.",
      price: 5200,
      currency: "PKR",
      condition: "Like New",
      category: "Tees",
      size: "M",
      color: "Black",
      brand: "Stussy",
      images: [
        "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=900",
      ],
      tags: ["tees", "stussy", "streetwear"],
      status: "available",
      createdAt: "2026-06-18T10:00:00Z",
      featured: false,
    },
    {
      id: "ss-003",
      sellerId: "secondhand",
      title: "Carhartt Detroit Jacket — Brown, L",
      description: "Heavy duck canvas. The patina is unreal.",
      price: 9500,
      currency: "PKR",
      condition: "Excellent",
      category: "Jackets",
      size: "L",
      color: "Brown",
      brand: "Carhartt",
      images: [
        "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=900",
      ],
      tags: ["jackets", "carhartt", "workwear"],
      status: "available",
      createdAt: "2026-06-22T10:00:00Z",
      featured: true,
    },
  ];

  for (const p of moreItems) {
    const sellerId = sellerBySlug.get(p.sellerId)!;
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
        status: "AVAILABLE",
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
  console.log(`✓ seeded ${count - moreItems.length} + ${moreItems.length} = ${count} total products`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
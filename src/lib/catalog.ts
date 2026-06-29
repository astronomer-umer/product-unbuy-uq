import { prisma } from "@/lib/db";
import { seller } from "@/lib/seller";

export type ProductStatus = "AVAILABLE" | "RESERVED" | "SOLD";

export type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  condition: string;
  category: string;
  size?: string | null;
  color?: string | null;
  brand?: string | null;
  status: ProductStatus;
  featured: boolean;
  createdAt: Date;
  images: { id: string; url: string; alt: string | null; order: number }[];
};

type ProductWithImages = Awaited<ReturnType<typeof prisma.product.findUnique>> & {
  images: { id: string; url: string; alt: string | null; order: number }[];
};

function rowToProduct(row: ProductWithImages | null): Product | null {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    price: row.price,
    currency: row.currency,
    condition: row.condition,
    category: row.category,
    size: row.size,
    color: row.color,
    brand: row.brand,
    status: row.status as ProductStatus,
    featured: row.featured,
    createdAt: row.createdAt,
    images: [...row.images]
      .sort((a, b) => a.order - b.order)
      .map((i) => ({ id: i.id, url: i.url, alt: i.alt, order: i.order })),
  };
}

export async function getProducts(): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    include: { images: true },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((r) => rowToProduct(r as ProductWithImages)!).filter(Boolean);
}

export async function getProduct(id: string): Promise<Product | null> {
  const row = await prisma.product.findUnique({
    where: { id },
    include: { images: true },
  });
  return rowToProduct(row as ProductWithImages | null);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    where: { featured: true, status: "AVAILABLE" },
    include: { images: true },
    orderBy: { createdAt: "desc" },
    take: 8,
  });
  return rows.map((r) => rowToProduct(r as ProductWithImages)!).filter(Boolean);
}

export function formatPrice(value: number, currency = "PKR"): string {
  return `${currency} ${value.toLocaleString("en-PK")}`;
}

export function getSeller() {
  return seller;
}

export function whatsappLink(message: string): string {
  return `https://wa.me/${seller.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export function instagramDmLink(message: string): string {
  return `https://ig.me/${seller.igUsername}?text=${encodeURIComponent(message)}`;
}
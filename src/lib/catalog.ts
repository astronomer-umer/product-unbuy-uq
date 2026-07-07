import { prisma } from "@/lib/db";

export type ProductStatus = "AVAILABLE" | "RESERVED" | "SOLD";

export type Seller = {
  id: string;
  slug: string;
  name: string;
  handle: string | null;
  bio: string | null;
  category: string;
  whatsappE164: string;
  instagramUrl: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  featured: boolean;
  active: boolean;
  joinedAt: Date;
};

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
  sellerId: string;
  images: { id: string; url: string; alt: string | null; order: number }[];
};

export type ProductWithSeller = Product & { seller: Seller };

// ---------- helpers ----------

type SellerRow = NonNullable<Awaited<ReturnType<typeof prisma.seller.findFirst>>>;
type ProductRow = NonNullable<Awaited<ReturnType<typeof prisma.product.findFirst>>> & {
  images?: { id: string; url: string; alt: string | null; order: number }[];
};

function rowToSeller(row: SellerRow | null | undefined): Seller | null {
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    handle: row.handle,
    bio: row.bio,
    category: row.category,
    whatsappE164: row.whatsappE164,
    instagramUrl: row.instagramUrl,
    logoUrl: row.logoUrl,
    bannerUrl: row.bannerUrl,
    featured: row.featured,
    active: row.active,
    joinedAt: row.joinedAt,
  };
}

function rowToProduct(row: ProductRow | null | undefined): Product | null {
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
    sellerId: row.sellerId,
    images: [...(row.images ?? [])]
      .sort((a, b) => a.order - b.order)
      .map((i) => ({ id: i.id, url: i.url, alt: i.alt, order: i.order })),
  };
}

// ---------- sellers ----------

export async function getAllSellers(): Promise<Seller[]> {
  const rows = await prisma.seller.findMany({ orderBy: { joinedAt: "asc" } });
  return rows.map(rowToSeller).filter((s): s is Seller => s !== null);
}

export async function getActiveSellers(): Promise<Seller[]> {
  const rows = await prisma.seller.findMany({
    where: { active: true },
    orderBy: { joinedAt: "asc" },
  });
  return rows.map(rowToSeller).filter((s): s is Seller => s !== null);
}

export async function getSellerBySlug(slug: string): Promise<Seller | null> {
  const row = await prisma.seller.findUnique({ where: { slug } });
  return rowToSeller(row);
}

export async function getSeller(id: string): Promise<Seller | null> {
  const row = await prisma.seller.findUnique({ where: { id } });
  return rowToSeller(row);
}

// ---------- products ----------

export async function getProducts(opts: { sellerId?: string } = {}): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    where: opts.sellerId ? { sellerId: opts.sellerId } : undefined,
    include: { images: true },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(rowToProduct).filter((p): p is Product => p !== null);
}

export async function getProduct(id: string): Promise<Product | null> {
  const row = await prisma.product.findUnique({
    where: { id },
    include: { images: true },
  });
  return rowToProduct(row);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    where: { featured: true, status: "AVAILABLE" },
    include: { images: true },
    orderBy: { createdAt: "desc" },
    take: 8,
  });
  return rows.map(rowToProduct).filter((p): p is Product => p !== null);
}

export async function getFilterFacets() {
  const rows = await prisma.product.findMany({
    select: { brand: true, size: true, condition: true, category: true },
  });
  const uniq = <T,>(arr: (T | null)[]) =>
    Array.from(new Set(arr.filter((x): x is T => x !== null && x !== ""))).sort();
  return {
    brands: uniq(rows.map((r) => r.brand)),
    sizes: uniq(rows.map((r) => r.size)),
    conditions: uniq(rows.map((r) => r.condition)),
    categories: uniq(rows.map((r) => r.category)),
  };
}

export type SearchParams = {
  q?: string;
  seller?: string;
  brand?: string | string[];
  size?: string | string[];
  condition?: string | string[];
  status?: string;
};

function asArray(v: string | string[] | undefined): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

export async function searchProducts(
  params: SearchParams,
): Promise<ProductWithSeller[]> {
  const q = (params.q ?? "").trim();
  const brands = asArray(params.brand);
  const sizes = asArray(params.size);
  const conditions = asArray(params.condition);

  // Resolve seller slug → id if provided
  let sellerId: string | undefined;
  if (params.seller) {
    const s = await prisma.seller.findUnique({ where: { slug: params.seller } });
    sellerId = s?.id;
    if (!sellerId) return [];
  }

  const rows = await prisma.product.findMany({
    where: {
      AND: [
        sellerId ? { sellerId } : {},
        brands.length > 0 ? { brand: { in: brands } } : {},
        sizes.length > 0 ? { size: { in: sizes } } : {},
        conditions.length > 0 ? { condition: { in: conditions } } : {},
        params.status === "AVAILABLE" || params.status === "SOLD" || params.status === "RESERVED"
          ? { status: params.status }
          : {},
        q
          ? {
              OR: [
                { title: { contains: q } },
                { description: { contains: q } },
                { brand: { contains: q } },
                { category: { contains: q } },
              ],
            }
          : {},
      ],
    },
    include: { images: true, seller: true },
    orderBy: { createdAt: "desc" },
  });

  return rows
    .map((r) => {
      const p = rowToProduct(r);
      const s = rowToSeller(r.seller);
      if (!p || !s) return null;
      return { ...p, seller: s };
    })
    .filter((x): x is ProductWithSeller => x !== null);
}

// ---------- formatting ----------

export function formatPrice(value: number, currency = "PKR"): string {
  return `${currency} ${value.toLocaleString("en-PK")}`;
}

export function whatsappLink(number: string, message: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function instagramDmLink(handle: string, message: string): string {
  const clean = handle.replace(/^@/, "");
  return `https://ig.me/${clean}?text=${encodeURIComponent(message)}`;
}
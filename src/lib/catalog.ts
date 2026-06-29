import catalog from "@/data/catalog.json";

export type ProductStatus = "available" | "reserved" | "sold";

export type Product = {
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
  images: string[];
  tags: string[];
  status: ProductStatus;
  createdAt: string;
  featured: boolean;
};

export type Seller = {
  id: string;
  handle: string;
  name: string;
  bio: string;
  instagram: string;
  joinedAt: string;
};

type Catalog = {
  name: string;
  description: string;
  version: string;
  sellers: Seller[];
  products: Product[];
};

const data = catalog as Catalog;

export function getProducts(): Product[] {
  return data.products;
}

export function getProduct(id: string): Product | undefined {
  return data.products.find((p) => p.id === id);
}

export function getProductsBySeller(sellerId: string): Product[] {
  return data.products.filter((p) => p.sellerId === sellerId);
}

export function getFeaturedProducts(): Product[] {
  return data.products.filter((p) => p.featured && p.status === "available");
}

export function getSeller(id: string): Seller | undefined {
  return data.sellers.find((s) => s.id === id);
}

export function getSellerByHandle(handle: string): Seller | undefined {
  return data.sellers.find((s) => s.handle === handle);
}

export function getAllSellers(): Seller[] {
  return data.sellers;
}

export function formatPrice(value: number, currency = "PKR"): string {
  return `${currency} ${value.toLocaleString("en-PK")}`;
}

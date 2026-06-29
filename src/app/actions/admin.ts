"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { saveUpload } from "@/lib/upload";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session.user.id;
}

const productSchema = z.object({
  title: z.string().min(1).max(160),
  description: z.string().min(1).max(4000),
  price: z.coerce.number().min(0),
  currency: z.string().default("PKR"),
  condition: z.string().min(1),
  category: z.string().min(1).default("Sneakers"),
  size: z.string().optional(),
  color: z.string().optional(),
  brand: z.string().optional(),
  status: z.enum(["AVAILABLE", "RESERVED", "SOLD"]).default("AVAILABLE"),
  featured: z.union([z.literal("on"), z.literal("off"), z.undefined()]).optional(),
});

export type AdminFormState = { error?: string; success?: string } | undefined;

export async function createProduct(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const ownerId = await requireAdmin();

  const parsed = productSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    price: formData.get("price"),
    currency: formData.get("currency") || "PKR",
    condition: formData.get("condition"),
    category: formData.get("category") || "Sneakers",
    size: formData.get("size") || undefined,
    color: formData.get("color") || undefined,
    brand: formData.get("brand") || undefined,
    status: formData.get("status") || "AVAILABLE",
    featured: formData.get("featured") ?? undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const files = formData.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);
  const imageUrls: string[] = [];
  for (const file of files) {
    const r = await saveUpload(file);
    if ("error" in r) return { error: r.error };
    imageUrls.push(r.url);
  }

  await prisma.product.create({
    data: {
      ...parsed.data,
      featured: parsed.data.featured === "on",
      ownerId,
      images: {
        create: imageUrls.map((url, i) => ({ url, alt: parsed.data.title, order: i })),
      },
    },
  });

  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/admin");
  redirect("/admin");
}

export async function updateProduct(
  id: string,
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  await requireAdmin();

  const parsed = productSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    price: formData.get("price"),
    currency: formData.get("currency") || "PKR",
    condition: formData.get("condition"),
    category: formData.get("category") || "Sneakers",
    size: formData.get("size") || undefined,
    color: formData.get("color") || undefined,
    brand: formData.get("brand") || undefined,
    status: formData.get("status") || "AVAILABLE",
    featured: formData.get("featured") ?? undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const files = formData.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);
  const newImageUrls: string[] = [];
  for (const file of files) {
    const r = await saveUpload(file);
    if ("error" in r) return { error: r.error };
    newImageUrls.push(r.url);
  }

  await prisma.$transaction(async (tx) => {
    await tx.product.update({
      where: { id },
      data: {
        ...parsed.data,
        featured: parsed.data.featured === "on",
      },
    });
    if (newImageUrls.length > 0) {
      const existing = await tx.productImage.count({ where: { productId: id } });
      await tx.productImage.createMany({
        data: newImageUrls.map((url, i) => ({
          url,
          alt: parsed.data.title,
          order: existing + i,
          productId: id,
        })),
      });
    }
  });

  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath(`/products/${id}`);
  revalidatePath("/admin");
  redirect("/admin");
}

export async function deleteProduct(id: string): Promise<void> {
  await requireAdmin();
  await prisma.product.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/admin");
  redirect("/admin");
}

export async function markSold(id: string): Promise<void> {
  await requireAdmin();
  await prisma.product.update({ where: { id }, data: { status: "SOLD" } });
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath(`/products/${id}`);
  redirect("/admin");
}

export async function markAvailable(id: string): Promise<void> {
  await requireAdmin();
  await prisma.product.update({ where: { id }, data: { status: "AVAILABLE" } });
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath(`/products/${id}`);
  redirect("/admin");
}
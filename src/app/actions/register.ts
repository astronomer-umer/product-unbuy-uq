"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { signIn } from "@/auth";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/ip";

const registerSchema = z
  .object({
    name: z.string().trim().min(1, "Name required").max(80),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Valid email required")
      .max(160),
    password: z.string().min(8, "Min 8 characters").max(200),
    shopName: z.string().trim().min(1, "Shop name required").max(80),
    slug: z
      .string()
      .trim()
      .min(2)
      .max(60)
      .regex(/^[a-z0-9-]+$/, "Lowercase letters, digits, dashes only"),
    igHandle: z
      .string()
      .trim()
      .max(80)
      .transform((v) => v.replace(/^@/, ""))
      .optional()
      .or(z.literal("")),
    category: z.string().trim().min(1).max(60).default("Sneakers"),
  })
  .refine((v) => !v.igHandle || /^[a-zA-Z0-9._]+$/.test(v.igHandle), {
    message: "Invalid Instagram handle",
    path: ["igHandle"],
  });

export type RegisterState = { error?: string } | undefined;

export async function registerAction(
  _prev: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const ip = await getClientIp();
  const rl = rateLimit(`register:${ip}`, 5, 60 * 60 * 1000);
  if (!rl.ok) {
    return { error: "Too many signups from this network. Try again later." };
  }

  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    shopName: formData.get("shopName"),
    slug: formData.get("slug"),
    igHandle: formData.get("igHandle") || undefined,
    category: formData.get("category") || "Sneakers",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const data = parsed.data;

  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });
  if (existingUser) {
    return { error: "An account with that email already exists" };
  }
  const existingSeller = await prisma.seller.findUnique({
    where: { slug: data.slug },
  });
  if (existingSeller) {
    return {
      error: `That storefront URL is taken. Pick another (e.g. ${data.slug}-pk).`,
    };
  }

  const hashed = await bcrypt.hash(data.password, 12);
  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashed,
      },
    });
    await tx.seller.create({
      data: {
        ownerId: user.id,
        slug: data.slug,
        name: data.shopName,
        handle: data.igHandle || null,
        instagramUrl: data.igHandle
          ? `https://www.instagram.com/${data.igHandle}/`
          : null,
        category: data.category,
        bio: null,
        // No WhatsApp by default — sellers can fill it in /admin/settings.
        whatsappE164: "0",
        active: true,
        featured: false,
      },
    });
  });

  revalidatePath("/");
  revalidatePath("/sellers");
  revalidatePath("/shop");

  // Auto sign-in. redirectTo so the browser lands on the seller
  // dashboard right after sign-up.
  await signIn("credentials", {
    email: data.email,
    password: data.password,
    redirectTo: "/admin",
  });

  // Unreachable — signIn() throws NEXT_REDIRECT internally.
  redirect("/admin");
}
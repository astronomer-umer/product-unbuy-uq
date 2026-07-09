"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

const schema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1).max(80),
  handle: z
    .string()
    .trim()
    .max(80)
    .transform((v) => v.replace(/^@/, ""))
    .optional()
    .or(z.literal("")),
  instagramUrl: z
    .string()
    .trim()
    .url()
    .optional()
    .or(z.literal("")),
  bio: z.string().trim().max(400).optional().or(z.literal("")),
  category: z.string().trim().min(1).max(60),
  whatsappE164: z
    .string()
    .trim()
    .regex(/^[0-9]{10,15}$/, "Use 10–15 digits, no + or spaces")
    .optional()
    .or(z.literal("")),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, digits, and dashes only"),
});

export type SettingsState = { error?: string; success?: string } | undefined;

export async function updateSellerSettingsAction(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?next=/admin/settings");

  const parsed = schema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    handle: formData.get("handle"),
    instagramUrl: formData.get("instagramUrl"),
    bio: formData.get("bio"),
    category: formData.get("category"),
    whatsappE164: formData.get("whatsappE164"),
    slug: formData.get("slug"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  // Authorize: only the owner of this seller can edit it.
  const seller = await prisma.seller.findUnique({
    where: { id: parsed.data.id },
  });
  if (!seller || seller.ownerId !== session.user.id) {
    return { error: "Not authorized" };
  }

  // Slug uniqueness
  if (parsed.data.slug !== seller.slug) {
    const conflict = await prisma.seller.findUnique({
      where: { slug: parsed.data.slug },
    });
    if (conflict) return { error: "That URL slug is taken — pick another" };
  }

  await prisma.seller.update({
    where: { id: seller.id },
    data: {
      name: parsed.data.name,
      handle: parsed.data.handle || null,
      instagramUrl: parsed.data.instagramUrl || null,
      bio: parsed.data.bio || null,
      category: parsed.data.category,
      // Empty string means "no WhatsApp" — store as null-equivalent placeholder.
      whatsappE164: parsed.data.whatsappE164 || "0",
      slug: parsed.data.slug,
    },
  });

  revalidatePath("/");
  revalidatePath("/sellers");
  revalidatePath(`/sellers/${seller.slug}`);
  if (parsed.data.slug !== seller.slug) {
    revalidatePath(`/sellers/${parsed.data.slug}`);
  }
  revalidatePath("/admin");
  revalidatePath("/admin/settings");
  revalidatePath("/messages");
  revalidatePath("/admin/messages");

  return { success: "Saved." };
}
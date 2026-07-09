// Contact actions (auth-gated)
// Lets a signed-in user "request to share contact" — reveals a one-off
// link to the seller's WhatsApp / Instagram. The link itself is computed
// at request time and never appears in any initial HTML rendered to
// unauthenticated visitors.

"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getSellerContact } from "@/lib/contact";

const schema = z.object({
  conversationId: z.string().min(1),
});

export type ContactRevealResult =
  | { ok: true; whatsappUrl: string | null; instagramUrl: string | null }
  | { ok: false; error: string };

export async function revealContactAction(
  conversationId: string,
): Promise<ContactRevealResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "Please sign in to see contact details." };
  }

  const parsed = schema.safeParse({ conversationId });
  if (!parsed.success) return { ok: false, error: "Bad request" };

  // Rate-limit: max 30 reveals per user per hour
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentNotifications = await prisma.notification.count({
    where: {
      userId: session.user.id,
      kind: "message",
      createdAt: { gte: hourAgo },
    },
  });
  if (recentNotifications > 200) {
    return { ok: false, error: "Too many requests — slow down." };
  }

  const contact = await getSellerContact({
    viewerId: session.user.id,
    conversationId: parsed.data.conversationId,
  });

  if (!contact) {
    return { ok: false, error: "Not authorized for this conversation" };
  }

  if (!contact.whatsappUrl && !contact.instagramUrl) {
    return {
      ok: false,
      error: "Seller hasn't added contact details yet.",
    };
  }

  return {
    ok: true,
    whatsappUrl: contact.whatsappUrl,
    instagramUrl: contact.instagramUrl,
  };
}
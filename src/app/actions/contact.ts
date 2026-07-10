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
  conversationId: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-z0-9]+$/i, "Invalid conversation id"),
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
  if (!parsed.success) {
    return { ok: false, error: "Bad request" };
  }

  // NOTE: getSellerContact() already validates that viewerId is a party
  // to the conversation (buyer or seller-owner). It's the only path
  // through which a contact URL is ever returned. Never construct
  // wa.me URLs or instagram URLs anywhere else.

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
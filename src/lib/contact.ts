// Auth-gated contact reveal.
// Returns the WhatsApp / Instagram deeplinks only to authenticated
// participants of the conversation. Anyone without a valid session, or
// anyone who is not a party to the conversation, gets null.
//
// Usage from a server component:
//   const contact = await getSellerContact(opts);

import { prisma } from "@/lib/db";

type ContactOptions = {
  viewerId: string | undefined;
  conversationId: string;
};

type SellerContact = {
  whatsappUrl: string | null;
  instagramUrl: string | null;
};

export async function getSellerContact(
  opts: ContactOptions,
): Promise<SellerContact | null> {
  if (!opts.viewerId) return null;

  const conv = await prisma.conversation.findUnique({
    where: { id: opts.conversationId },
    include: { seller: true },
  });
  if (!conv) return null;

  const isParty =
    conv.buyerId === opts.viewerId || conv.seller.ownerId === opts.viewerId;
  if (!isParty) return null;

  const s = conv.seller;
  return {
    whatsappUrl: s.whatsappE164 && s.whatsappE164 !== "0"
      ? `https://wa.me/${s.whatsappE164}`
      : null,
    instagramUrl: s.handle
      ? `https://ig.me/${s.handle.replace(/^@/, "")}`
      : (s.instagramUrl ?? null),
  };
}
// Conversational logic: find or create a conversation between a buyer and
// a seller about a specific product; send messages; mark read; fetch inbox.
// All callers go through one place so the realtime fan-out stays consistent.

import { prisma } from "@/lib/db";
import { triggerPusher } from "@/lib/pusher";
import { revalidatePath } from "next/cache";

export type InboxItem = {
  conversationId: string;
  productId: string;
  productTitle: string;
  productImage: string | null;
  productPrice: number;
  productCurrency: string;
  otherParty: { id: string; name: string; handle: string | null };
  lastMessage: { body: string; createdAt: Date; fromMe: boolean } | null;
  unreadCount: number;
  updatedAt: Date;
};

export async function findOrCreateConversation(opts: {
  buyerId: string;
  sellerId: string;
  productId: string;
}): Promise<{ id: string }> {
  const existing = await prisma.conversation.findUnique({
    where: {
      buyerId_sellerId_productId: {
        buyerId: opts.buyerId,
        sellerId: opts.sellerId,
        productId: opts.productId,
      },
    },
  });
  if (existing) return existing;
  return prisma.conversation.create({ data: opts });
}

export async function sendMessage(opts: {
  conversationId: string;
  senderId: string;
  body: string;
}): Promise<{ id: string }> {
  const body = opts.body.trim();
  if (!body) throw new Error("Empty message");
  if (body.length > 4000) throw new Error("Message too long");

  const message = await prisma.$transaction(async (tx) => {
    const msg = await tx.message.create({
      data: {
        conversationId: opts.conversationId,
        senderId: opts.senderId,
        body,
      },
    });
    await tx.conversation.update({
      where: { id: opts.conversationId },
      data: { updatedAt: new Date() },
    });
    return msg;
  });

  // Fan-out so the other party gets it instantly.
  const conv = await prisma.conversation.findUnique({
    where: { id: opts.conversationId },
    include: { product: true, buyer: true, seller: true },
  });
  if (conv) {
    const recipientId =
      opts.senderId === conv.buyerId ? conv.seller.ownerId : conv.buyerId;
    await prisma.notification.create({
      data: {
        userId: recipientId,
        kind: "message",
        title:
          opts.senderId === conv.buyerId
            ? `New message from ${conv.buyer.name ?? conv.buyer.email}`
            : `Reply from ${conv.seller.name}`,
        body: body.slice(0, 120),
        link: opts.senderId === conv.buyerId
          ? `/admin/messages?c=${conv.id}`
          : `/messages?c=${conv.id}`,
      },
    });
    await triggerPusher(
      `private-user-${recipientId}`,
      "notification:new",
      { conversationId: conv.id },
    );
    await triggerPusher(`conversation-${conv.id}`, "message:new", {
      id: message.id,
      conversationId: conv.id,
      senderId: opts.senderId,
      body: message.body,
      createdAt: message.createdAt.toISOString(),
    });
  }

  // Touch pages that show this conversation
  revalidatePath("/messages");
  revalidatePath("/admin/messages");

  return message;
}

export async function markConversationRead(opts: {
  conversationId: string;
  viewerId: string;
}) {
  await prisma.message.updateMany({
    where: {
      conversationId: opts.conversationId,
      senderId: { not: opts.viewerId },
      read: false,
    },
    data: { read: true },
  });
  await prisma.notification.updateMany({
    where: { userId: opts.viewerId, link: { contains: opts.conversationId } },
    data: { read: true },
  });
  revalidatePath("/messages");
  revalidatePath("/admin/messages");
  revalidatePath("/", "layout"); // header badge
}

export async function getInboxForBuyer(buyerId: string): Promise<InboxItem[]> {
  const rows = await prisma.conversation.findMany({
    where: { buyerId },
    include: {
      product: { include: { images: { orderBy: { order: "asc" }, take: 1 } } },
      seller: { include: { owner: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
  });
  return rows.map((c) => {
    const last = c.messages[0];
    return {
      conversationId: c.id,
      productId: c.productId,
      productTitle: c.product.title,
      productImage: c.product.images[0]?.url ?? null,
      productPrice: c.product.price,
      productCurrency: c.product.currency,
      otherParty: {
        id: c.seller.id,
        name: c.seller.name,
        handle: c.seller.handle,
      },
      lastMessage: last
        ? {
            body: last.body,
            createdAt: last.createdAt,
            fromMe: last.senderId === buyerId,
          }
        : null,
      unreadCount: 0, // counted per-message below
      updatedAt: c.updatedAt,
    };
  });
}

export async function getInboxForSeller(sellerId: string): Promise<InboxItem[]> {
  const rows = await prisma.conversation.findMany({
    where: { sellerId },
    include: {
      product: { include: { images: { orderBy: { order: "asc" }, take: 1 } } },
      seller: true,
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
  });
  // Fetch buyers separately since the include above won't join them
  const buyerIds = Array.from(new Set(rows.map((r) => r.buyerId)));
  const buyers = await prisma.user.findMany({
    where: { id: { in: buyerIds } },
  });
  const buyerById = new Map(buyers.map((b) => [b.id, b]));

  return rows.map((c) => {
    const last = c.messages[0];
    const buyer = buyerById.get(c.buyerId);
    return {
      conversationId: c.id,
      productId: c.productId,
      productTitle: c.product.title,
      productImage: c.product.images[0]?.url ?? null,
      productPrice: c.product.price,
      productCurrency: c.product.currency,
      otherParty: {
        id: c.buyerId,
        name: buyer?.name ?? buyer?.email ?? "Buyer",
        handle: null,
      },
      lastMessage: last
        ? {
            body: last.body,
            createdAt: last.createdAt,
            fromMe: last.senderId === c.seller.ownerId,
          }
        : null,
      unreadCount: 0,
      updatedAt: c.updatedAt,
    };
  });
}

export async function getInboxWithUnread(
  userId: string,
  role: "buyer" | "seller",
): Promise<InboxItem[]> {
  const base =
    role === "buyer"
      ? await prisma.conversation.findMany({
          where: { buyerId: userId },
          include: {
            product: { include: { images: { orderBy: { order: "asc" }, take: 1 } } },
            seller: true,
            messages: { orderBy: { createdAt: "desc" } },
          },
          orderBy: { updatedAt: "desc" },
        })
      : await prisma.conversation.findMany({
          where: { seller: { ownerId: userId } },
          include: {
            product: { include: { images: { orderBy: { order: "asc" }, take: 1 } } },
            seller: true,
            messages: { orderBy: { createdAt: "desc" } },
          },
          orderBy: { updatedAt: "desc" },
        });

  // For seller role we don't have buyer info on the row; fetch separately.
  const buyerIds = role === "seller"
    ? Array.from(new Set(base.map((c) => c.buyerId)))
    : [];
  const buyers = buyerIds.length > 0
    ? await prisma.user.findMany({ where: { id: { in: buyerIds } } })
    : [];
  const buyerById = new Map(buyers.map((b) => [b.id, b]));

  return base.map((c) => {
    const last = c.messages[0];
    const otherPartyId = role === "buyer" ? c.seller.ownerId : c.buyerId;
    const unread = c.messages.filter(
      (m) => m.senderId !== otherPartyId && !m.read,
    ).length;
    return {
      conversationId: c.id,
      productId: c.productId,
      productTitle: c.product.title,
      productImage: c.product.images[0]?.url ?? null,
      productPrice: c.product.price,
      productCurrency: c.product.currency,
      otherParty:
        role === "buyer"
          ? { id: c.seller.id, name: c.seller.name, handle: c.seller.handle }
          : (() => {
              const b = buyerById.get(c.buyerId);
              return {
                id: c.buyerId,
                name: b?.name ?? b?.email ?? "Buyer",
                handle: null,
              };
            })(),
      lastMessage: last
        ? {
            body: last.body,
            createdAt: last.createdAt,
            fromMe: last.senderId === otherPartyId,
          }
        : null,
      unreadCount: unread,
      updatedAt: c.updatedAt,
    };
  });
}

export async function getConversationForViewer(opts: {
  conversationId: string;
  viewerId: string;
}) {
  const conv = await prisma.conversation.findUnique({
    where: { id: opts.conversationId },
    include: {
      product: { include: { images: { orderBy: { order: "asc" } } } },
      seller: true,
      buyer: true,
      messages: {
        orderBy: { createdAt: "asc" },
        include: { sender: { select: { id: true, name: true, email: true } } },
      },
    },
  });
  if (!conv) return null;
  // Authorize: only buyer, seller, or seller-owner can view.
  const allowed =
    conv.buyerId === opts.viewerId || conv.seller.ownerId === opts.viewerId;
  if (!allowed) return null;
  return conv;
}

export async function getUnreadCountForUser(userId: string): Promise<number> {
  return prisma.notification.count({
    where: { userId, read: false },
  });
}
"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/ip";
import {
  findOrCreateConversation,
  getConversationForViewer,
  markConversationRead,
  sendMessage,
} from "@/lib/messaging";

const startSchema = z.object({
  productId: z.string().min(1),
});

export type StartConvResult = { redirect: string };

export async function startConversation(
  productId: string,
): Promise<StartConvResult> {
  const session = await auth();
  if (!session?.user?.id) {
    // Force buyer to log in first
    redirect(`/login?next=/products/${productId}&intent=message`);
  }

  const parsed = startSchema.safeParse({ productId });
  if (!parsed.success) {
    return { redirect: `/products/${productId}` };
  }

  const product = await prisma.product.findUnique({
    where: { id: parsed.data.productId },
    include: { seller: true },
  });
  if (!product) {
    return { redirect: "/shop" };
  }

  // Sellers can't message themselves
  if (product.seller.ownerId === session.user.id) {
    return { redirect: `/admin/messages` };
  }

  const conv = await findOrCreateConversation({
    buyerId: session.user.id,
    sellerId: product.sellerId,
    productId: product.id,
  });
  return { redirect: `/messages?c=${conv.id}` };
}

const sendSchema = z.object({
  conversationId: z.string().min(1),
  body: z.string().trim().min(1).max(4000),
});

export type SendMessageResult = { ok: true } | { error: string };

export async function sendMessageAction(
  conversationId: string,
  body: string,
): Promise<SendMessageResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not signed in" };

  const ip = await getClientIp();
  const rl = rateLimit(`msg:${ip}:${session.user.id}`, 60, 60 * 1000); // 60/min
  if (!rl.ok) return { error: "Slow down — too many messages" };

  const parsed = sendSchema.safeParse({ conversationId, body });
  if (!parsed.success) return { error: "Message can't be empty" };

  // Authorize: viewer must be participant
  const conv = await getConversationForViewer({
    conversationId: parsed.data.conversationId,
    viewerId: session.user.id,
  });
  if (!conv) return { error: "Conversation not found" };

  await sendMessage({
    conversationId: parsed.data.conversationId,
    senderId: session.user.id,
    body: parsed.data.body,
  });

  return { ok: true };
}

export async function markReadAction(conversationId: string) {
  const session = await auth();
  if (!session?.user?.id) return;
  await markConversationRead({
    conversationId,
    viewerId: session.user.id,
  });
  revalidatePath("/", "layout");
}
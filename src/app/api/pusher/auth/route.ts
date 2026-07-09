// Pusher Channels auth endpoint — required for private channels.
// Verifies the user is signed in before letting them subscribe.

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { pusherServer, pusherConfigured } from "@/lib/pusher";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!pusherConfigured()) {
    return NextResponse.json({ disabled: true }, { status: 503 });
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const socketId = String(formData.get("socket_id") ?? "");
  const channel = String(formData.get("channel_name") ?? "");

  // Only allow private channels scoped to this user
  const expected = `private-user-${session.user.id}`;
  if (channel !== expected && !channel.startsWith(`conversation-`)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const p = pusherServer();
  if (!p) return NextResponse.json({ error: "Misconfigured" }, { status: 500 });

  const authResponse = p.authorizeChannel(socketId, channel);
  return NextResponse.json(authResponse);
}
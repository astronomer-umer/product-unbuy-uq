// Pusher Channels: small wrapper so we can no-op in dev if env vars are missing.
// Real-time fanout for messages and notifications.

import Pusher from "pusher";

let cached: Pusher | null = null;

export function pusherServer(): Pusher | null {
  if (cached) return cached;
  const appId = process.env.PUSHER_APP_ID;
  const key = process.env.PUSHER_KEY;
  const secret = process.env.PUSHER_SECRET;
  const cluster = process.env.PUSHER_CLUSTER;
  if (!appId || !key || !secret || !cluster) return null;
  cached = new Pusher({
    appId,
    key,
    secret,
    cluster,
    useTLS: true,
  });
  return cached;
}

export function pusherConfigured(): boolean {
  return Boolean(
    process.env.PUSHER_APP_ID &&
      process.env.PUSHER_KEY &&
      process.env.PUSHER_SECRET &&
      process.env.PUSHER_CLUSTER,
  );
}

export async function triggerPusher(
  channel: string,
  event: string,
  payload: unknown,
): Promise<void> {
  const p = pusherServer();
  if (!p) return; // no-op in dev
  await p.trigger(channel, event, payload);
}

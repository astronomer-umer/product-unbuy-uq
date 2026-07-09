"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import PusherClient from "pusher-js";

type Options = {
  onMessage?: (msg: {
    id: string;
    conversationId: string;
    senderId: string;
    body: string;
    createdAt: string;
  }) => void;
  onNotification?: (n: { kind: string; conversationId?: string }) => void;
};

// Wires up Pusher Channels to a small useRealtimeNotifications hook.
// Falls back to no-op if NEXT_PUBLIC_PUSHER_KEY is unset (dev / before
// keys are configured). Polling via router.refresh in pages is the
// fallback path so the inbox stays useful even when real-time is off.

export function useRealtimeNotifications(opts: Options = {}) {
  const [ready, setReady] = useState(false);
  const clientRef = useRef<PusherClient | null>(null);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
    if (!key || !cluster) return; // no realtime; pages use polling

    const client = new PusherClient(key, {
      cluster,
      channelAuthorization: { endpoint: "/api/pusher/auth", transport: "ajax" },
    });
    clientRef.current = client;

    const userChannelName = `private-user-${(window as { __userId?: string }).__userId ?? "anon"}`;
    // Note: server's authorizeChannel only allows this user's private channel;
    // the user id is injected via a window var set from the layout server component.
    const userChannel = client.subscribe(userChannelName);
    userChannel.bind("notification:new", (payload: unknown) => {
      opts.onNotification?.(payload as { kind: string; conversationId?: string });
    });

    setReady(true);

    return () => {
      client.disconnect();
      clientRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const subscribeConversation = useCallback(
    (conversationId: string) => {
      const c = clientRef.current;
      if (!c) return () => undefined;
      const channelName = `conversation-${conversationId}`;
      const channel = c.subscribe(channelName);
      const handler = (msg: unknown) =>
        opts.onMessage?.(msg as Parameters<NonNullable<Options["onMessage"]>>[0]);
      channel.bind("message:new", handler);
      return () => {
        channel.unbind("message:new", handler);
        c.unsubscribe(channelName);
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [clientRef.current],
  );

  return { ready, subscribeConversation };
}
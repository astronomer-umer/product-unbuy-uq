"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { sendMessageAction, markReadAction } from "@/app/actions/messages";
import { useRealtimeNotifications } from "@/hooks/use-realtime";

type Msg = {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: string;
  sender: { id: string; name: string | null; email: string | null };
};

type Props = {
  conversationId: string;
  viewerId: string;
  productTitle: string;
  otherPartyName: string;
  initialMessages: Msg[];
};

export function ConversationThread({
  conversationId,
  viewerId,
  productTitle,
  otherPartyName,
  initialMessages,
}: Props) {
  const [messages, setMessages] = useState<Msg[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages.length]);

  useEffect(() => {
    // Mark existing as read when opening
    start(async () => {
      await markReadAction(conversationId);
    });
  }, [conversationId]);

  const { subscribeConversation } = useRealtimeNotifications({
    onMessage: (msg) => {
      if (msg.conversationId !== conversationId) return;
      setMessages((prev) =>
        prev.some((m) => m.id === msg.id) ? prev : [...prev, msg as Msg],
      );
    },
  });

  useEffect(() => {
    return subscribeConversation(conversationId);
  }, [conversationId, subscribeConversation]);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    const body = draft.trim();
    setDraft("");
    setError(null);
    start(async () => {
      const r = await sendMessageAction(conversationId, body);
      if ("error" in r) setError(r.error);
    });
  }

  return (
    <div className="flex h-[calc(100vh-12rem)] flex-col rounded-xl border border-border/60 bg-background">
      <div className="border-b border-border/60 px-5 py-3">
        <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          Re: {productTitle}
        </p>
        <p className="mt-0.5 font-heading text-base tracking-wide uppercase">
          {otherPartyName}
        </p>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 space-y-3 overflow-y-auto px-5 py-4"
        aria-live="polite"
      >
        {messages.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Say hi. Ask about size, condition, shipping, price. The seller sees
            this immediately.
          </p>
        )}
        {messages.map((m) => {
          const mine = m.senderId === viewerId;
          return (
            <div
              key={m.id}
              className={`flex ${mine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  mine
                    ? "bg-cobalt text-background"
                    : "bg-muted text-foreground"
                }`}
              >
                {m.body}
                <div
                  className={`mt-1 font-mono text-[10px] uppercase tracking-wider ${
                    mine ? "text-background/55" : "text-muted-foreground"
                  }`}
                >
                  {new Date(m.createdAt).toLocaleString("en-PK", {
                    hour: "2-digit",
                    minute: "2-digit",
                    day: "2-digit",
                    month: "short",
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <form
        onSubmit={handleSend}
        className="flex items-end gap-2 border-t border-border/60 p-3"
      >
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend(e);
            }
          }}
          rows={1}
          placeholder="Write a message…"
          className="flex-1 resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-ring"
          disabled={pending}
        />
        <button
          type="submit"
          disabled={pending || !draft.trim()}
          className="inline-flex h-9 items-center rounded-lg bg-lime px-4 text-sm font-semibold text-foreground hover:bg-lime/90 transition-colors disabled:opacity-50"
        >
          Send
        </button>
      </form>
      {error && <p className="px-4 pb-2 text-sm text-destructive">{error}</p>}
    </div>
  );
}
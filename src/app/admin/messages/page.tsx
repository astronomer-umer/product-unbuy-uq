import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getConversationForViewer, getInboxWithUnread } from "@/lib/messaging";

type SearchParams = Promise<{ c?: string }>;

export default async function SellerMessagesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const session = await auth();
  if (!session?.user?.id) redirect("/login?next=/admin/messages");

  const seller = await prisma.seller.findUnique({
    where: { ownerId: session.user.id },
  });
  if (!seller) {
    return (
      <div className="rounded-xl border border-dashed border-border p-8 text-center">
        <p className="text-sm text-muted-foreground">
          No seller profile linked to your account yet.{" "}
          <Link href="/register" className="text-lime underline-offset-4 hover:underline">
            Create one
          </Link>
          .
        </p>
      </div>
    );
  }

  const [inbox, openConv] = await Promise.all([
    getInboxWithUnread(session.user.id, "seller"),
    sp.c
      ? getConversationForViewer({ conversationId: sp.c, viewerId: session.user.id })
      : null,
  ]);

  const totalUnread = inbox.reduce((s, i) => s + i.unreadCount, 0);

  return (
    <div>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-lime">
            Buyer messages
          </p>
          <h2 className="mt-1 font-heading text-2xl tracking-wide uppercase">
            Inbox
          </h2>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            {totalUnread > 0
              ? `${totalUnread} unread · ${inbox.length} thread${inbox.length === 1 ? "" : "s"}`
              : `${inbox.length} thread${inbox.length === 1 ? "" : "s"}`}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-2">
          {inbox.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-8 text-center">
              <p className="text-sm text-muted-foreground">
                No buyer messages yet. They&apos;ll appear here when someone hits
                &quot;Message me&quot; on one of your products.
              </p>
              <Link
                href="/admin/products/new"
                className="mt-3 inline-flex h-9 items-center rounded-full bg-lime px-4 text-sm font-semibold text-foreground hover:bg-lime/90"
              >
                Add a product →
              </Link>
            </div>
          ) : (
            inbox.map((c) => {
              const active = sp.c === c.conversationId;
              return (
                <Link
                  key={c.conversationId}
                  href={`/admin/messages?c=${c.conversationId}`}
                  className={`block rounded-xl border px-4 py-3 transition-colors ${
                    active
                      ? "border-lime bg-lime/10"
                      : "border-border/60 hover:border-lime/40 hover:bg-muted/40"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {c.productImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={c.productImage}
                        alt=""
                        className="h-12 w-12 flex-shrink-0 rounded-md object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 flex-shrink-0 rounded-md bg-muted" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="truncate font-heading text-sm tracking-wide uppercase">
                          {c.otherParty.name}
                        </p>
                        {c.unreadCount > 0 && (
                          <span className="rounded-full bg-lime px-2 py-0.5 font-mono text-[10px] font-semibold text-foreground">
                            {c.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        Re: {c.productTitle}
                      </p>
                      {c.lastMessage && (
                        <p className="mt-1 line-clamp-1 text-xs">
                          <span className="text-muted-foreground">
                            {c.lastMessage.fromMe ? "You: " : ""}
                          </span>
                          {c.lastMessage.body}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </aside>

        <div>
          {openConv ? (
            <div>
              <div className="mb-3">
                <Link
                  href="/admin"
                  className="font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← Back to admin
                </Link>
              </div>
              <div className="mb-4 flex items-center gap-3 rounded-xl border border-border/60 bg-background p-3">
                {openConv.product.images[0] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={openConv.product.images[0].url}
                    alt=""
                    className="h-14 w-14 rounded-md object-cover"
                  />
                )}
                <div>
                  <p className="font-heading text-sm tracking-wide uppercase">
                    {openConv.product.title}
                  </p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {openConv.product.currency} {openConv.product.price.toLocaleString("en-PK")}
                  </p>
                </div>
              </div>
              {await (async () => {
                const Thread = (await import("@/components/conversation-thread")).ConversationThread;
                return (
                  <Thread
                    conversationId={openConv.id}
                    viewerId={session.user.id}
                    productTitle={openConv.product.title}
                    otherPartyName={openConv.buyer.name ?? openConv.buyer.email ?? "Buyer"}
                    initialMessages={openConv.messages.map((m) => ({
                      id: m.id,
                      conversationId: m.conversationId,
                      senderId: m.senderId,
                      body: m.body,
                      createdAt: m.createdAt.toISOString(),
                      sender: {
                        id: m.sender.id,
                        name: m.sender.name,
                        email: m.sender.email,
                      },
                    }))}
                  />
                );
              })()}
            </div>
          ) : (
            <div className="flex h-[calc(100vh-12rem)] items-center justify-center rounded-xl border border-dashed border-border">
              <p className="text-sm text-muted-foreground">
                {inbox.length > 0
                  ? "Select a conversation"
                  : "Waiting for your first message"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
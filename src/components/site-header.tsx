import Link from "next/link";
import { auth, signOut } from "@/auth";
import { getActiveSellers, type Seller } from "@/lib/catalog";
import { prisma } from "@/lib/db";
import { SearchTrigger } from "./search-trigger";
import { NotificationBell } from "./notification-bell";

export async function SiteHeader({ sellers = [] }: { sellers?: Seller[] }) {
  const session = await auth();

  let inboxLink: { href: string; label: string; unread: number } | null = null;
  if (session?.user?.id) {
    const sellerLink = await prisma.seller.findUnique({
      where: { ownerId: session.user.id },
      select: { id: true },
    });
    const unread = await prisma.notification.count({
      where: { userId: session.user.id, read: false },
    });
    if (sellerLink) {
      inboxLink = { href: "/admin/messages", label: "Inbox", unread };
    } else {
      inboxLink = { href: "/messages", label: "Messages", unread };
    }
  }

  const isSeller = inboxLink?.href === "/admin/messages";

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/50">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-baseline gap-2 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            aria-label="unbuy home"
          >
            <span className="font-heading text-2xl tracking-wider uppercase">
              unbuy
            </span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground hidden sm:inline">
              preloved
            </span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            <NavLink href="/">Home</NavLink>
            <NavLink href="/shop">Shop</NavLink>
            <NavLink href="/sellers">Sellers</NavLink>
            <NavLink href="/about">About</NavLink>
          </nav>
        </div>

        <div className="flex items-center gap-1">
          <SearchTrigger />
          {session?.user && inboxLink && (
            <NotificationBell
              href={inboxLink.href}
              label={inboxLink.label}
              unread={inboxLink.unread}
            />
          )}
          {session?.user ? (
            <>
              <Link
                href="/admin"
                className="ml-1 inline-flex h-9 items-center rounded-full bg-foreground px-4 text-xs font-semibold text-background hover:bg-foreground/90 transition-colors"
              >
                {isSeller ? "Admin" : "Profile"}
              </Link>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button
                  type="submit"
                  className="inline-flex h-9 items-center rounded-full px-3 font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="ml-1 inline-flex h-9 items-center rounded-full border border-border bg-background px-4 text-xs font-semibold hover:bg-muted transition-colors"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>

      {/* Subnav — sellers, on a hairline, for desktop discoverability */}
      {sellers.length > 0 && (
        <div className="hidden border-t border-border/60 bg-background/40 backdrop-blur md:block">
          <div className="mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto px-6 py-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mr-2">
              Sellers
            </span>
            {sellers.map((s) => (
              <Link
                key={s.id}
                href={`/sellers/${s.slug}`}
                className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-xs text-muted-foreground hover:bg-foreground/5 hover:text-foreground transition-colors"
              >
                {s.name}
                {s.featured && (
                  <span className="h-1.5 w-1.5 rounded-full bg-lime" aria-hidden="true" />
                )}
              </Link>
            ))}
            <Link
              href="/sellers/onboard"
              className="ml-auto whitespace-nowrap rounded-full bg-lime/10 px-3 py-1 text-xs font-semibold text-lime hover:bg-lime hover:text-foreground transition-colors"
            >
              + Apply
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex h-9 items-center rounded-full px-3 text-sm font-semibold text-foreground/70 hover:text-foreground hover:bg-foreground/5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      {children}
    </Link>
  );
}
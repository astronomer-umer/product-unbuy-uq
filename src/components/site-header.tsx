import Link from "next/link";
import { auth, signOut } from "@/auth";
import { getActiveSellers, type Seller } from "@/lib/catalog";

export async function SiteHeader({ sellers = [] }: { sellers?: Seller[] }) {
  const session = await auth();
  const featured = sellers.filter((s) => s.featured);
  const rest = sellers.filter((s) => !s.featured);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/65">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          aria-label="unbuy home"
        >
          <span className="font-heading text-2xl tracking-wider uppercase">
            unbuy
          </span>
          <span className="font-mono text-xs text-muted-foreground hidden sm:inline">
            .preloved
          </span>
        </Link>
        <nav className="flex items-center gap-5 text-sm" aria-label="Main">
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Home
          </Link>
          <Link
            href="/shop"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Shop
          </Link>
          <Link
            href="/sellers"
            className="text-muted-foreground hover:text-foreground transition-colors hidden md:inline"
          >
            Sellers
          </Link>
          <Link
            href="/about"
            className="text-muted-foreground hover:text-foreground transition-colors hidden sm:inline"
          >
            About
          </Link>
          {session?.user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/admin"
                className="font-mono text-xs uppercase tracking-wider text-foreground hover:text-muted-foreground transition-colors"
              >
                Admin
              </Link>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button
                  type="submit"
                  className="font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                >
                  Sign out
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/login"
              className="font-mono text-xs uppercase tracking-wider text-foreground hover:text-muted-foreground transition-colors"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
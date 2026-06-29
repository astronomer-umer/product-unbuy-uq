import Link from "next/link";
import { auth, signOut } from "@/auth";
import { getSeller } from "@/lib/catalog";

export async function SiteHeader() {
  const seller = getSeller();
  const session = await auth();
  const isAdmin = !!session?.user;

  return (
    <header className="border-b">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-heading text-2xl tracking-wider uppercase">unbuy</span>
          <span className="font-mono text-xs text-muted-foreground">.preloved</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
            Browse
          </Link>
          <Link
            href="/shop"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Shop
          </Link>
          <Link
            href="/about"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            About
          </Link>
          {session?.user ? (
            <div className="flex items-center gap-3">
              {isAdmin && (
                <Link
                  href="/admin"
                  className="font-mono text-xs uppercase tracking-wider text-foreground hover:text-muted-foreground transition-colors"
                >
                  Admin
                </Link>
              )}
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
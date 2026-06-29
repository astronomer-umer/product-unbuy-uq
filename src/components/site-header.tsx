import Link from "next/link";
import { getAllSellers } from "@/lib/catalog";
import { auth, signOut } from "@/auth";

export async function SiteHeader() {
  const sellers = getAllSellers();
  const featured = sellers[0];
  const session = await auth();

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
          {featured && (
            <Link
              href={`/sellers/${featured.handle}`}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Sellers
            </Link>
          )}
          <Link
            href="/about"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            About
          </Link>
          {session?.user ? (
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
                Sign out · {session.user.email}
              </button>
            </form>
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
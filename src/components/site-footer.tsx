import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t bg-secondary/40">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-heading text-xl tracking-wider uppercase">
              unbuy
            </span>
            <span className="font-mono text-xs text-muted-foreground">
              .preloved
            </span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            A curated marketplace for preloved goods. Real sellers, real photos,
            no noise.
          </p>
        </div>

        <div>
          <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            Browse
          </h3>
          <ul className="mt-3 space-y-1.5 text-sm">
            <li>
              <Link href="/shop" className="hover:text-foreground transition-colors">
                All listings
              </Link>
            </li>
            <li>
              <Link href="/sellers" className="hover:text-foreground transition-colors">
                Sellers
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-foreground transition-colors">
                About
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            Sellers
          </h3>
          <p className="mt-3 text-sm text-muted-foreground">
            Want a storefront like the ones here?{" "}
            <Link
              href="/sellers/onboard"
              className="text-cobalt underline-offset-4 hover:underline"
            >
              Apply to join
            </Link>
            .
          </p>
        </div>

        <div>
          <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            Legal
          </h3>
          <ul className="mt-3 space-y-1.5 text-sm">
            <li>
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                Privacy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-foreground transition-colors">
                Terms
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-2 px-6 py-4 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <span>© {new Date().getFullYear()} unbuy. Preloved, on purpose.</span>
          <span>Made in Pakistan.</span>
        </div>
      </div>
    </footer>
  );
}
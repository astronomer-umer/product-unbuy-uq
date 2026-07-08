import Link from "next/link";
import { getActiveSellers } from "@/lib/catalog";

export async function SiteFooter() {
  const sellers = await getActiveSellers();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border/60 surface-cobalt">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          {/* Brand block */}
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-heading text-3xl tracking-wider uppercase">
                unbuy
              </span>
              <span className="font-mono text-[10px] uppercase tracking-wider opacity-60">
                preloved
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed opacity-85">
              A curated marketplace for preloved goods. Real sellers, real
              photos, no noise. Buyers tap, sellers reply, things find new
              homes.
            </p>
            <form
              className="mt-6 flex max-w-xs gap-2"
              action="#"
              aria-label="Newsletter"
            >
              <input
                type="email"
                placeholder="you@goodemail.com"
                required
                className="flex-1 rounded-full border border-background/20 bg-background/5 px-4 py-2 text-sm text-background placeholder:text-background/40 focus-visible:outline-2 focus-visible:outline-lime"
              />
              <button
                type="submit"
                className="inline-flex h-9 items-center rounded-full bg-lime px-4 text-sm font-semibold text-foreground hover:bg-lime/90 transition-colors"
              >
                Get drops
              </button>
            </form>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-wider opacity-50">
              Weekly. One email. Unsubscribe anytime.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-lime">
              Shop
            </h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/shop" className="opacity-85 hover:opacity-100 transition-opacity">
                  All listings
                </Link>
              </li>
              <li>
                <Link href="/shop?status=AVAILABLE" className="opacity-85 hover:opacity-100 transition-opacity">
                  Available now
                </Link>
              </li>
              <li>
                <Link href="/sellers" className="opacity-85 hover:opacity-100 transition-opacity">
                  Sellers
                </Link>
              </li>
            </ul>
          </div>

          {/* Sellers */}
          <div>
            <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-lime">
              For sellers
            </h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link
                  href="/sellers/onboard"
                  className="opacity-85 hover:opacity-100 transition-opacity"
                >
                  Apply to join
                </Link>
              </li>
              <li>
                <Link
                  href="/admin"
                  className="opacity-85 hover:opacity-100 transition-opacity"
                >
                  Seller login
                </Link>
              </li>
              {sellers.slice(0, 3).map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/sellers/${s.slug}`}
                    className="opacity-85 hover:opacity-100 transition-opacity"
                  >
                    {s.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Co. */}
          <div>
            <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-lime">
              Co.
            </h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link
                  href="/about"
                  className="opacity-85 hover:opacity-100 transition-opacity"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="opacity-85 hover:opacity-100 transition-opacity"
                >
                  Privacy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="opacity-85 hover:opacity-100 transition-opacity"
                >
                  Terms
                </Link>
              </li>
              <li>
                <a
                  href="mailto:astronomer.umer@gmail.com"
                  className="opacity-85 hover:opacity-100 transition-opacity"
                >
                  astronomer.umer@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-background/20 pt-6 text-xs opacity-60 sm:flex-row sm:items-center">
          <span>© {year} unbuy. Preloved, on purpose.</span>
          <span className="flex items-center gap-3">
            <span>Made in Pakistan</span>
            <span aria-hidden="true">·</span>
            <span>No tracking. No ads.</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
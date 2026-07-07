import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { SellerCard } from "@/components/seller-card";
import {
  getActiveSellers,
  getFeaturedProducts,
  getSeller,
} from "@/lib/catalog";

export default async function HomePage() {
  const [sellers, featured] = await Promise.all([
    getActiveSellers(),
    getFeaturedProducts(),
  ]);

  // Resolve featured products' sellers
  const featuredSellers = new Map<string, ReturnType<typeof getSeller> extends Promise<infer T> ? T : never>();
  const sellersById = new Map(sellers.map((s) => [s.id, s]));

  return (
    <main>
      {/* HERO */}
      <section className="border-b">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-cobalt">
            Preloved · On purpose · Pakistan
          </p>
          <h1 className="mt-6 font-heading text-7xl leading-[0.88] tracking-tight sm:text-9xl">
            <span className="text-foreground">Let&apos;s </span>
            <span className="text-cobalt">Unbuy</span>
            <span className="text-foreground"> What You Buy!</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
            A small, hand-picked marketplace for preloved goods. Real sellers with
            real photos, real prices, and a real reason to skip the new. Built for
            buyers who&apos;d rather buy once, well.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/shop"
              className="inline-flex h-11 items-center rounded-lg bg-cobalt px-5 text-sm font-medium text-white hover:bg-cobalt/90 transition-colors"
            >
              Browse the catalog →
            </Link>
            <Link
              href="/sellers"
              className="inline-flex h-11 items-center rounded-lg border border-border bg-background px-5 text-sm font-medium hover:bg-muted transition-colors"
            >
              Meet the sellers
            </Link>
          </div>
          <div className="mt-10 flex items-center gap-6 font-mono text-xs uppercase tracking-wider text-muted-foreground">
            <span>
              <span className="font-heading text-2xl text-foreground tracking-wide">
                {sellers.length}
              </span>{" "}
              sellers
            </span>
            <span aria-hidden="true">·</span>
            <span>
              <span className="font-heading text-2xl text-foreground tracking-wide">
                {featured.length}
              </span>{" "}
              featured drops
            </span>
            <span aria-hidden="true">·</span>
            <span className="text-lime">Always preloved</span>
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      {featured.length > 0 && (
        <section className="border-b">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-lime">
                  This week
                </p>
                <h2 className="mt-2 font-heading text-4xl tracking-wide uppercase">
                  Featured drops
                </h2>
              </div>
              <Link
                href="/shop"
                className="font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
              >
                All listings →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {featured.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  seller={sellersById.get(product.sellerId)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SELLERS */}
      {sellers.length > 0 && (
        <section>
          <div className="mx-auto max-w-6xl px-6 py-16">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-cobalt">
                  The roster
                </p>
                <h2 className="mt-2 font-heading text-4xl tracking-wide uppercase">
                  Our sellers
                </h2>
              </div>
              <Link
                href="/sellers/onboard"
                className="font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
              >
                Apply to join →
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sellers.map((s) => (
                <SellerCard key={s.id} seller={s} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* MANIFESTO STRIP */}
      <section className="border-t bg-cobalt text-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-lime">
            What unbuy is
          </p>
          <div className="mt-6 grid gap-10 md:grid-cols-3">
            <div>
              <h3 className="font-heading text-2xl tracking-wide uppercase">
                Curation over volume.
              </h3>
              <p className="mt-2 text-sm leading-relaxed opacity-85">
                Every seller is vetted. Every listing is photographed by the
                seller. No dropshippers, no resellers-of-resellers.
              </p>
            </div>
            <div>
              <h3 className="font-heading text-2xl tracking-wide uppercase">
                Direct contact.
              </h3>
              <p className="mt-2 text-sm leading-relaxed opacity-85">
                Tap WhatsApp or Instagram on any item — the chat opens
                pre-filled with the product. No middlemen, no algorithms.
              </p>
            </div>
            <div>
              <h3 className="font-heading text-2xl tracking-wide uppercase">
                On purpose.
              </h3>
              <p className="mt-2 text-sm leading-relaxed opacity-85">
                Buying preloved is a small act against the new. We&apos;re here to
                make it easier — and better-looking — than the alternative.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
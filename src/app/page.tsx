import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { SellerCard } from "@/components/seller-card";
import {
  getActiveSellers,
  getFeaturedProducts,
} from "@/lib/catalog";

export default async function HomePage() {
  const [sellers, featured] = await Promise.all([
    getActiveSellers(),
    getFeaturedProducts(),
  ]);
  const sellersById = new Map(sellers.map((s) => [s.id, s]));

  return (
    <main>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 -z-10 opacity-60">
          <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-lime/30 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-lime/20 blur-3xl" />
        </div>

        <div className="mx-auto max-w-6xl px-6 pt-20 pb-24 sm:pt-28 sm:pb-32">
          <div className="inline-flex items-center gap-2 rounded-full border border-lime/40 bg-lime/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-lime">
            <span className="h-1.5 w-1.5 rounded-full bg-lime" />
            Preloved · Pakistan · Always
          </div>

          <h1 className="mt-6 font-heading text-7xl leading-[0.88] tracking-tight sm:text-9xl">
            <span className="text-foreground">Let&apos;s </span>
            <span className="text-gradient-brand">Unbuy</span>
            <span className="text-foreground"> What You Buy!</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            A small, hand-picked marketplace for preloved goods. Real sellers
            with real photos, real prices, and a real reason to skip the new.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link
              href="/shop"
              className="inline-flex h-11 items-center rounded-full bg-lime px-6 text-sm font-medium text-foreground hover:bg-lime/90 transition-colors shadow-sm shadow-lime/30"
            >
              Browse the catalog →
            </Link>
            <Link
              href="/sellers"
              className="inline-flex h-11 items-center rounded-full border border-border bg-background px-6 text-sm font-medium hover:bg-muted transition-colors"
            >
              Meet the sellers
            </Link>
          </div>

          <dl className="mt-12 flex flex-wrap items-end gap-x-10 gap-y-4">
            <Stat label="sellers" value={String(sellers.length)} />
            <Stat label="featured drops" value={String(featured.length)} />
            <Stat label="always" value="preloved" highlight />
          </dl>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      {featured.length > 0 && (
        <section className="border-b border-border/60">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-lime">
                  This week
                </p>
                <h2 className="mt-2 font-heading text-4xl tracking-wide uppercase sm:text-5xl">
                  Featured drops
                </h2>
              </div>
              <Link
                href="/shop"
                className="hidden font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors sm:inline"
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
          <div className="mx-auto max-w-6xl px-6 py-20">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-lime">
                  The roster
                </p>
                <h2 className="mt-2 font-heading text-4xl tracking-wide uppercase sm:text-5xl">
                  Our sellers
                </h2>
              </div>
              <Link
                href="/sellers/onboard"
                className="hidden font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors sm:inline"
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

      {/* MANIFESTO STRIP — lime background, ink text */}
      <section className="border-y border-foreground/20 bg-lime text-foreground">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-foreground/70">
            What unbuy is
          </p>
          <div className="mt-8 grid gap-10 md:grid-cols-3">
            <Pillar
              title="Curation over volume."
              body="Every seller is vetted. Every listing is photographed by the seller. No dropshippers, no resellers-of-resellers."
            />
            <Pillar
              title="Direct contact."
              body="Tap WhatsApp or Instagram on any item — the chat opens pre-filled with the product. No middlemen, no algorithms."
            />
            <Pillar
              title="On purpose."
              body="Buying preloved is a small act against the new. We make it easier — and better-looking — than the alternative."
            />
          </div>
        </div>
      </section>
    </main>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <dt className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd
        className={`mt-1 font-heading text-4xl tracking-wide ${
          highlight ? "text-gradient-brand" : "text-foreground"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

function Pillar({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h3 className="font-heading text-2xl tracking-wide uppercase">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-foreground/85">{body}</p>
    </div>
  );
}

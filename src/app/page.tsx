import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { getFeaturedProducts, getProducts, getSeller, whatsappLink } from "@/lib/catalog";

export default async function HomePage() {
  const [featured, all] = await Promise.all([getFeaturedProducts(), getProducts()]);
  const s = getSeller();
  const available = all.filter((p) => p.status !== "SOLD");
  const msg = `Hi! I'm interested in your shop. What's available right now?`;

  return (
    <main>
      {/* HERO */}
      <section className="border-b">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
          <div className="flex flex-col items-start gap-10 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Preloved · Curated · Pakistan
              </p>
              <h1 className="mt-4 font-heading text-6xl leading-[0.9] tracking-tight sm:text-8xl">
                Kicks that
                <br />
                <span className="text-accent">already lived.</span>
              </h1>
              <p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground">
                One seller, hand-picked preloved sneakers. New drops weekly.
                Real photos. Real prices. No nonsense.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/shop"
                  className="inline-flex h-10 items-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Shop the catalog →
                </Link>
                <a
                  href={whatsappLink(msg)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 items-center rounded-lg border border-border bg-background px-5 text-sm font-medium hover:bg-muted transition-colors"
                >
                  Chat on WhatsApp
                </a>
              </div>
              <div className="mt-8 flex items-center gap-4 font-mono text-xs uppercase tracking-wider text-muted-foreground">
                <a
                  href={s.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  @{s.igUsername}
                </a>
                <span aria-hidden="true">·</span>
                <span>{available.length} available</span>
              </div>
            </div>

            <div className="hidden w-full max-w-sm lg:block">
              <div className="grid grid-cols-2 gap-3">
                {(all.slice(0, 4)).map((p, i) => (
                  <div
                    key={p.id}
                    className={`overflow-hidden rounded-xl bg-muted ${
                      i % 2 === 0 ? "aspect-[3/4]" : "aspect-square mt-6"
                    }`}
                  >
                    {p.images[0] && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={p.images[0].url}
                        alt={p.title}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED */}
      {featured.length > 0 && (
        <section className="border-b">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <div className="mb-6 flex items-end justify-between">
              <h2 className="font-heading text-3xl tracking-wide uppercase">
                Featured
              </h2>
              <Link
                href="/shop"
                className="font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
              >
                All listings →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ALL */}
      <section>
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="font-heading text-3xl tracking-wide uppercase">
              Everything
            </h2>
            <span className="font-mono text-xs text-muted-foreground">
              {all.length} listings
            </span>
          </div>
          {all.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-12 text-center">
              <p className="text-sm text-muted-foreground">
                Catalog is being updated. Check back soon.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {all.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
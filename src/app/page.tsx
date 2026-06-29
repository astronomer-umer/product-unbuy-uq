import { ProductCard } from "@/components/product-card";
import { getFeaturedProducts, getProducts, getSeller } from "@/lib/catalog";
import Link from "next/link";

export default function HomePage() {
  const featured = getFeaturedProducts();
  const all = getProducts();
  const firstSeller = getSeller(all[0]?.sellerId ?? "");

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12">
      <section className="mb-12 max-w-2xl">
        <h1 className="font-heading text-5xl leading-none tracking-tight sm:text-7xl">
          Preloved, curated.
        </h1>
        <p className="mt-4 text-muted-foreground">
          A small marketplace for pre-loved items — starting with{" "}
          {firstSeller ? (
            <Link
              href={`/sellers/${firstSeller.handle}`}
              className="text-foreground underline-offset-4 hover:underline"
            >
              {firstSeller.name}
            </Link>
          ) : (
            "a few sellers"
          )}
          . More sellers joining soon.
        </p>
      </section>

      {featured.length > 0 && (
        <section className="mb-12">
          <div className="mb-4 flex items-end justify-between">
            <h2 className="font-heading text-2xl tracking-wide uppercase">Featured</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-heading text-2xl tracking-wide uppercase">All items</h2>
          <span className="text-xs text-muted-foreground font-mono">{all.length} listings</span>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {all.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </main>
  );
}

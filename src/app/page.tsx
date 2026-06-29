import { ProductCard } from "@/components/product-card";
import { getFeaturedProducts, getProducts, getSeller } from "@/lib/catalog";

export default async function HomePage() {
  const [featured, all] = await Promise.all([getFeaturedProducts(), getProducts()]);
  const s = getSeller();

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12">
      <section className="mb-12 max-w-2xl">
        <h1 className="font-heading text-5xl leading-none tracking-tight sm:text-7xl">
          Preloved, curated.
        </h1>
        <p className="mt-4 text-muted-foreground">
          The home of{" "}
          <span className="text-foreground">{s.name}</span> — preloved kicks,
          picked and priced. New drops added weekly.
        </p>
        <div className="mt-6 flex gap-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">
          <a href={s.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
            @{s.igUsername}
          </a>
          <span>·</span>
          <a href={`https://wa.me/${s.whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
            WhatsApp
          </a>
        </div>
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
          <span className="font-mono text-xs text-muted-foreground">{all.length} listings</span>
        </div>
        {all.length === 0 ? (
          <p className="text-sm text-muted-foreground">No listings yet — check back soon.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {all.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
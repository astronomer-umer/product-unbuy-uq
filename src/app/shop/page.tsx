import { ProductCard } from "@/components/product-card";
import { getProducts, getSeller, whatsappLink } from "@/lib/catalog";

export default async function ShopPage() {
  const products = await getProducts();
  const s = getSeller();
  const available = products.filter((p) => p.status !== "SOLD");
  const sold = products.filter((p) => p.status === "SOLD");
  const msg = `Hi! I'd like to know more about your shop.`;

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12">
      <div className="mb-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-4xl leading-none tracking-tight sm:text-5xl">
            {s.name}
          </h1>
          <p className="mt-1 font-mono text-sm text-muted-foreground">@{s.handle}</p>
        </div>
        <div className="flex gap-2">
          <a
            href={s.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-7 items-center rounded-md border border-border bg-background px-2.5 text-sm font-medium hover:bg-muted transition-colors"
          >
            Instagram
          </a>
          <a
            href={whatsappLink(msg)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-7 items-center rounded-md border border-border bg-background px-2.5 text-sm font-medium hover:bg-muted transition-colors"
          >
            WhatsApp
          </a>
        </div>
      </div>

      {s.bio && (
        <p className="mb-8 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {s.bio}
        </p>
      )}

      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-heading text-2xl tracking-wide uppercase">Available</h2>
          <span className="font-mono text-xs text-muted-foreground">
            {available.length} items
          </span>
        </div>
        {available.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing available right now.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {available.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {sold.length > 0 && (
        <section className="mt-16">
          <div className="mb-4 flex items-end justify-between">
            <h2 className="font-heading text-2xl tracking-wide uppercase opacity-60">
              Sold
            </h2>
            <span className="font-mono text-xs text-muted-foreground">
              {sold.length} past listings
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {sold.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
import { Suspense } from "react";
import { ProductCard } from "@/components/product-card";
import { ShopFilters } from "@/components/shop-filters";
import {
  getFilterFacets,
  getSeller,
  searchProducts,
  whatsappLink,
} from "@/lib/catalog";

type SearchParams = Promise<{
  q?: string;
  brand?: string | string[];
  size?: string | string[];
  condition?: string | string[];
  status?: string;
}>;

export default async function ShopPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const products = await searchProducts(sp);
  const facets = await getFilterFacets();
  const s = getSeller();
  const msg = `Hi! I'd like to know more about your shop.`;
  const activeFilters = (sp.brand?.length ?? 0) + (sp.size?.length ?? 0) + (sp.condition?.length ?? 0) + (sp.status ? 1 : 0) + (sp.q ? 1 : 0);

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12">
      <div className="mb-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
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
        <p className="mb-10 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {s.bio}
        </p>
      )}

      <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
        <Suspense>
          <ShopFilters facets={facets} />
        </Suspense>

        <section>
          <div className="mb-4 flex items-end justify-between">
            <h2 className="font-heading text-2xl tracking-wide uppercase">
              {activeFilters > 0 ? "Results" : "All listings"}
            </h2>
            <span className="font-mono text-xs text-muted-foreground">
              {products.length} {products.length === 1 ? "item" : "items"}
            </span>
          </div>
          {products.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-8 text-center">
              <p className="text-sm text-muted-foreground">
                No matches. Try clearing some filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
import { Suspense } from "react";
import { ProductCard } from "@/components/product-card";
import { ShopFilters } from "@/components/shop-filters";
import {
  getActiveSellers,
  getFilterFacets,
  searchProducts,
} from "@/lib/catalog";

type SearchParams = Promise<{
  q?: string;
  seller?: string;
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
  const [products, facets, sellers] = await Promise.all([
    searchProducts(sp),
    getFilterFacets(),
    getActiveSellers(),
  ]);

  const sellersById = new Map(sellers.map((s) => [s.id, s]));
  const activeFilters =
    (sp.brand?.length ?? 0) +
    (sp.size?.length ?? 0) +
    (sp.condition?.length ?? 0) +
    (sp.status ? 1 : 0) +
    (sp.seller ? 1 : 0) +
    (sp.q ? 1 : 0);

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-16">
      <div className="mb-10">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-lime">
          Catalog
        </p>
        <h1 className="mt-3 font-heading text-5xl tracking-wide uppercase sm:text-6xl">
          Shop everything
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Every listing, every seller, in one place. Filter to a single shop or
          scroll the whole catalog.
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
        <Suspense>
          <ShopFilters facets={{ ...facets, sellers }} />
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
            <div className="rounded-lg border border-dashed border-border p-12 text-center">
              <p className="text-sm text-muted-foreground">
                No matches. Try clearing some filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  seller={sellersById.get(product.sellerId)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
import { notFound } from "next/navigation";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { ProductCard } from "@/components/product-card";
import {
  getAllSellers,
  getProductsBySeller,
  getSellerByHandle,
} from "@/lib/catalog";

export default async function SellerPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const seller = getSellerByHandle(handle);

  if (!seller) {
    notFound();
  }

  const products = getProductsBySeller(seller.id);
  const allSellers = getAllSellers();

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12">
      <div className="mb-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-4xl leading-none tracking-tight sm:text-5xl">
            {seller.name}
          </h1>
          <p className="mt-1 font-mono text-sm text-muted-foreground">@{seller.handle}</p>
        </div>
        <a
          href={seller.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-7 items-center rounded-md border border-border bg-background px-2.5 text-sm font-medium hover:bg-muted transition-colors"
        >
          View on Instagram
        </a>
      </div>

      {seller.bio && (
        <p className="mb-8 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {seller.bio}
        </p>
      )}

      <Separator className="mb-8" />

      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-heading text-2xl tracking-wide uppercase">Listings</h2>
          <span className="font-mono text-xs text-muted-foreground">
            {products.length} items
          </span>
        </div>
        {products.length === 0 ? (
          <p className="text-sm text-muted-foreground">No listings yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {allSellers.length > 1 && (
        <section className="mt-16">
          <Separator className="mb-8" />
          <h2 className="font-heading text-2xl tracking-wide uppercase">More sellers</h2>
          <ul className="mt-4 space-y-1 text-sm">
            {allSellers
              .filter((s) => s.id !== seller.id)
              .map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/sellers/${s.handle}`}
                    className="text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
                  >
                    {s.name} · @{s.handle}
                  </Link>
                </li>
              ))}
          </ul>
        </section>
      )}
    </main>
  );
}

import { notFound } from "next/navigation";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import {
  formatPrice,
  getProducts,
  getSellerBySlug,
  instagramDmLink,
  whatsappLink,
} from "@/lib/catalog";

export default async function SellerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const seller = await getSellerBySlug(slug);
  if (!seller) notFound();

  const products = await getProducts({ sellerId: seller.id });
  const available = products.filter((p) => p.status !== "SOLD");
  const sold = products.filter((p) => p.status === "SOLD");
  const msg = `Hi! I'd like to know more about your shop.`;
  const wa = whatsappLink(seller.whatsappE164, msg);
  const dm = seller.handle
    ? instagramDmLink(seller.handle, msg)
    : seller.instagramUrl ?? "#";

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-16">
      {/* Brand header */}
      <section className="mb-12 overflow-hidden rounded-3xl bg-foreground text-background">
        <div className="absolute inset-0 -z-10 opacity-50" aria-hidden="true">
          <div className="absolute -top-32 right-0 h-72 w-72 rounded-full bg-lime/30 blur-3xl" />
        </div>
        <div className="relative grid gap-6 p-8 sm:p-12 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-lime">
              {seller.category}
            </p>
            <h1 className="mt-3 font-heading text-5xl tracking-wide uppercase sm:text-7xl">
              {seller.name}
            </h1>
            {seller.handle && (
              <p className="mt-2 font-mono text-sm opacity-90">
                @{seller.handle}
              </p>
            )}
            {seller.bio && (
              <p className="mt-5 max-w-xl text-sm leading-relaxed opacity-90">
                {seller.bio}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {seller.instagramUrl && (
              <a
                href={seller.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center rounded-full border border-background/30 bg-transparent px-4 text-sm font-medium hover:bg-background/10 transition-colors"
              >
                Instagram
              </a>
            )}
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center rounded-full bg-lime px-4 text-sm font-medium text-foreground hover:bg-lime/90 transition-colors"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </section>

      <nav className="mb-6 font-mono text-xs uppercase tracking-wider text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/sellers" className="hover:text-foreground transition-colors">
          ← All sellers
        </Link>
      </nav>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-heading text-2xl tracking-wide uppercase">
            Available
          </h2>
          <span className="font-mono text-xs text-muted-foreground">
            {available.length} items
          </span>
        </div>
        {available.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Nothing available right now. Check back, or message them on WhatsApp.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {available.map((product) => (
              <ProductCard key={product.id} product={product} seller={seller} />
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
              <ProductCard key={product.id} product={product} seller={seller} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
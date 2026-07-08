import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  formatPrice,
  getProduct,
  getSeller,
  instagramDmLink,
  whatsappLink,
} from "@/lib/catalog";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return { title: "Not found" };
  const cover = product.images[0]?.url;
  return {
    title: product.title,
    description: product.description.slice(0, 160),
    openGraph: {
      title: product.title,
      description: product.description.slice(0, 160),
      images: cover ? [{ url: cover }] : undefined,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product.title,
      description: product.description.slice(0, 160),
      images: cover ? [cover] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  const seller = await getSeller(product.sellerId);
  if (!seller) notFound();

  const isSold = product.status === "SOLD";
  const message = `Hi! I'm interested in "${product.title}" — ${formatPrice(product.price, product.currency)} on unbuy. Is it still available?`;
  const wa = whatsappLink(seller.whatsappE164, message);
  const dm = seller.handle
    ? instagramDmLink(seller.handle, message)
    : seller.instagramUrl ?? "#";

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12">
      <nav
        className="mb-6 font-mono text-xs uppercase tracking-wider text-muted-foreground"
        aria-label="Breadcrumb"
      >
        <Link href="/shop" className="hover:text-foreground transition-colors">
          ← Back to shop
        </Link>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-3">
          {product.images.map((img, i) => (
            <div
              key={img.id}
              className="overflow-hidden rounded-xl bg-muted aspect-square"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={`${product.title} — image ${i + 1}`}
                loading={i === 0 ? "eager" : "lazy"}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {product.featured && (
              <Badge className="bg-lime text-foreground hover:bg-lime/90">
                Featured
              </Badge>
            )}
            {isSold && <Badge variant="destructive">Sold</Badge>}
            <Badge variant="outline">{product.condition}</Badge>
          </div>

          <h1 className="font-heading text-4xl leading-none tracking-tight sm:text-5xl">
            {product.title}
          </h1>

          <p className="mt-4 font-mono text-2xl font-semibold tabular-nums">
            {formatPrice(product.price, product.currency)}
          </p>

          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          <Separator className="my-6" />

          <dl className="grid grid-cols-2 gap-y-3 text-sm">
            {product.brand && (
              <>
                <dt className="text-muted-foreground">Brand</dt>
                <dd>{product.brand}</dd>
              </>
            )}
            {product.size && (
              <>
                <dt className="text-muted-foreground">Size</dt>
                <dd>{product.size}</dd>
              </>
            )}
            {product.color && (
              <>
                <dt className="text-muted-foreground">Color</dt>
                <dd>{product.color}</dd>
              </>
            )}
            <dt className="text-muted-foreground">Category</dt>
            <dd>{product.category}</dd>
          </dl>

          <Separator className="my-6" />

          <Link
            href={`/sellers/${seller.slug}`}
            className="group flex items-center gap-3 rounded-xl border border-border/60 p-3 transition-colors hover:border-lime/40 hover:bg-lime/5"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-lime/30 to-foreground font-heading text-lg text-background">
              {seller.name.slice(0, 1)}
            </div>
            <div className="flex-1">
              <div className="font-heading text-base tracking-wide uppercase">
                {seller.name}
              </div>
              {seller.handle && (
                <div className="font-mono text-xs text-muted-foreground">
                  @{seller.handle}
                </div>
              )}
            </div>
            <span className="font-mono text-xs uppercase tracking-wider text-lime transition-colors group-hover:text-foreground">
              Shop →
            </span>
          </Link>

          {isSold ? (
            <div className="mt-6 rounded-lg bg-muted p-4 text-sm text-muted-foreground">
              This item has been sold. Browse the rest of {seller.name}&apos;s{" "}
              <Link
                href={`/sellers/${seller.slug}`}
                className="text-lime underline-offset-4 hover:underline"
              >
                shop
              </Link>
              .
            </div>
          ) : (
            <div className="mt-6 grid gap-2">
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 w-full items-center justify-center rounded-full bg-lime px-4 text-sm font-medium text-foreground shadow-sm shadow-lime/20 hover:bg-lime/90 transition-colors"
              >
                Message on WhatsApp
              </a>
              <a
                href={dm}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 w-full items-center justify-center rounded-full border border-border bg-background px-4 text-sm font-medium hover:bg-muted transition-colors"
              >
                DM on Instagram
              </a>
              <p className="mt-2 text-xs text-muted-foreground">
                Both open a chat pre-filled with the product name and price.
                You&apos;ll be talking to {seller.name} directly.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
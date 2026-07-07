import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  formatPrice,
  getProduct,
  getSeller,
  whatsappLink,
  instagramDmLink,
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

  if (!product) {
    notFound();
  }

  const seller = getSeller();
  const isSold = product.status === "SOLD";
  const message = `Hi! I'm interested in: ${product.title} — ${formatPrice(product.price, product.currency)}. Is it still available?`;
  const wa = whatsappLink(message);
  const dm = instagramDmLink(message);

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12">
      <nav className="mb-6 font-mono text-xs uppercase tracking-wider text-muted-foreground" aria-label="Breadcrumb">
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

        <div className="lg:sticky lg:top-20 lg:self-start">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {product.featured && <Badge variant="secondary">Featured</Badge>}
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

          <div className="text-sm">
            <span className="text-muted-foreground">Sold by </span>
            <Link
              href="/shop"
              className="font-medium hover:underline underline-offset-4"
            >
              {seller.name}
            </Link>
          </div>

          {isSold ? (
            <div className="mt-6 rounded-lg bg-muted p-4 text-sm text-muted-foreground">
              This item has been sold. Browse the rest of the catalog.
            </div>
          ) : (
            <div className="mt-6 grid gap-2">
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Message on WhatsApp
              </a>
              <a
                href={dm}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 w-full items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-medium hover:bg-muted transition-colors"
              >
                DM on Instagram
              </a>
              <p className="mt-2 text-xs text-muted-foreground">
                WhatsApp opens a chat pre-filled with the product name and price.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
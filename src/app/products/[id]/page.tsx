import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  formatPrice,
  getProduct,
  getSeller,
  whatsappLink,
  instagramDmLink,
} from "@/lib/catalog";

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
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-3">
          {product.images.map((img, i) => (
            <div
              key={img.id}
              className="overflow-hidden rounded-xl bg-muted aspect-square"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={`${product.title} — ${i + 1}`}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>

        <div className="lg:sticky lg:top-12 lg:self-start">
          <div className="mb-2 flex items-center gap-2">
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
            <span className="font-medium">{seller.name}</span>
          </div>

          {isSold ? (
            <div className="mt-6 rounded-lg bg-muted p-4 text-sm text-muted-foreground">
              This item has been sold. Check out the other listings below.
            </div>
          ) : (
            <div className="mt-6 grid gap-2">
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-8 w-full items-center justify-center rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/80 transition-colors"
              >
                Message on WhatsApp
              </a>
              <a
                href={dm}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-8 w-full items-center justify-center rounded-lg border border-border bg-background px-2.5 text-sm font-medium hover:bg-muted transition-colors"
              >
                DM on Instagram
              </a>
              <p className="mt-2 text-xs text-muted-foreground">
                Tapping WhatsApp opens a chat pre-filled with the product name and price.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
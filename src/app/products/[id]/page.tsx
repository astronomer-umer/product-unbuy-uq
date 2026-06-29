import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatPrice, getProduct, getSeller } from "@/lib/catalog";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = getProduct(id);

  if (!product) {
    notFound();
  }

  const seller = getSeller(product.sellerId);

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-3">
          {product.images.map((src, i) => (
            <div
              key={src}
              className="overflow-hidden rounded-xl bg-muted aspect-square"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`${product.title} — ${i + 1}`}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>

        <div className="lg:sticky lg:top-12 lg:self-start">
          <div className="mb-2 flex items-center gap-2">
            {product.featured && <Badge variant="secondary">Featured</Badge>}
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

          {seller && (
            <div className="text-sm">
              <span className="text-muted-foreground">Sold by </span>
              <span className="font-medium">{seller.name}</span>
            </div>
          )}

          <div className="mt-6 flex gap-2">
            <Button className="flex-1">Message seller</Button>
            <Button variant="outline">Save</Button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Messaging and checkout are coming soon. For now, contact the seller via the link on their profile.
          </p>
        </div>
      </div>
    </main>
  );
}

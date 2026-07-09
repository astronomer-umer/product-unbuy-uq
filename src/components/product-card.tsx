import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice, type Product, type Seller } from "@/lib/catalog";
import Link from "next/link";

export function ProductCard({
  product,
  seller,
}: {
  product: Product;
  seller?: Seller;
}) {
  const cover = product.images[0]?.url;
  const isSold = product.status === "SOLD";

  return (
    <Link
      href={`/products/${product.id}`}
      className="group block rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      aria-label={`${product.title} — ${formatPrice(product.price, product.currency)}`}
    >
      <Card className="h-full overflow-hidden border-border/60 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-lime/40 group-hover:shadow-md">
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted">
          {cover && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={cover}
              alt={product.title}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-contain transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            />
          )}
          {isSold && (
            <div className="absolute inset-0 flex items-center justify-center bg-foreground/45">
              <Badge variant="destructive" className="text-xs">Sold</Badge>
            </div>
          )}
          <div className="absolute top-2 left-2 z-10 flex gap-1">
            {product.featured && !isSold && (
              <Badge className="bg-lime text-foreground hover:bg-lime/90">Featured</Badge>
            )}
          </div>
        </div>
        <CardHeader>
          <CardTitle className="font-heading text-lg leading-tight tracking-wide uppercase line-clamp-2">
            {product.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <span className="font-mono font-semibold tabular-nums">
            {formatPrice(product.price, product.currency)}
          </span>
          <span className="font-mono text-xs text-muted-foreground uppercase">
            {product.condition}
          </span>
        </CardContent>
        {seller && (
          <div className="border-t border-border/60 px-4 py-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">
            <span className="text-lime/80 group-hover:text-lime transition-colors">
              {seller.name}
            </span>
          </div>
        )}
      </Card>
    </Link>
  );
}
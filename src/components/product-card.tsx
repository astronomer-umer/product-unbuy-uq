import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice, type Product } from "@/lib/catalog";
import Link from "next/link";

export function ProductCard({ product }: { product: Product }) {
  const cover = product.images[0]?.url;
  const isSold = product.status === "SOLD";

  return (
    <Link
      href={`/products/${product.id}`}
      className="group block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-xl"
      aria-label={`${product.title} — ${formatPrice(product.price, product.currency)}`}
    >
      <Card className="h-full overflow-hidden border-transparent transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-lg group-hover:border-border group-focus-visible:border-border">
        <div className="relative aspect-square w-full overflow-hidden bg-muted">
          {cover && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={cover}
              alt={product.title}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
          )}
          {isSold && (
            <div className="absolute inset-0 flex items-center justify-center bg-foreground/40">
              <Badge variant="destructive" className="text-xs">Sold</Badge>
            </div>
          )}
          <div className="absolute top-2 left-2 z-10 flex gap-1">
            {product.featured && !isSold && (
              <Badge variant="secondary">Featured</Badge>
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
      </Card>
    </Link>
  );
}
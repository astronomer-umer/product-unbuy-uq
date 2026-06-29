import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice, type Product } from "@/lib/catalog";
import Link from "next/link";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.id}`} className="group block">
      <Card className="h-full overflow-hidden transition-colors group-hover:bg-muted/50">
        <div className="relative aspect-square w-full overflow-hidden bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.images[0]}
            alt={product.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
          {product.featured && (
            <Badge className="absolute top-2 left-2 z-10" variant="secondary">
              Featured
            </Badge>
          )}
        </div>
        <CardHeader>
          <CardTitle className="font-heading text-xl leading-tight tracking-wide uppercase line-clamp-2">
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

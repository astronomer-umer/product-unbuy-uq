import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import type { Seller } from "@/lib/catalog";

export function SellerCard({ seller }: { seller: Seller }) {
  return (
    <Link
      href={`/sellers/${seller.slug}`}
      className="group block rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <Card className="h-full overflow-hidden border-border/60 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-lime/40 group-hover:shadow-md">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-foreground">
          {seller.logoUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={seller.logoUrl}
              alt={`${seller.name}`}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-lime/25 via-cobalt to-cobalt">
              <span className="font-heading text-8xl text-lime tracking-tight">
                {seller.name.slice(0, 1).toUpperCase()}
              </span>
            </div>
          )}
          {seller.featured && (
            <span className="absolute top-3 left-3 rounded-full bg-lime px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-foreground">
              Featured
            </span>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-heading text-xl tracking-wide uppercase">
            {seller.name}
          </h3>
          {seller.handle && (
            <p className="mt-0.5 font-mono text-xs text-muted-foreground">
              @{seller.handle}
            </p>
          )}
          {seller.bio && (
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
              {seller.bio}
            </p>
          )}
          <div className="mt-3 flex items-center justify-between font-mono text-xs uppercase tracking-wider">
            <span className="text-foreground/60">{seller.category}</span>
            <span className="text-lime">View shop →</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
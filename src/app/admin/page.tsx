import Link from "next/link";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/catalog";
import { DeleteButton, SoldToggle } from "@/components/admin-actions";

export default async function AdminPage() {
  const [products, sellers] = await Promise.all([
    prisma.product.findMany({
      include: {
        images: { orderBy: { order: "asc" }, take: 1 },
        seller: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.seller.findMany({ orderBy: { joinedAt: "asc" } }),
  ]);

  return (
    <div className="space-y-12">
      {/* SELLERS */}
      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-lime">
              Roster
            </p>
            <h2 className="mt-1 font-heading text-2xl tracking-wide uppercase">
              Sellers ({sellers.length})
            </h2>
          </div>
        </div>
        {sellers.length === 0 ? (
          <p className="text-sm text-muted-foreground">No sellers yet.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sellers.map((s) => (
              <div
                key={s.id}
                className="rounded-lg border border-border p-4 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-heading text-lg tracking-wide uppercase">
                      {s.name}
                    </h3>
                    {s.handle && (
                      <p className="font-mono text-xs text-muted-foreground">
                        @{s.handle}
                      </p>
                    )}
                  </div>
                  {s.featured && (
                    <Badge className="bg-lime text-foreground hover:bg-lime/90">
                      Featured
                    </Badge>
                  )}
                </div>
                {s.bio && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{s.bio}</p>
                )}
                <div className="flex items-center justify-between font-mono text-xs uppercase tracking-wider">
                  <span className="text-lime">{s.category}</span>
                  <Link
                    href={`/sellers/${s.slug}`}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    View →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* PRODUCTS */}
      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-heading text-2xl tracking-wide uppercase">
            Products ({products.length})
          </h2>
          <Link
            href="/admin/products/new"
            className="inline-flex h-9 items-center rounded-full bg-lime px-4 text-sm font-semibold text-foreground hover:bg-lime/90 transition-colors"
          >
            + Add product
          </Link>
        </div>

        {products.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No products yet. Add one to get started.
          </p>
        ) : (
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50 text-left font-mono text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Image</th>
                  <th className="px-3 py-2">Title</th>
                  <th className="px-3 py-2">Seller</th>
                  <th className="px-3 py-2">Price</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-3 py-2">
                      {p.images[0] && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.images[0].url}
                          alt={p.title}
                          className="h-12 w-12 rounded object-cover"
                        />
                      )}
                    </td>
                    <td className="px-3 py-2 font-semibold">{p.title}</td>
                    <td className="px-3 py-2 text-lime font-semibold">
                      {p.seller.name}
                    </td>
                    <td className="px-3 py-2 font-mono tabular-nums">
                      {formatPrice(p.price, p.currency)}
                    </td>
                    <td className="px-3 py-2">
                      <Badge
                        variant={
                          p.status === "SOLD"
                            ? "destructive"
                            : p.status === "RESERVED"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {p.status}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex justify-end gap-1">
                        <SoldToggle id={p.id} status={p.status} />
                        <Link
                          href={`/admin/products/${p.id}`}
                          className="inline-flex h-6 items-center rounded-md border border-border bg-background px-2 text-xs font-semibold hover:bg-muted transition-colors"
                        >
                          Edit
                        </Link>
                        <DeleteButton id={p.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

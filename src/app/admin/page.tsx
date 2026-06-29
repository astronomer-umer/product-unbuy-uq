import Link from "next/link";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/catalog";
import { DeleteButton, SoldToggle } from "@/components/admin-actions";

export default async function AdminPage() {
  const products = await prisma.product.findMany({
    include: { images: { orderBy: { order: "asc" }, take: 1 } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-heading text-xl tracking-wide uppercase">
          Products ({products.length})
        </h2>
        <Link
          href="/admin/products/new"
          className="inline-flex h-8 items-center rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/80 transition-colors"
        >
          + Add product
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="text-sm text-muted-foreground">No products yet. Add one to get started.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50 text-left font-mono text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-3 py-2">Image</th>
                <th className="px-3 py-2">Title</th>
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
                  <td className="px-3 py-2 font-medium">{p.title}</td>
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
                        className="inline-flex h-6 items-center rounded-md border border-border bg-background px-2 text-xs font-medium hover:bg-muted transition-colors"
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
    </div>
  );
}
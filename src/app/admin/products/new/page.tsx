import Link from "next/link";
import { prisma } from "@/lib/db";
import { NewProductForm } from "@/components/new-product-form";

export default async function NewProductPage() {
  const sellers = await prisma.seller.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-heading text-xl tracking-wide uppercase">New product</h2>
        <Link
          href="/admin"
          className="font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground"
        >
          ← Back
        </Link>
      </div>
      <NewProductForm sellers={sellers} />
    </div>
  );
}
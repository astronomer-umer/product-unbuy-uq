import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct } from "@/lib/catalog";
import { EditProductForm } from "@/components/edit-product-form";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-heading text-xl tracking-wide uppercase">Edit product</h2>
        <Link href="/admin" className="font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground">
          ← Back
        </Link>
      </div>
      <EditProductForm product={product} />
    </div>
  );
}
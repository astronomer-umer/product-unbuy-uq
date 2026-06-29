"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateProduct, type AdminFormState } from "@/app/actions/admin";
import type { Product } from "@/lib/catalog";

export function EditProductForm({ product }: { product: Product }) {
  const action = updateProduct.bind(null, product.id);
  const [state, formAction, pending] = useActionState<AdminFormState, FormData>(
    action,
    undefined,
  );

  return (
    <form action={formAction} className="space-y-4 max-w-2xl">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 space-y-1.5">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" defaultValue={product.title} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="price">Price</Label>
          <Input
            id="price"
            name="price"
            type="number"
            min="0"
            step="1"
            defaultValue={product.price}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="currency">Currency</Label>
          <Input id="currency" name="currency" defaultValue={product.currency} />
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            rows={4}
            defaultValue={product.description}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="brand">Brand</Label>
          <Input id="brand" name="brand" defaultValue={product.brand ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="category">Category</Label>
          <Input id="category" name="category" defaultValue={product.category} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="size">Size</Label>
          <Input id="size" name="size" defaultValue={product.size ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="color">Color</Label>
          <Input id="color" name="color" defaultValue={product.color ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="condition">Condition</Label>
          <Input id="condition" name="condition" defaultValue={product.condition} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="status">Status</Label>
          <Input id="status" name="status" defaultValue={product.status} />
        </div>

        <div className="col-span-2 space-y-2">
          <Label>Current images</Label>
          <div className="flex flex-wrap gap-2">
            {product.images.map((img) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={img.id} src={img.url} alt="" className="h-20 w-20 rounded object-cover border" />
            ))}
          </div>
        </div>

        <div className="col-span-2 space-y-1.5">
          <Label htmlFor="images">Add more images</Label>
          <Input id="images" name="images" type="file" multiple accept="image/*" />
        </div>

        <label className="col-span-2 flex items-center gap-2 font-mono text-xs uppercase tracking-wider">
          <input type="checkbox" name="featured" defaultChecked={product.featured} /> Featured on home page
        </label>
      </div>

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
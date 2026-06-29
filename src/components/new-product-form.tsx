"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createProduct, type AdminFormState } from "@/app/actions/admin";

export function NewProductForm() {
  const [state, action, pending] = useActionState<AdminFormState, FormData>(
    createProduct,
    undefined,
  );

  return (
    <form action={action} className="space-y-4 max-w-2xl">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 space-y-1.5">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="price">Price</Label>
          <Input id="price" name="price" type="number" min="0" step="1" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="currency">Currency</Label>
          <Input id="currency" name="currency" defaultValue="PKR" />
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" rows={4} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="brand">Brand</Label>
          <Input id="brand" name="brand" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="category">Category</Label>
          <Input id="category" name="category" defaultValue="Sneakers" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="size">Size</Label>
          <Input id="size" name="size" placeholder="UK 9" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="color">Color</Label>
          <Input id="color" name="color" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="condition">Condition</Label>
          <Input id="condition" name="condition" required placeholder="Like New / Excellent / Good" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="status">Status</Label>
          <Input id="status" name="status" defaultValue="AVAILABLE" />
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label htmlFor="images">Images (multiple allowed)</Label>
          <Input id="images" name="images" type="file" multiple accept="image/*" />
        </div>
        <label className="col-span-2 flex items-center gap-2 font-mono text-xs uppercase tracking-wider">
          <input type="checkbox" name="featured" /> Featured on home page
        </label>
      </div>

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Create product"}
        </Button>
      </div>
    </form>
  );
}
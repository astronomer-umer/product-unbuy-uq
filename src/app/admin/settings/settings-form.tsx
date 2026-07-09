"use client";

import { useState } from "react";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateSellerSettingsAction } from "@/app/actions/seller-settings";
import Link from "next/link";

type SellerInput = {
  id: string;
  slug: string;
  name: string;
  handle: string | null;
  bio: string | null;
  category: string;
  whatsappE164: string;
  instagramUrl: string | null;
  featured: boolean;
  active: boolean;
};

export function SettingsForm({ seller }: { seller: SellerInput }) {
  const [state, action, pending] = useActionState(
    updateSellerSettingsAction,
    undefined,
  );

  return (
    <form action={action} className="max-w-xl space-y-4">
      <input type="hidden" name="id" value={seller.id} />

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 space-y-1.5">
          <Label htmlFor="name">Shop name</Label>
          <Input id="name" name="name" defaultValue={seller.name} required />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="handle">Instagram handle (without @)</Label>
          <Input
            id="handle"
            name="handle"
            defaultValue={seller.handle ?? ""}
            placeholder="shoemonkey.pk2"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="instagramUrl">Instagram URL</Label>
          <Input
            id="instagramUrl"
            name="instagramUrl"
            defaultValue={seller.instagramUrl ?? ""}
            placeholder="https://www.instagram.com/your-handle/"
          />
        </div>

        <div className="col-span-2 space-y-1.5">
          <Label htmlFor="bio">Public bio</Label>
          <Textarea
            id="bio"
            name="bio"
            rows={3}
            defaultValue={seller.bio ?? ""}
            placeholder="A line or two about what you sell. Shown on your public shop page."
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            name="category"
            defaultValue={seller.category}
            placeholder="Sneakers"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="whatsappE164">WhatsApp number (hidden)</Label>
          <Input
            id="whatsappE164"
            name="whatsappE164"
            defaultValue={
              seller.whatsappE164 === "0" ? "" : seller.whatsappE164
            }
            placeholder="923001234567"
            pattern="[0-9]{10,15}"
            inputMode="numeric"
          />
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Country code + number. Never shown publicly — only revealed to
            authenticated buyers inside a conversation.
          </p>
        </div>

        <div className="col-span-2 space-y-1.5">
          <Label htmlFor="slug">Storefront URL slug</Label>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">
              unbuy-store.vercel.app/sellers/
            </span>
            <Input
              id="slug"
              name="slug"
              defaultValue={seller.slug}
              pattern="[a-z0-9-]+"
              required
            />
          </div>
        </div>
      </div>

      {state?.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
      {state?.success && (
        <p className="text-sm text-lime">{state.success}</p>
      )}

      <div className="flex gap-2 pt-2">
        <Button
          type="submit"
          disabled={pending}
          className="bg-lime text-foreground hover:bg-lime/90"
        >
          {pending ? "Saving…" : "Save settings"}
        </Button>
        <Link
          href="/admin"
          className="inline-flex h-9 items-center rounded-md border border-border bg-background px-4 text-sm font-semibold hover:bg-muted transition-colors"
        >
          Back to admin
        </Link>
      </div>
    </form>
  );
}
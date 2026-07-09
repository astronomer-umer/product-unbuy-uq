"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerAction, type RegisterState } from "@/app/actions/register";
import { useState } from "react";

export function RegisterForm() {
  const [state, action, pending] = useActionState<RegisterState, FormData>(
    registerAction,
    undefined,
  );
  const [slug, setSlug] = useState("");

  function autoSlug(name: string) {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48);
  }

  return (
    <form action={action} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Your name</Label>
          <Input id="name" name="name" required autoComplete="name" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
          />
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
          />
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            8+ characters. Hashed with bcrypt.
          </p>
        </div>

        <div className="col-span-2 mt-4 border-t border-border/60 pt-4">
          <p className="font-mono text-xs uppercase tracking-wider text-lime">
            Your shop
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="shopName">Shop name</Label>
          <Input
            id="shopName"
            name="shopName"
            required
            onChange={(e) => {
              // Auto-fill slug from shop name unless user already typed one
              setSlug((prev) =>
                prev && prev.length > 0
                  ? prev
                  : autoSlug(e.target.value),
              );
            }}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="slug">Storefront URL</Label>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-muted-foreground">
              unbuy-store.vercel.app/sellers/
            </span>
            <Input
              id="slug"
              name="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase())}
              pattern="[a-z0-9-]+"
              required
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="igHandle">Instagram handle (optional)</Label>
          <Input
            id="igHandle"
            name="igHandle"
            placeholder="your.handle"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            name="category"
            defaultValue="Sneakers"
            className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm focus-visible:outline-2 focus-visible:outline-ring"
          >
            <option>Sneakers</option>
            <option>Vintage Clothing</option>
            <option>Streetwear</option>
            <option>Accessories</option>
            <option>Other</option>
          </select>
        </div>
      </div>

      {state?.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}

      <Button
        type="submit"
        disabled={pending}
        className="w-full bg-lime text-foreground hover:bg-lime/90"
      >
        {pending ? "Creating account…" : "Create my shop"}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-foreground underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
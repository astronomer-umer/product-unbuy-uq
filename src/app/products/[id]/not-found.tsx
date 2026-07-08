import Link from "next/link";

export default function ProductNotFound() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-col items-center justify-center px-6 py-24 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
        404
      </p>
      <h1 className="mt-3 font-heading text-5xl tracking-tight uppercase">
        Gone.
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        This listing was removed or sold out before you got here.
      </p>
      <div className="mt-8 flex gap-2">
        <Link
          href="/shop"
          className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Browse shop
        </Link>
        <Link
          href="/"
          className="inline-flex h-9 items-center rounded-lg border border-border bg-background px-4 text-sm font-semibold hover:bg-muted transition-colors"
        >
          Home
        </Link>
      </div>
    </main>
  );
}
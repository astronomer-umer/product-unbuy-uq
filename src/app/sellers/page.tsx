import Link from "next/link";
import { SellerCard } from "@/components/seller-card";
import { getActiveSellers } from "@/lib/catalog";

export default async function SellersPage() {
  const sellers = await getActiveSellers();

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-16">
      <div className="mb-10">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-cobalt">
          The roster
        </p>
        <h1 className="mt-3 font-heading text-5xl tracking-wide uppercase sm:text-6xl">
          Sellers
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Independent sellers running real shops, not stores-of-stores. Each one
          picked their inventory, photographed it themselves, and ships straight
          to you.
        </p>
      </div>

      {sellers.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <p className="text-sm text-muted-foreground">
            No sellers yet. Be the first.
          </p>
          <Link
            href="/sellers/onboard"
            className="mt-4 inline-flex h-9 items-center rounded-lg bg-cobalt px-4 text-sm font-medium text-white hover:bg-cobalt/90 transition-colors"
          >
            Apply to join
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sellers.map((s) => (
            <SellerCard key={s.id} seller={s} />
          ))}
        </div>
      )}
    </main>
  );
}
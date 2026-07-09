import Link from "next/link";

export const metadata = {
  title: "Open a shop",
  description: "Sell on unbuy — open your storefront in two minutes.",
};

export default function OnboardPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-lime">
        For sellers
      </p>
      <h1 className="mt-3 font-heading text-5xl tracking-wide uppercase sm:text-6xl">
        Open a shop
      </h1>
      <p className="mt-4 text-base leading-relaxed text-muted-foreground">
        unbuy is curated — every seller runs their own catalog. Sign up,
        fill out a short form, and your storefront goes live. Buyers
        reach you directly through in-app chat. No listing fees, no cuts.
      </p>

      <div className="mt-10 space-y-6">
        <div className="rounded-xl border border-lime bg-lime/5 p-6">
          <h2 className="font-heading text-2xl tracking-wide uppercase">
            Ready?
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Two minutes. Email + password + a few details about your shop.
            We&apos;ll set everything else up after you sign up.
          </p>
          <Link
            href="/register"
            className="mt-4 inline-flex h-11 items-center rounded-full bg-lime px-5 text-sm font-semibold text-foreground hover:bg-lime/90 transition-colors"
          >
            Open my shop →
          </Link>
        </div>

        <div className="rounded-xl border border-border p-6">
          <h2 className="font-heading text-2xl tracking-wide uppercase">
            What you get
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>· A real storefront at <span className="font-mono">unbuy-store.vercel.app/sellers/your-slug</span></li>
            <li>· Admin panel: upload, edit, mark sold, reply to messages</li>
            <li>· Direct chat with buyers (no WhatsApp, no DMs)</li>
            <li>· Real-time notifications when a buyer messages you</li>
          </ul>
        </div>

        <div className="rounded-xl border border-border p-6">
          <h2 className="font-heading text-2xl tracking-wide uppercase">
            What we ask
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>· You photograph your own stock. No supplier photos.</li>
            <li>· You reply to buyer messages within a day.</li>
            <li>· You mark items Sold once a deal closes.</li>
            <li>· You ship within Pakistan. COD is fine.</li>
          </ul>
        </div>
      </div>

      <div className="mt-10">
        <Link
          href="/sellers"
          className="font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to sellers
        </Link>
      </div>
    </main>
  );
}
import Link from "next/link";

export default function OnboardPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-lime">
        For sellers
      </p>
      <h1 className="mt-3 font-heading text-5xl tracking-wide uppercase sm:text-6xl">
        Apply to join
      </h1>
      <p className="mt-4 text-base leading-relaxed text-muted-foreground">
        unbuy is curated — we pick sellers, not products. If you already run an
        Instagram catalog and want a proper storefront that doesn&apos;t make you
        look like every other reseller, this is for you.
      </p>

      <div className="mt-10 space-y-6">
        <div className="rounded-xl border border-border p-6">
          <h2 className="font-heading text-2xl tracking-wide uppercase">
            What we look for
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>· You photograph your own stock. No supplier photos.</li>
            <li>· You ship within Pakistan. COD is fine.</li>
            <li>· You reply on WhatsApp or DMs within a day.</li>
            <li>· You have at least 10 items ready to list.</li>
          </ul>
        </div>

        <div className="rounded-xl border border-border p-6">
          <h2 className="font-heading text-2xl tracking-wide uppercase">
            What you get
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>· A real storefront at <span className="font-mono">unbuy.pk/your-shop</span></li>
            <li>· Your own branded page, no unbuy ads or noise.</li>
            <li>· Product upload, mark sold, edit — built in.</li>
            <li>· Buyers tap WhatsApp / DM and reach you directly.</li>
          </ul>
        </div>

        <div className="rounded-xl border border-cobalt bg-cobalt/5 p-6">
          <h2 className="font-heading text-2xl tracking-wide uppercase">
            Ready?
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Email{" "}
            <a
              href="mailto:sellers@unbuy.pk"
              className="text-cobalt underline-offset-4 hover:underline"
            >
              sellers@unbuy.pk
            </a>{" "}
            with a link to your Instagram and 3 photos of items you&apos;d sell.
            We&apos;ll get back within 48 hours.
          </p>
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
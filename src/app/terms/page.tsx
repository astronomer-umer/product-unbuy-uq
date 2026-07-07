export const metadata = {
  title: "Terms of Service",
  description: "Terms of using unbuy.",
};

export default function TermsPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-cobalt">
        Legal
      </p>
      <h1 className="mt-3 font-heading text-5xl tracking-wide uppercase sm:text-6xl">
        Terms of Service
      </h1>
      <p className="mt-2 font-mono text-xs text-muted-foreground">
        Last updated: {new Date().toLocaleDateString("en-PK", { year: "numeric", month: "long", day: "numeric" })}
      </p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="font-heading text-xl tracking-wide uppercase text-foreground">
            1. What unbuy is
          </h2>
          <p className="mt-2">
            unbuy is a marketplace platform. We connect buyers with independent
            sellers. We do not buy, sell, ship, or take payment for any
            products listed. Transactions happen directly between buyer and
            seller.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl tracking-wide uppercase text-foreground">
            2. Buyers
          </h2>
          <p className="mt-2">
            You&apos;re responsible for verifying any product before purchase.
            Prices, condition, sizing, and authenticity are represented by the
            seller. unbuy does not mediate disputes. If something goes wrong,
            contact the seller directly — most issues resolve between two
            reasonable people.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl tracking-wide uppercase text-foreground">
            3. Sellers
          </h2>
          <p className="mt-2">
            You represent and warrant that you have the right to sell every
            product you list. You must photograph your own stock. You agree to
            ship orders within 7 days of payment, or to refund the buyer. We
            may remove listings or accounts that violate these terms.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl tracking-wide uppercase text-foreground">
            4. Prohibited items
          </h2>
          <p className="mt-2">
            No counterfeits. No stolen goods. No weapons, drugs, or anything
            illegal in Pakistan. No items that infringe someone else&apos;s
            intellectual property. When in doubt, ask before listing.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl tracking-wide uppercase text-foreground">
            5. Fees
          </h2>
          <p className="mt-2">
            The marketplace is currently free for sellers. If we introduce
            listing or transaction fees in the future, we&apos;ll give 30
            days&apos; notice via email.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl tracking-wide uppercase text-foreground">
            6. Liability
          </h2>
          <p className="mt-2">
            unbuy is provided as-is. We&apos;re not liable for transactions
            between buyers and sellers, lost shipments, or misrepresentation of
            products. Our total liability is limited to fees you&apos;ve paid
            us (currently zero).
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl tracking-wide uppercase text-foreground">
            7. Contact
          </h2>
          <p className="mt-2">
            Questions?{" "}
            <a
              href="mailto:hello@unbuy.pk"
              className="text-cobalt underline-offset-4 hover:underline"
            >
              hello@unbuy.pk
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}
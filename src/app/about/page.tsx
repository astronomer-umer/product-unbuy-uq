import Link from "next/link";

export const metadata = {
  title: "About",
  description: "What unbuy is, who it's for, and why it exists.",
};

export default function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-lime">
        About
      </p>
      <h1 className="mt-3 font-heading text-6xl tracking-wide uppercase sm:text-7xl">
        Let&apos;s{" "}
        <span className="text-lime">Unbuy</span>{" "}
        What You Buy!
      </h1>

      <div className="mt-10 space-y-8 text-base leading-relaxed">
        <p>
          <strong>unbuy</strong> is a curated marketplace for preloved goods.
          We&apos;re not a department store. We&apos;re not a thrift bin. We&apos;re a
          hand-picked roster of independent sellers, each running a real shop
          with real photos and real reasons to skip the new.
        </p>

        <div>
          <h2 className="font-heading text-2xl tracking-wide uppercase">
            What we believe
          </h2>
          <ul className="mt-3 space-y-2 text-muted-foreground">
            <li>
              · <strong>Curation over volume.</strong> Every seller is vetted.
              Every listing is photographed by the seller. No dropshippers.
            </li>
            <li>
              · <strong>Direct contact.</strong> Tap WhatsApp or Instagram on any
              item — you&apos;ll be talking to the seller, not a chatbot.
            </li>
            <li>
              · <strong>Buying preloved is an act of taste.</strong> Not
              charity, not compromise. The alternative is fine — we just think
              this is better.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="font-heading text-2xl tracking-wide uppercase">
            For sellers
          </h2>
          <p className="mt-3 text-muted-foreground">
            Already running a catalog on Instagram?{" "}
            <Link
              href="/sellers/onboard"
              className="text-lime underline-offset-4 hover:underline"
            >
              Apply to join
            </Link>{" "}
            and we&apos;ll set up your own storefront. No platform ads, no
            algorithm games — just your shop, your products, your buyers.
          </p>
        </div>

        <div>
          <h2 className="font-heading text-2xl tracking-wide uppercase">
            Contact
          </h2>
          <p className="mt-3 text-muted-foreground">
            Questions, partnerships, or a seller you think we should know about:{" "}
            <a
              href="mailto:astronomer.umer@gmail.com"
              className="text-cobalt underline-offset-4 hover:underline"
            >
              astronomer.umer@gmail.com
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}

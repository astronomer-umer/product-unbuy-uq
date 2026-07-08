export const metadata = {
  title: "Privacy Policy",
  description: "How unbuy handles your data.",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-lime">
        Legal
      </p>
      <h1 className="mt-3 font-heading text-5xl tracking-wide uppercase sm:text-6xl">
        Privacy Policy
      </h1>
      <p className="mt-2 font-mono text-xs text-muted-foreground">
        Last updated: {new Date().toLocaleDateString("en-PK", { year: "numeric", month: "long", day: "numeric" })}
      </p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="font-heading text-xl tracking-wide uppercase text-foreground">
            1. What we collect
          </h2>
          <p className="mt-2">
            For buyers: nothing beyond what your browser sends us by default
            (IP address, user agent, referrer) and any data you voluntarily
            provide when contacting a seller (your name, message).
          </p>
          <p className="mt-2">
            For sellers: account email, hashed password, business contact
            details (WhatsApp number, Instagram handle), and the product
            listings and photos you upload.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl tracking-wide uppercase text-foreground">
            2. How we use it
          </h2>
          <p className="mt-2">
            To display the marketplace, route contact messages between buyers
            and sellers, and to send you important service updates. We do not
            sell your data. We do not run third-party ad networks.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl tracking-wide uppercase text-foreground">
            3. Cookies
          </h2>
          <p className="mt-2">
            We use a single first-party session cookie to keep you signed in.
            No analytics, no tracking pixels, no third-party scripts.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl tracking-wide uppercase text-foreground">
            4. Where data lives
          </h2>
          <p className="mt-2">
            Our database is hosted on Turso (libSQL). Product images are served
            from Vercel&apos;s CDN. Both providers are SOC 2-compliant.
            Passwords are hashed with bcrypt (cost 12).
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl tracking-wide uppercase text-foreground">
            5. Your rights
          </h2>
          <p className="mt-2">
            You can request export or deletion of your data at any time by
            emailing{" "}
            <a
              href="mailto:hello@unbuy.pk"
              className="text-lime underline-offset-4 hover:underline"
            >
              hello@unbuy.pk
            </a>
            . We respond within 7 days.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl tracking-wide uppercase text-foreground">
            6. Changes
          </h2>
          <p className="mt-2">
            We&apos;ll update this page and bump the date above if our practices
            change. Significant changes will be emailed to active sellers.
          </p>
        </section>
      </div>
    </main>
  );
}

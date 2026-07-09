import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { RegisterForm } from "./register-form";

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user) redirect("/admin");

  return (
    <main className="mx-auto w-full max-w-xl px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-lime">
        Sell on unbuy
      </p>
      <h1 className="mt-3 font-heading text-5xl tracking-wide uppercase sm:text-6xl">
        Open your shop
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        One form, two minutes. You&apos;ll get a storefront at
        <span className="font-mono"> unbuy-store.vercel.app/sellers/your-slug</span>,
        an admin panel to add products, and an inbox for buyer messages.
      </p>

      <div className="mt-10 rounded-2xl border border-border/60 bg-background p-6">
        <RegisterForm />
      </div>

      <p className="mt-6 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        By creating an account you agree to unbuy&apos;s terms of service and
        privacy policy. Adding products is free. No listing fees, no cuts.
      </p>
    </main>
  );
}
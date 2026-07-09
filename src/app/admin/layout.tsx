import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?next=/admin");
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl tracking-wide uppercase">Admin</h1>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            Signed in as {session.user.email}
          </p>
        </div>
        <Link
          href="/admin/settings"
          className="inline-flex h-9 items-center rounded-full border border-border bg-background px-3 text-xs font-semibold hover:bg-muted transition-colors"
        >
          Shop settings
        </Link>
      </div>
      {children}
    </div>
  );
}
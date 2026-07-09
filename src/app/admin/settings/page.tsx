import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { SettingsForm } from "./settings-form";

export default async function AdminSettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?next=/admin/settings");

  const seller = await prisma.seller.findUnique({
    where: { ownerId: session.user.id },
  });
  if (!seller) {
    return (
      <div className="rounded-xl border border-dashed border-border p-8 text-center">
        <p className="text-sm text-muted-foreground">
          No seller profile linked to your account yet. Ask the platform owner.
        </p>
      </div>
    );
  }

  // Whitelist the fields the seller is allowed to edit.
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-lime">
        Shop settings
      </p>
      <h2 className="mt-1 mb-6 font-heading text-2xl tracking-wide uppercase">
        Public profile
      </h2>
      <SettingsForm
        seller={{
          id: seller.id,
          slug: seller.slug,
          name: seller.name,
          handle: seller.handle,
          bio: seller.bio,
          category: seller.category,
          whatsappE164: seller.whatsappE164,
          instagramUrl: seller.instagramUrl,
          featured: seller.featured,
          active: seller.active,
        }}
      />
    </div>
  );
}
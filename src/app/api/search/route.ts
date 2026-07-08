import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { buildSemanticIndex } from "@/lib/semantic-search";

export const runtime = "nodejs";

type ProductWithSeller = Awaited<ReturnType<typeof prisma.product.findFirst>> & {
  images?: unknown;
  seller: NonNullable<Awaited<ReturnType<typeof prisma.seller.findFirst>>>;
};

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) {
    return Response.json({ results: [] });
  }

  const products = await prisma.product.findMany({
    where: { status: { not: "SOLD" } },
    include: { seller: true },
    take: 500,
  });

  const index = buildSemanticIndex(
    products as unknown as ProductWithSeller[],
    (p: ProductWithSeller) =>
      [
        p.title,
        p.description,
        p.brand ?? "",
        p.category,
        p.condition,
        p.color ?? "",
        p.size ?? "",
      ].join(" "),
  );

  const hits = index.query(q).slice(0, 8);

  return Response.json({
    results: hits.map((h: { item: ProductWithSeller; score: number }) => ({
      id: h.item.id,
      title: h.item.title,
      price: h.item.price,
      seller: h.item.seller.name,
      score: h.score,
    })),
  });
}
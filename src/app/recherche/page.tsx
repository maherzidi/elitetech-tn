import { prisma } from "@/lib/prisma";
import ProductGrid from "@/components/ProductGrid";

export const dynamic = "force-dynamic";

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = searchParams.q?.trim() || "";

  const products = q
    ? await prisma.product.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { nameAr: { contains: q, mode: "insensitive" } },
            { sku: { contains: q, mode: "insensitive" } },
          ],
        },
        orderBy: { createdAt: "desc" },
      })
    : [];

  const serialized = products.map((p) => ({
    id: p.id,
    name: p.name,
    nameAr: p.nameAr,
    slug: p.slug,
    sku: p.sku,
    price: Number(p.price),
    comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
    stock: p.stock,
    images: p.images,
  }));

  return (
    <ProductGrid
      title={`Résultats pour "${q}"`}
      breadcrumbs={[{ label: "Recherche" }]}
      products={serialized}
    />
  );
}

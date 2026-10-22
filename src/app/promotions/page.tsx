import { prisma } from "@/lib/prisma";
import ProductGrid from "@/components/ProductGrid";

export const dynamic = "force-dynamic";

export default async function PromotionsPage() {
  const products = await prisma.product.findMany({
    where: { isActive: true, comparePrice: { not: null } },
    orderBy: { createdAt: "desc" },
  });

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

  return <ProductGrid title="Promotions" breadcrumbs={[{ label: "Promotions" }]} products={serialized} />;
}

import { prisma } from "@/lib/prisma";
import ProductGrid from "@/components/ProductGrid";
import { toCatalogProduct } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function PromotionsPage() {
  const products = await prisma.product.findMany({
    where: { isActive: true, comparePrice: { not: null } },
    include: {
      brand: true,
      category: { include: { parent: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <ProductGrid
      title="Promotions"
      breadcrumbs={[{ label: "Promotions" }]}
      products={products.map(toCatalogProduct)}
    />
  );
}

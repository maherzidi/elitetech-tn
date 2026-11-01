import { prisma } from "@/lib/prisma";
import ProductGrid from "@/components/ProductGrid";
import { toCatalogProduct } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function AllProductsPage() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: {
      brand: true,
      category: { include: { parent: true } },
    },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
  });

  return (
    <ProductGrid
      title="Tous nos produits"
      breadcrumbs={[{ label: "Tous nos produits" }]}
      products={products.map(toCatalogProduct)}
    />
  );
}

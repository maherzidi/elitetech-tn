import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductGrid from "@/components/ProductGrid";
import { toCatalogProduct } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const category = await prisma.category.findUnique({
    where: { slug: params.slug },
    include: {
      children: { where: { isActive: true }, orderBy: { order: "asc" } },
    },
  });

  if (!category || !category.isActive) notFound();

  const childIds = category.children.map((c) => c.id);

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      OR: [{ categoryId: category.id }, { categoryId: { in: childIds } }],
    },
    include: {
      brand: true,
      category: { include: { parent: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <ProductGrid
      title={category.name}
      titleAr={category.nameAr}
      breadcrumbs={[{ label: category.name, labelAr: category.nameAr }]}
      subcategories={category.children.map((c) => ({
        name: c.name,
        nameAr: c.nameAr,
        slug: c.slug,
        href: `/categories/${category.slug}/${c.slug}`,
      }))}
      products={products.map(toCatalogProduct)}
    />
  );
}

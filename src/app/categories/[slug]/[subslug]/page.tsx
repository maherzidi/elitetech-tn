import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductGrid from "@/components/ProductGrid";
import { toCatalogProduct } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function SubcategoryPage({ params }: { params: { slug: string; subslug: string } }) {
  const parent = await prisma.category.findUnique({ where: { slug: params.slug } });
  const sub = await prisma.category.findUnique({ where: { slug: params.subslug } });

  if (!parent || !sub || sub.parentId !== parent.id) notFound();

  const products = await prisma.product.findMany({
    where: { isActive: true, categoryId: sub.id },
    include: {
      brand: true,
      category: { include: { parent: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <ProductGrid
      title={sub.name}
      titleAr={sub.nameAr}
      breadcrumbs={[
        { label: parent.name, labelAr: parent.nameAr, href: `/categories/${parent.slug}` },
        { label: sub.name, labelAr: sub.nameAr },
      ]}
      products={products.map(toCatalogProduct)}
    />
  );
}

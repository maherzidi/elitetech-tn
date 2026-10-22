import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductGrid from "@/components/ProductGrid";

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
      products={serialized}
    />
  );
}

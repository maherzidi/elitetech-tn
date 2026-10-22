import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductGrid from "@/components/ProductGrid";

export const dynamic = "force-dynamic";

export default async function SubcategoryPage({ params }: { params: { slug: string; subslug: string } }) {
  const parent = await prisma.category.findUnique({ where: { slug: params.slug } });
  const sub = await prisma.category.findUnique({ where: { slug: params.subslug } });

  if (!parent || !sub || sub.parentId !== parent.id) notFound();

  const products = await prisma.product.findMany({
    where: { isActive: true, categoryId: sub.id },
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
      title={sub.name}
      titleAr={sub.nameAr}
      breadcrumbs={[
        { label: parent.name, labelAr: parent.nameAr, href: `/categories/${parent.slug}` },
        { label: sub.name, labelAr: sub.nameAr },
      ]}
      products={serialized}
    />
  );
}

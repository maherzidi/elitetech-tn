import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductDetailClient from "./ProductDetailClient";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: { category: true, brand: true },
  });

  if (!product || !product.isActive) notFound();

  const related = await prisma.product.findMany({
    where: {
      isActive: true,
      categoryId: product.categoryId,
      NOT: { id: product.id },
    },
    take: 4,
  });

  const serialize = (p: typeof product) => ({
    id: p.id,
    name: p.name,
    nameAr: p.nameAr,
    slug: p.slug,
    sku: p.sku,
    description: p.description,
    descriptionAr: p.descriptionAr,
    price: Number(p.price),
    comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
    stock: p.stock,
    images: p.images,
    specs: p.specs as Record<string, string> | null,
    categoryName: p.category?.name || null,
    categorySlug: p.category?.slug || null,
    brandName: p.brand?.name || null,
  });

  return (
    <ProductDetailClient
      product={serialize(product)}
      related={related.map((r) => ({
        id: r.id,
        name: r.name,
        nameAr: r.nameAr,
        slug: r.slug,
        sku: r.sku,
        price: Number(r.price),
        comparePrice: r.comparePrice ? Number(r.comparePrice) : null,
        stock: r.stock,
        images: r.images,
      }))}
    />
  );
}

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import HomeClient from "./HomeClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [categories, featured] = await Promise.all([
    prisma.category.findMany({
      where: { parentId: null, isActive: true },
      orderBy: { order: "asc" },
    }),
    prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  const serializedFeatured = featured.map((p) => ({
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

  return <HomeClient categories={categories} featured={serializedFeatured} />;
}

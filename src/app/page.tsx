import { prisma } from "@/lib/prisma";
import HomeClient from "./HomeClient";

export const dynamic = "force-dynamic";

// Produits mis en avant dans le diaporama du hero.
// L'ordre de ce tableau est l'ordre d'affichage.
const SHOWCASE: { sku: string; label: string; image: string }[] = [
  { sku: "20000026", label: "Redmi 15C 6/128", image: "/images/products/redmi-15c-1.jpg" },
  { sku: "20000032", label: "Redmi A7 Pro", image: "/images/products/redmi-a7-pro.jpg" },
  { sku: "20000033", label: "Oppo A6c 4/128", image: "/images/products/oppo-a6c.jpg" },
  { sku: "20000043", label: "Honor X5C Plus", image: "/images/products/honor-x5c-plus.jpg" },
  { sku: "20000066", label: "Samsung Galaxy A04e", image: "/images/products/galaxy-a04e.jpg" },
  { sku: "20000058", label: "Redmi 10C", image: "/images/products/redmi-10c.jpg" },
];

export default async function HomePage() {
  const [categories, featured, showcaseProducts] = await Promise.all([
    prisma.category.findMany({
      where: { parentId: null, isActive: true },
      orderBy: { order: "asc" },
    }),
    prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.product.findMany({
      where: { isActive: true, sku: { in: SHOWCASE.map((item) => item.sku) } },
      include: { brand: true },
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

  const bySku = new Map(showcaseProducts.map((p) => [p.sku, p]));
  const showcase = SHOWCASE.flatMap(({ sku, label, image }) => {
    const product = bySku.get(sku);
    if (!product) return [];
    return [
      {
        id: product.id,
        sku: product.sku,
        name: label,
        brand: product.brand?.name || "",
        price: Number(product.price),
        image: product.images[0] || image,
        slug: product.slug,
        stock: product.stock,
      },
    ];
  });

  return (
    <HomeClient
      categories={categories.filter((category) => category.slug !== "divers")}
      featured={serializedFeatured}
      showcase={showcase}
    />
  );
}

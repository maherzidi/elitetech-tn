import { prisma } from "@/lib/prisma";
import HomeClient from "./HomeClient";
import { productColors } from "@/lib/product-variants";

export const dynamic = "force-dynamic";

// Produits mis en avant dans le diaporama du hero.
// L'ordre de ce tableau est l'ordre d'affichage.
const SHOWCASE: { sku: string; label: string; image: string }[] = [
  { sku: "20000010", label: "HONOR X5C 4/128", image: "/images/products/honor-x5c.png" },
  { sku: "C-1793261256793", label: "HONOR X6C 6/256", image: "/images/products/honor-x6c.png" },
  { sku: "20000011", label: "Redmi 15C 6/128", image: "/images/products/redmi-15c.png" },
  { sku: "20000012", label: "Redmi A7 Pro 4/128", image: "/images/products/redmi-a7-pro.png" },
  { sku: "20000013", label: "Infinix Smart 20 4/128", image: "/images/products/infinix-smart-20.png" },
  { sku: "20000014", label: "OPPO A6c 4/128", image: "/images/products/oppo-a6c.png" },
];

export default async function HomePage() {
  const [featured, showcaseProducts] = await Promise.all([
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
    colors: productColors(p.specs),
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

  return <HomeClient featured={serializedFeatured} showcase={showcase} />;
}

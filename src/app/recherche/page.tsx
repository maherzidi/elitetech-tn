import { prisma } from "@/lib/prisma";
import ProductGrid from "@/components/ProductGrid";
import { normalizeText, toCatalogProduct } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = searchParams.q?.trim() || "";

  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: {
      brand: true,
      category: { include: { parent: true } },
    },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
  });

  const tokens = normalizeText(q).split(/\s+/).filter(Boolean);
  const query = normalizeText(q);

  function scoreProduct(product: (typeof products)[number]) {
    const name = normalizeText(product.name);
    const brand = normalizeText(product.brand?.name ?? "");
    const category = normalizeText(
      [product.category?.name, product.category?.parent?.name].filter(Boolean).join(" "),
    );

    let score = 0;
    if (query) {
      if (name === query) score += 120;
      else if (name.startsWith(query)) score += 80;
      else if (name.includes(query)) score += 50;
    }
    for (const token of tokens) {
      if (name.includes(token)) score += 10;
      else if (brand.includes(token)) score += 6;
      else if (category.includes(token)) score += 4;
      else score += 1;
    }
    return score;
  }

  const matches = tokens.length
    ? products
        .filter((product) => {
          const haystack = normalizeText(
            [
              product.name,
              product.nameAr,
              product.sku,
              product.description,
              product.brand?.name,
              product.category?.name,
              product.category?.parent?.name,
              product.specs ? Object.values(product.specs as Record<string, unknown>).join(" ") : "",
            ]
              .filter(Boolean)
              .join(" "),
          );
          return tokens.every((token) => haystack.includes(token));
        })
        .map((product) => ({ product, score: scoreProduct(product) }))
        .sort((a, b) => b.score - a.score)
        .map((entry) => entry.product)
    : products;

  return (
    <ProductGrid
      title={q ? `Résultats pour "${q}"` : "Tous nos produits"}
      breadcrumbs={[{ label: q ? "Recherche" : "Tous nos produits" }]}
      products={matches.map(toCatalogProduct)}
    />
  );
}

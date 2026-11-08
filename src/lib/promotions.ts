import { prisma } from "@/lib/prisma";

/**
 * Vrai s'il existe au moins un produit actif avec un ancien prix barre.
 * Sert a masquer le lien « Promotions » tant que la page serait vide.
 */
export async function hasActivePromotions(): Promise<boolean> {
  const count = await prisma.product.count({
    where: { isActive: true, comparePrice: { not: null } },
  });
  return count > 0;
}

// Statut d'un produit partage entre le site et la caisse.
// Les batteries sans stock sont annoncees « En arrivage » via specs.Statut.
// Des qu'une quantite est ajoutee (stock > 0), le produit passe
// automatiquement « En stock » sans modifier ses donnees.

export type ProductStatus = "in_stock" | "arriving" | "out_of_stock";

export function productStatus(
  stock: number,
  specs?: Record<string, unknown> | null
): ProductStatus {
  if (stock > 0) return "in_stock";
  const raw = specs?.Statut ?? specs?.statut;
  if (typeof raw === "string" && /arrivage/i.test(raw)) return "arriving";
  return "out_of_stock";
}

export function statusLabel(
  status: ProductStatus,
  locale: "fr" | "ar" = "fr"
): string {
  if (status === "in_stock") return locale === "ar" ? "متوفر" : "En stock";
  if (status === "arriving") return locale === "ar" ? "قادم قريباً" : "En arrivage";
  return locale === "ar" ? "غير متوفر" : "Rupture de stock";
}

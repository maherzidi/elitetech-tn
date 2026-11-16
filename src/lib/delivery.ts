// Lieu de retrait et libellés partagés entre le site et l'administration.
// Le schéma Order n'a pas de champ « mode de livraison » : le retrait est
// identifié par l'adresse enregistrée et la mention ajoutée aux remarques.

export const STORE_NAME = "EliteTech";
export const STORE_ADDRESS = "Avenue Taieb Azabi, 8050 Hammamet";
export const STORE_CITY = "Hammamet";
export const PICKUP_LABEL = "Retrait en magasin";
export const PICKUP_ADDRESS = `${PICKUP_LABEL} — ${STORE_ADDRESS}`;

export const SHIPPING_COST = 7;

export type DeliveryMethod = "DELIVERY" | "PICKUP";

export function isPickupOrder(order: {
  address?: string | null;
  notes?: string | null;
}): boolean {
  return (
    (order.address ?? "").startsWith(PICKUP_LABEL) ||
    (order.notes ?? "").includes(PICKUP_LABEL)
  );
}

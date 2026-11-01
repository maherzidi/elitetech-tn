// Gestion des coloris proposés au client.
//
// Le champ `Couleur` des fiches décrit le coloris réel du modèle (parfois un
// bi-ton, ex. « Vert menthe / noir »). Les variantes réellement proposées au
// choix sont stockées à part dans `Couleurs`, séparées par des virgules.
// Ainsi on n'interprète jamais un bi-ton comme deux coloris.

const COLOR_HEX: Record<string, string> = {
  noir: "#141414",
  "noir de minuit": "#141414",
  blanc: "#FFFFFF",
  "blanc cassé": "#F4F1EA",
  bleu: "#2563EB",
  "bleu océan": "#0E7490",
  "bleu clair": "#60A5FA",
  "bleu nuit": "#1E3A8A",
  vert: "#16A34A",
  "vert menthe": "#6EE7B7",
  "vert sauge": "#84A98C",
  lavande: "#C4B5FD",
  violet: "#7C3AED",
  pourpre: "#9333EA",
  rose: "#F472B6",
  rouge: "#DC2626",
  orange: "#F97316",
  "orange crépuscule": "#EA580C",
  jaune: "#FACC15",
  or: "#EAB308",
  doré: "#EAB308",
  argent: "#CBD5E1",
  "argent météore": "#CBD5E1",
  gris: "#9CA3AF",
  "gris sidéral": "#6B7280",
  marron: "#92400E",
  beige: "#E7D8C9",
  turquoise: "#14B8A6",
  cyan: "#06B6D4",
  cuivre: "#B45309",
};

function cleanColor(value: string): string {
  const trimmed = value.replace(/\s+/g, " ").trim();
  if (!trimmed) return "";
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

/** Liste des coloris proposés au choix pour un produit. */
export function productColors(specs: unknown): string[] {
  if (!specs || typeof specs !== "object" || Array.isArray(specs)) return [];
  const record = specs as Record<string, unknown>;
  const raw = record.Couleurs ?? record.couleurs;

  if (Array.isArray(raw)) {
    return dedupe(raw.map((value) => cleanColor(String(value))).filter(Boolean));
  }
  if (typeof raw !== "string") return [];

  return dedupe(
    raw
      .split(/[,;|]/)
      .map(cleanColor)
      .filter(Boolean),
  );
}

function dedupe(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const key = value.toLocaleLowerCase("fr");
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(value);
  }
  return result;
}

function normalizeColorName(color: string): string {
  return color
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

const NORMALIZED_COLOR_HEX = Object.entries(COLOR_HEX)
  .map(([name, hex]) => [normalizeColorName(name), hex] as const)
  .sort((a, b) => b[0].length - a[0].length);

/** Couleur d'aperçu (pastille) pour un nom de coloris. */
export function colorHex(color: string): string {
  const key = normalizeColorName(color);
  const exact = NORMALIZED_COLOR_HEX.find(([name]) => name === key);
  if (exact) return exact[1];

  // Recherche partielle : « Vert menthe clair » -> « vert menthe ».
  const partial = NORMALIZED_COLOR_HEX.find(([name]) => key.includes(name));
  return partial ? partial[1] : "#CBD5E1";
}

/** Vérifie qu'un coloris envoyé par le client fait bien partie de la fiche. */
export function resolveProductColor(specs: unknown, requested: string | null | undefined): string | null {
  if (!requested) return null;
  const colors = productColors(specs);
  const target = requested.trim().toLocaleLowerCase("fr");
  return colors.find((color) => color.toLocaleLowerCase("fr") === target) ?? null;
}

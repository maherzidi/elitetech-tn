// Types et logique de filtrage du catalogue (cote client).
// Les facettes sont deduites des produits affiches : chaque rayon obtient
// donc automatiquement ses propres filtres (autonomie pour l'audio, RAM et
// stockage pour les smartphones, puissance et connecteurs pour les chargeurs,
// connexion pour les claviers, etc.).

import { productColors } from "./product-variants";

export type CatalogProduct = {
  id: string;
  name: string;
  nameAr?: string | null;
  slug: string;
  sku: string;
  price: number;
  comparePrice?: number | null;
  stock: number;
  images: string[];
  colors?: string[];
  brand?: string | null;
  specs?: Record<string, string> | null;
  categoryName?: string | null;
  categorySlug?: string | null;
  parentName?: string | null;
  parentSlug?: string | null;
};

export type FacetOption = {
  value: string;
  label: string;
  count: number;
  match: (product: CatalogProduct) => boolean;
};

export type Facet = {
  id: string;
  label: string;
  labelAr?: string;
  options: FacetOption[];
};

type ProductRow = {
  id: string;
  name: string;
  nameAr: string | null;
  slug: string;
  sku: string;
  price: unknown;
  comparePrice: unknown;
  stock: number;
  images: string[];
  specs?: unknown;
  brand?: { name: string } | null;
  category?:
    | {
        name: string;
        slug: string;
        parent?: { name: string; slug: string } | null;
      }
    | null;
};

/** Convertit un produit Prisma en produit catalogue serialisable cote client. */
export function toCatalogProduct(product: ProductRow): CatalogProduct {
  return {
    id: product.id,
    name: product.name,
    nameAr: product.nameAr,
    slug: product.slug,
    sku: product.sku,
    price: Number(product.price),
    comparePrice: product.comparePrice != null ? Number(product.comparePrice) : null,
    stock: product.stock,
    images: product.images ?? [],
    colors: productColors(product.specs),
    brand: product.brand?.name?.trim() || null,
    specs: (product.specs as Record<string, string> | null) ?? null,
    categoryName: product.category?.name ?? null,
    categorySlug: product.category?.slug ?? null,
    parentName: product.category?.parent?.name ?? null,
    parentSlug: product.category?.parent?.slug ?? null,
  };
}

/** Minuscules sans accents, pour une recherche tolerante. */
export function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f\u064b-\u065f\u0670]/g, "")
    .toLowerCase()
    .trim();
}

function getSpec(product: CatalogProduct, key: string): string | null {
  const specs = product.specs;
  if (!specs) return null;
  const target = normalizeText(key);
  for (const [specKey, specValue] of Object.entries(specs)) {
    if (normalizeText(specKey) === target && specValue != null && String(specValue).trim()) {
      return String(specValue).trim();
    }
  }
  return null;
}

/** Plus grand nombre present dans une valeur ("2 x 5 W" -> 5, "9,5 h" -> 9.5). */
function maxNumber(value: string): number | null {
  const matches = value.replace(/,/g, ".").match(/\d+(?:\.\d+)?/g);
  if (!matches) return null;
  return Math.max(...matches.map(Number));
}

/** Capacite en Go, avec conversion des Mo ("32 Mo" -> 0.031 Go). */
function capacityGo(value: string): number | null {
  const go = value.match(/(\d+(?:[.,]\d+)?)\s*go/i);
  if (go) return parseFloat(go[1].replace(",", "."));
  const mo = value.match(/(\d+(?:[.,]\d+)?)\s*mo/i);
  if (mo) return parseFloat(mo[1].replace(",", ".")) / 1024;
  return null;
}

type Bucket = {
  id: string;
  label: string;
  test: (value: string) => boolean;
};

type SpecFacetDef = {
  key: string;
  label: string;
  labelAr?: string;
  buckets?: Bucket[];
  derive?: (product: CatalogProduct) => string | null;
  maxOptions?: number;
};

const AUTONOMY_BUCKETS: Bucket[] = [
  {
    id: "lt5",
    label: "Moins de 5 h",
    test: (v) => {
      const h = maxNumber(v);
      return h != null && h < 5;
    },
  },
  {
    id: "5-10",
    label: "5 à 10 h",
    test: (v) => {
      const h = maxNumber(v);
      return h != null && h >= 5 && h <= 10;
    },
  },
  {
    id: "gt10",
    label: "Plus de 10 h",
    test: (v) => {
      const h = maxNumber(v);
      return h != null && h > 10;
    },
  },
];

const BATTERY_BUCKETS: Bucket[] = [
  {
    id: "le1000",
    label: "1 000 mAh et moins",
    test: (v) => {
      const mAh = maxNumber(v);
      return mAh != null && mAh <= 1000;
    },
  },
  {
    id: "1000-5000",
    label: "1 001 – 5 000 mAh",
    test: (v) => {
      const mAh = maxNumber(v);
      return mAh != null && mAh > 1000 && mAh <= 5000;
    },
  },
  {
    id: "gt5000",
    label: "Plus de 5 000 mAh",
    test: (v) => {
      const mAh = maxNumber(v);
      return mAh != null && mAh > 5000;
    },
  },
];

const POWER_BUCKETS: Bucket[] = [
  {
    id: "le20",
    label: "20 W et moins",
    test: (v) => {
      const w = maxNumber(v);
      return w != null && w <= 20;
    },
  },
  {
    id: "21-45",
    label: "21 à 45 W",
    test: (v) => {
      const w = maxNumber(v);
      return w != null && w > 20 && w <= 45;
    },
  },
  {
    id: "gt45",
    label: "Plus de 45 W",
    test: (v) => {
      const w = maxNumber(v);
      return w != null && w > 45;
    },
  },
];

const RAM_BUCKETS: Bucket[] = [
  {
    id: "le2",
    label: "2 Go et moins",
    test: (v) => {
      const go = capacityGo(v);
      return go != null && go <= 2;
    },
  },
  {
    id: "3-4",
    label: "3 à 4 Go",
    test: (v) => {
      const go = capacityGo(v);
      return go != null && go > 2 && go <= 4;
    },
  },
  {
    id: "ge6",
    label: "6 Go et plus",
    test: (v) => {
      const go = capacityGo(v);
      return go != null && go >= 6;
    },
  },
];

const STORAGE_BUCKETS: Bucket[] = [
  {
    id: "le32",
    label: "32 Go et moins",
    test: (v) => {
      const go = capacityGo(v);
      return go != null && go <= 32;
    },
  },
  {
    id: "64",
    label: "64 Go",
    test: (v) => {
      const go = capacityGo(v);
      return go != null && go > 32 && go <= 64;
    },
  },
  {
    id: "128",
    label: "128 Go",
    test: (v) => {
      const go = capacityGo(v);
      return go != null && go > 64 && go <= 128;
    },
  },
  {
    id: "ge256",
    label: "256 Go et plus",
    test: (v) => {
      const go = capacityGo(v);
      return go != null && go > 128;
    },
  },
];

const NETWORK_BUCKETS: Bucket[] = [
  { id: "4g", label: "4G / 5G", test: (v) => /4g|5g/i.test(v) },
  { id: "2g", label: "2G", test: (v) => /2g/i.test(v) },
];

const CONNECTOR_BUCKETS: Bucket[] = [
  { id: "usbc", label: "USB-C", test: (v) => /usb-c|type-c/i.test(v) },
  { id: "lightning", label: "Lightning", test: (v) => /lightning/i.test(v) },
  { id: "microusb", label: "Micro USB", test: (v) => /micro[\s-]?usb/i.test(v) },
  { id: "usba", label: "USB-A", test: (v) => /usb-a/i.test(v) },
];

function audioType(product: CatalogProduct): string | null {
  if (/casque/i.test(product.name)) return "Casque";
  if (/enceinte/i.test(product.name)) return "Enceinte";
  return null;
}

// Ordre d'affichage des filtres techniques.
const SPEC_FACETS: SpecFacetDef[] = [
  { key: "Type", label: "Type", labelAr: "النوع", derive: audioType },
  { key: "Autonomie", label: "Autonomie", labelAr: "مدة البطارية", buckets: AUTONOMY_BUCKETS },
  { key: "Batterie", label: "Batterie", labelAr: "البطارية", buckets: BATTERY_BUCKETS },
  { key: "Puissance", label: "Puissance", labelAr: "القدرة", buckets: POWER_BUCKETS },
  { key: "RAM", label: "RAM", labelAr: "الذاكرة", buckets: RAM_BUCKETS },
  { key: "Stockage", label: "Stockage", labelAr: "التخزين", buckets: STORAGE_BUCKETS },
  { key: "Réseau", label: "Réseau", labelAr: "الشبكة", buckets: NETWORK_BUCKETS },
  { key: "Connecteurs", label: "Connecteur", labelAr: "الموصلات", buckets: CONNECTOR_BUCKETS },
  { key: "Bluetooth", label: "Bluetooth", labelAr: "بلوتوث", maxOptions: 6 },
  { key: "Connexion", label: "Connexion", labelAr: "الاتصال", maxOptions: 6 },
];

function buildFacetOptions(def: SpecFacetDef, products: CatalogProduct[]): FacetOption[] {
  const valueOf = (product: CatalogProduct) =>
    def.derive ? def.derive(product) : getSpec(product, def.key);

  if (def.buckets) {
    return def.buckets
      .map((bucket) => {
        const match = (product: CatalogProduct) => {
          const value = valueOf(product);
          return value != null && bucket.test(value);
        };
        return {
          value: bucket.id,
          label: bucket.label,
          count: products.filter(match).length,
          match,
        };
      })
      .filter((option) => option.count > 0);
  }

  const counts = new Map<string, number>();
  for (const product of products) {
    const value = valueOf(product);
    if (value) counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "fr"))
    .slice(0, def.maxOptions ?? 12)
    .map(([value, count]) => ({
      value,
      label: value,
      count,
      match: (product: CatalogProduct) => valueOf(product) === value,
    }));
}

/** Construit les facettes disponibles pour une liste de produits. */
export function buildFacets(products: CatalogProduct[]): Facet[] {
  const facets: Facet[] = [];
  if (products.length < 2) return facets;

  const brandCounts = new Map<string, number>();
  for (const product of products) {
    const brand = product.brand?.trim();
    if (brand) brandCounts.set(brand, (brandCounts.get(brand) ?? 0) + 1);
  }
  if (brandCounts.size > 1) {
    facets.push({
      id: "brand",
      label: "Marque",
      labelAr: "الماركة",
      options: [...brandCounts.entries()]
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "fr"))
        .map(([brand, count]) => ({
          value: brand,
          label: brand,
          count,
          match: (product: CatalogProduct) => product.brand === brand,
        })),
    });
  }

  const categoryCounts = new Map<string, { label: string; count: number }>();
  for (const product of products) {
    if (!product.categorySlug) continue;
    const current = categoryCounts.get(product.categorySlug);
    categoryCounts.set(product.categorySlug, {
      label: product.categoryName ?? product.categorySlug,
      count: (current?.count ?? 0) + 1,
    });
  }
  if (categoryCounts.size > 1) {
    facets.push({
      id: "category",
      label: "Catégorie",
      labelAr: "الفئة",
      options: [...categoryCounts.entries()]
        .sort((a, b) => b[1].count - a[1].count || a[1].label.localeCompare(b[1].label, "fr"))
        .map(([slug, info]) => ({
          value: slug,
          label: info.label,
          count: info.count,
          match: (product: CatalogProduct) => product.categorySlug === slug,
        })),
    });
  }

  for (const def of SPEC_FACETS) {
    const options = buildFacetOptions(def, products);
    if (options.length > 1) {
      facets.push({
        id: `spec:${def.key}`,
        label: def.label,
        labelAr: def.labelAr,
        options,
      });
    }
  }

  return facets;
}

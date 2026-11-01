"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/CartProvider";
import { useLanguage } from "@/components/LanguageProvider";
import { formatPrice } from "@/lib/format";
import { colorHex, productColors } from "@/lib/product-variants";
import ProductCard, { ProductCardData } from "@/components/ProductCard";

type ProductDetail = {
  id: string;
  name: string;
  nameAr: string | null;
  slug: string;
  sku: string;
  description: string | null;
  descriptionAr: string | null;
  price: number;
  comparePrice: number | null;
  stock: number;
  images: string[];
  specs: Record<string, string> | null;
  categoryName: string | null;
  categorySlug: string | null;
  brandName: string | null;
};

export default function ProductDetailClient({
  product,
  related,
}: {
  product: ProductDetail;
  related: ProductCardData[];
}) {
  const { addItem } = useCart();
  const { t, locale } = useLanguage();
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [pickedColor, setPickedColor] = useState<string | null>(null);

  const displayName = locale === "ar" && product.nameAr ? product.nameAr : product.name;
  const displayDesc = locale === "ar" && product.descriptionAr ? product.descriptionAr : product.description;
  const images = product.images.length > 0 ? product.images : ["/images/placeholder-product.svg"];
  const inStock = product.stock > 0;

  const colors = productColors(product.specs);
  // Un seul coloris : il est sélectionné d'office. Plusieurs coloris : le
  // client doit faire un choix explicite avant d'ajouter au panier.
  const selectedColor =
    pickedColor && colors.includes(pickedColor)
      ? pickedColor
      : colors.length === 1
        ? colors[0]
        : null;
  const needsColorChoice = colors.length > 1;
  const colorLabel = locale === "ar" ? "اللون" : "Couleur";
  const chooseColorLabel = locale === "ar" ? "اختر لونك" : "Choisissez votre coloris";
  const colorRequiredLabel =
    locale === "ar" ? "اختر اللون للمتابعة" : "Sélectionnez un coloris pour continuer";

  // Les specs sont stockées en JSON : on impose un ordre de lecture logique
  // (écran, puce, mémoire, photo, batterie...) plutôt que l'ordre alphabétique.
  const SPEC_ORDER = [
    "Écran",
    "Processeur",
    "RAM",
    "Stockage",
    "Caméras",
    "Caméra",
    "Batterie",
    "Autonomie",
    "Charge",
    "Puissance",
    "Norme",
    "Port",
    "Connecteurs",
    "Longueur",
    "Courant",
    "Bluetooth",
    "Portée",
    "Format",
    "Microphone",
    "Lecture",
    "Éclairage",
    "Étanchéité",
    "Résistance",
    "Réseau",
    "SIM",
    "Connectivité",
    "Système",
    "Compatibilité",
    "Certification",
    "Modèle",
    "Type",
    "Fonctions",
    "Poids",
    "Épaisseur",
    "Couleur",
  ];
  const specEntries = Object.entries(product.specs || {})
    .filter(([key]) => key !== "Couleurs" && key !== "couleurs")
    .sort(([a], [b]) => {
    const ia = SPEC_ORDER.indexOf(a);
    const ib = SPEC_ORDER.indexOf(b);
    if (ia !== -1 || ib !== -1) return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
    return a.localeCompare(b, "fr");
  });

  return (
    <div className="container-page py-8">
      <nav className="mb-4 flex flex-wrap gap-1 text-sm text-ink/50">
        <Link href="/" className="hover:text-accent">
          {t("home")}
        </Link>
        {product.categorySlug && (
          <span className="flex items-center gap-1">
            <span>/</span>
            <Link href={`/categories/${product.categorySlug}`} className="hover:text-accent">
              {product.categoryName}
            </Link>
          </span>
        )}
        <span className="flex items-center gap-1">
          <span>/</span>
          <span className="text-ink">{displayName}</span>
        </span>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <div>
          <div className="relative mb-3 aspect-square overflow-hidden rounded-lg border border-black/5 bg-[radial-gradient(circle_at_50%_40%,#ffffff,#e9e9e5)]">
            <Image src={images[activeImage]} alt={displayName} fill className="object-contain p-8 drop-shadow-[0_16px_28px_rgba(15,23,42,0.14)]" />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`relative h-16 w-16 overflow-hidden rounded border ${
                    activeImage === i ? "border-accent" : "border-black/10"
                  }`}
                >
                  <Image src={img} alt="" fill className="object-contain p-1" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {product.brandName && <p className="mb-1 text-sm font-medium text-accent">{product.brandName}</p>}
          <h1 className="font-sora text-2xl font-bold text-navy-900 sm:text-3xl">{displayName}</h1>
          <p className="mt-1 text-sm text-ink/40">SKU: {product.sku}</p>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-navy-900">{formatPrice(product.price)}</span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-lg text-ink/40 line-through">{formatPrice(product.comparePrice)}</span>
            )}
          </div>

          <p className={`mt-2 text-sm font-medium ${inStock ? "text-green-600" : "text-red-500"}`}>
            {inStock ? `${t("in_stock")} (${product.stock})` : t("out_of_stock")}
          </p>

          {displayDesc && <p className="mt-4 leading-relaxed text-ink/70">{displayDesc}</p>}

          {product.specs && Object.keys(product.specs).length > 0 && (
            <div className="mt-6">
              <h2 className="mb-2 font-semibold text-ink">Caractéristiques</h2>
              <table className="w-full text-sm">
                <tbody>
                  {specEntries.map(([k, v]) => (
                    <tr key={k} className="border-b border-black/5">
                      <td className="py-1.5 pr-4 font-medium text-ink/60">{k}</td>
                      <td className="py-1.5 text-ink">{String(v)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {colors.length > 0 && (
            <div className="mt-6">
              <div className="mb-2 flex flex-wrap items-baseline gap-x-2">
                <h2 className="font-semibold text-ink">{colorLabel}</h2>
                {selectedColor && <span className="text-sm text-ink/50">{selectedColor}</span>}
              </div>
              <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={chooseColorLabel}>
                {colors.map((color) => {
                  const active = selectedColor === color;
                  return (
                    <button
                      key={color}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => setPickedColor(color)}
                      className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                        active
                          ? "border-accent bg-accent/5 text-ink"
                          : "border-black/10 bg-white text-ink/70 hover:border-accent/60"
                      }`}
                    >
                      <span
                        className="h-4 w-4 rounded-full border border-black/15 shadow-inner"
                        style={{ backgroundColor: colorHex(color) }}
                        aria-hidden="true"
                      />
                      {color}
                      {active && (
                        <span className="text-accent" aria-hidden="true">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              {needsColorChoice && !selectedColor && (
                <p className="mt-1.5 text-xs text-ink/50">{colorRequiredLabel}</p>
              )}
            </div>
          )}

          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center rounded-md border border-black/10">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="px-3 py-2 text-lg text-ink hover:text-accent"
                aria-label="Diminuer"
              >
                −
              </button>
              <span className="w-10 text-center font-medium">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(product.stock || 1, q + 1))}
                className="px-3 py-2 text-lg text-ink hover:text-accent"
                aria-label="Augmenter"
              >
                +
              </button>
            </div>
            <button
              disabled={!inStock || (colors.length > 0 && !selectedColor)}
              onClick={() =>
                addItem(
                  {
                    productId: product.id,
                    name: product.name,
                    slug: product.slug,
                    sku: product.sku,
                    price: product.price,
                    image: images[0],
                    stock: product.stock,
                    color: selectedColor,
                  },
                  qty
                )
              }
              className="btn-dark flex-1 disabled:bg-ink/20"
            >
              {t("add_to_cart")}
            </button>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="mb-6 font-sora text-xl font-bold text-navy-900">Produits similaires</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

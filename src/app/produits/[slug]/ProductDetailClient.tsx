"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/CartProvider";
import { useLanguage } from "@/components/LanguageProvider";
import { formatPrice } from "@/lib/format";
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

  const displayName = locale === "ar" && product.nameAr ? product.nameAr : product.name;
  const displayDesc = locale === "ar" && product.descriptionAr ? product.descriptionAr : product.description;
  const images = product.images.length > 0 ? product.images : ["/images/placeholder-product.svg"];
  const inStock = product.stock > 0;

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
          <div className="relative mb-3 aspect-square overflow-hidden rounded-lg border border-black/5 bg-paper">
            <Image src={images[activeImage]} alt={displayName} fill className="object-contain p-8" />
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
                  {Object.entries(product.specs).map(([k, v]) => (
                    <tr key={k} className="border-b border-black/5">
                      <td className="py-1.5 pr-4 font-medium text-ink/60">{k}</td>
                      <td className="py-1.5 text-ink">{String(v)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
              disabled={!inStock}
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

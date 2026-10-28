"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "./CartProvider";
import { useLanguage } from "./LanguageProvider";
import { formatPrice } from "@/lib/format";

export type ProductCardData = {
  id: string;
  name: string;
  nameAr?: string | null;
  slug: string;
  sku: string;
  price: number;
  comparePrice?: number | null;
  stock: number;
  images: string[];
};

export default function ProductCard({ product }: { product: ProductCardData }) {
  const { addItem } = useCart();
  const { t, locale } = useLanguage();
  const image = product.images?.[0] || "/images/placeholder-product.svg";
  const displayName = locale === "ar" && product.nameAr ? product.nameAr : product.name;
  const inStock = product.stock > 0;

  return (
    <div className="card group flex flex-col overflow-hidden transition-shadow hover:shadow-md">
      <Link href={`/produits/${product.slug}`} className="relative block aspect-square bg-[radial-gradient(circle_at_50%_40%,#ffffff,#e9e9e5)]">
        <Image src={image} alt={displayName} fill className="object-contain p-4 drop-shadow-[0_10px_16px_rgba(15,23,42,0.12)] transition-transform group-hover:scale-105" />
        {product.comparePrice && product.comparePrice > product.price && (
          <span className="absolute left-2 top-2 rounded bg-amber px-2 py-0.5 text-xs font-bold text-navy-950">
            PROMO
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <Link href={`/produits/${product.slug}`} className="line-clamp-2 min-h-[2.5rem] text-sm font-medium text-ink hover:text-accent">
          {displayName}
        </Link>
        <div className="flex items-baseline gap-2">
          <span className="text-base font-bold text-navy-900">{formatPrice(product.price)}</span>
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="text-xs text-ink/40 line-through">{formatPrice(product.comparePrice)}</span>
          )}
        </div>
        <span className={`text-xs font-medium ${inStock ? "text-green-600" : "text-red-500"}`}>
          {inStock ? t("in_stock") : t("out_of_stock")}
        </span>
        <button
          disabled={!inStock}
          onClick={() =>
            addItem({
              productId: product.id,
              name: product.name,
              slug: product.slug,
              sku: product.sku,
              price: product.price,
              image,
              stock: product.stock,
            })
          }
          className="btn-dark mt-1 w-full disabled:bg-ink/20"
        >
          {t("add_to_cart")}
        </button>
      </div>
    </div>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { useLanguage } from "@/components/LanguageProvider";
import { formatPrice } from "@/lib/format";

const SHIPPING_COST = 7;

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();
  const { t } = useLanguage();

  if (items.length === 0) {
    return (
      <div className="container-page flex flex-col items-center justify-center py-24 text-center">
        <span className="mb-4 text-5xl">🛒</span>
        <p className="mb-6 text-lg text-ink/60">{t("empty_cart")}</p>
        <Link href="/" className="btn-primary">
          {t("home")}
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-8">
      <h1 className="mb-6 font-sora text-2xl font-bold text-navy-900">{t("cart")}</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => (
            <div key={item.productId} className="card flex items-center gap-4 p-3">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded bg-paper">
                <Image src={item.image || "/images/placeholder-product.svg"} alt={item.name} fill className="object-contain p-2" />
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/produits/${item.slug}`} className="line-clamp-2 text-sm font-medium text-ink hover:text-accent">
                  {item.name}
                </Link>
                <p className="mt-1 text-sm font-bold text-navy-900">{formatPrice(item.price)}</p>
              </div>
              <div className="flex items-center rounded-md border border-black/10">
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                  className="px-2.5 py-1.5 text-ink hover:text-accent"
                >
                  −
                </button>
                <span className="w-8 text-center text-sm">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  className="px-2.5 py-1.5 text-ink hover:text-accent"
                >
                  +
                </button>
              </div>
              <button
                onClick={() => removeItem(item.productId)}
                aria-label="Retirer"
                className="p-2 text-ink/40 hover:text-red-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        <div className="card h-fit p-5">
          <h2 className="mb-4 font-semibold text-ink">Résumé</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-ink/60">{t("subtotal")}</span>
              <span className="font-medium">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink/60">{t("shipping")}</span>
              <span className="font-medium">{formatPrice(SHIPPING_COST)}</span>
            </div>
            <div className="flex justify-between border-t border-black/5 pt-2 text-base font-bold text-navy-900">
              <span>{t("total")}</span>
              <span>{formatPrice(subtotal + SHIPPING_COST)}</span>
            </div>
          </div>
          <Link href="/commande" className="btn-primary mt-5 w-full">
            {t("checkout")}
          </Link>
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

export type ShowcaseItem = {
  id: string;
  sku: string;
  name: string;
  brand: string;
  price: number;
  image: string | null;
  slug: string;
  stock: number;
};

export default function HeroShowcase({ items }: { items: ShowcaseItem[] }) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const touchX = useRef<number | null>(null);

  const go = useCallback(
    (step: number) => {
      if (items.length < 2) return;
      setDirection(step > 0 ? "next" : "prev");
      setIndex((current) => (current + step + items.length) % items.length);
    },
    [items.length]
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") go(-1);
      if (event.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  if (!items.length) return null;

  const item = items[index];
  const price = Number(item.price).toLocaleString("fr-FR");
  const inStock = item.stock > 0;

  return (
    <div
      className="relative w-full"
      onTouchStart={(event) => {
        touchX.current = event.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(event) => {
        if (touchX.current === null) return;
        const delta = (event.changedTouches[0]?.clientX ?? touchX.current) - touchX.current;
        if (Math.abs(delta) > 40) go(delta > 0 ? -1 : 1);
        touchX.current = null;
      }}
    >
      <div className="relative overflow-hidden rounded-2xl border border-black/5 bg-[linear-gradient(115deg,#F1EDFF_0%,#FAF8FF_42%,#FFF3E8_100%)] shadow-sm">
        <Link
          href={`/produits/${item.slug}`}
          className="grid grid-cols-1 md:grid-cols-[minmax(0,46%)_minmax(0,1fr)]"
          aria-label={item.name}
        >
          {/* Visuel produit */}
          <div className="relative flex min-h-[250px] items-center justify-center px-8 pt-8 md:min-h-[400px] md:px-12 md:py-8">
            {item.image ? (
              <img
                key={item.id}
                src={item.image}
                alt={item.name}
                className={`hero-slide-${
                  direction === "next" ? "next" : "prev"
                } max-h-[210px] w-auto max-w-full object-contain drop-shadow-[0_30px_35px_rgba(40,20,90,0.22)] md:max-h-[330px]`}
              />
            ) : (
              <span className="text-7xl">📱</span>
            )}
          </div>

          {/* Informations */}
          <div className="flex flex-col justify-center gap-5 px-6 pb-8 pt-2 md:px-12 md:py-10 lg:px-16">
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold ${
                  inStock ? "bg-emerald-100/70 text-emerald-800" : "bg-amber/15 text-amber-dark"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${inStock ? "bg-emerald-500" : "bg-amber"}`}
                />
                {inStock ? "En stock" : "Sur commande"}
              </span>
              <span className="text-[11px] font-medium text-ink/35">
                {index + 1} / {items.length}
              </span>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">
                {item.brand || "EliteTech"}
              </p>
              <h2 className="mt-1 font-sora text-2xl font-extrabold leading-tight text-navy-900 md:text-4xl lg:text-5xl">
                {item.name}
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
              <p className="font-sora text-4xl font-extrabold tracking-tight text-accent md:text-6xl">
                {price} <span className="text-xl font-bold md:text-2xl">DT</span>
              </p>
              <span className="rounded-full bg-navy-950 px-6 py-3 text-sm font-semibold text-white">
                Voir le produit
              </span>
            </div>

            <p className="text-xs font-medium text-ink/45">
              Livraison partout en Tunisie · Paiement à la livraison
            </p>
          </div>
        </Link>

        {items.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Produit précédent"
              className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-black/5 bg-white/85 text-xl text-navy-900 shadow-md backdrop-blur transition hover:bg-accent hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent md:left-4"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Produit suivant"
              className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-black/5 bg-white/85 text-xl text-navy-900 shadow-md backdrop-blur transition hover:bg-accent hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent md:right-4"
            >
              ›
            </button>
          </>
        )}
      </div>

      {items.length > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          {items.map((it, i) => (
            <button
              key={it.id}
              type="button"
              onClick={() => {
                setDirection(i > index ? "next" : "prev");
                setIndex(i);
              }}
              aria-label={`Afficher ${it.name}`}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-7 bg-accent" : "w-1.5 bg-ink/20 hover:bg-ink/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

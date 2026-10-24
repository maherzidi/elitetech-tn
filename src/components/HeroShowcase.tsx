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
    <div className="relative w-full max-w-[340px] justify-self-end">
      <div
        className="pointer-events-none absolute -inset-8 rounded-[3rem] opacity-40 blur-3xl"
        style={{ background: "radial-gradient(circle, #F5811F 0%, transparent 70%)" }}
      />

      <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-white shadow-2xl">
        <Link href={`/produits/${item.slug}`} className="block" aria-label={item.name}>
          <div className="flex items-center justify-between px-5 pt-4">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold ${
                inStock ? "bg-emerald-50 text-emerald-700" : "bg-amber/10 text-amber-dark"
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

          <div className="flex h-60 items-center justify-center px-6 pt-2">
            {item.image ? (
              <img
                key={item.id}
                src={item.image}
                alt={item.name}
                className={`hero-slide-${
                  direction === "next" ? "next" : "prev"
                } max-h-full w-auto max-w-full object-contain drop-shadow-[0_18px_24px_rgba(0,0,0,0.16)]`}
              />
            ) : (
              <span className="text-6xl">📱</span>
            )}
          </div>

          <div className="px-5 pb-5 pt-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/40">
              {item.brand || "EliteTech"}
            </p>
            <h3 className="mt-0.5 font-sora text-lg font-bold leading-tight text-navy-900">
              {item.name}
            </h3>
            <div className="mt-3 flex items-end justify-between gap-3">
              <p className="font-sora text-2xl font-extrabold text-accent">
                {price} <span className="text-sm font-bold">DT</span>
              </p>
              <span className="rounded-full bg-navy-950 px-3.5 py-2 text-xs font-semibold text-white">
                Voir le produit
              </span>
            </div>
          </div>
        </Link>

        {items.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Produit précédent"
              className="absolute left-2 top-[42%] z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-black/5 bg-white/95 text-lg text-navy-900 shadow-md transition hover:bg-accent hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Produit suivant"
              className="absolute right-2 top-[42%] z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-black/5 bg-white/95 text-lg text-navy-900 shadow-md transition hover:bg-accent hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
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
                i === index ? "w-6 bg-accent" : "w-1.5 bg-white/30 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

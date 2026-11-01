"use client";

import Link from "next/link";
import ProductCard, { ProductCardData } from "@/components/ProductCard";
import HeroShowcase, { ShowcaseItem } from "@/components/HeroShowcase";
import { useLanguage } from "@/components/LanguageProvider";

export default function HomeClient({
  featured,
  showcase,
}: {
  featured: ProductCardData[];
  showcase: ShowcaseItem[];
}) {
  const { t } = useLanguage();

  return (
    <div>
      {/* Banniere produits */}
      <section className="bg-paper pt-5 md:pt-7">
        <div className="container-page">
          <HeroShowcase items={showcase} />
        </div>
      </section>

      {/* Featured products */}
      {featured.length > 0 && (
        <section className="container-page py-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-sora text-2xl font-bold text-navy-900">{t("featured_products")}</h2>
            <Link href="/produits" className="text-sm font-semibold text-accent hover:underline">
              Tout voir →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Bandeau Promotions */}
      <section className="bg-navy-950 py-14">
        <div className="container-page flex flex-col items-center gap-8 sm:flex-row sm:justify-between">
          <div className="text-center sm:text-left">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber">Offres EliteTech</p>
            <h2 className="font-sora text-3xl font-extrabold text-white">
              Des prix qui font
              <br />
              <span className="text-accent">la différence.</span>
            </h2>
            <p className="mt-3 max-w-sm text-white/60">
              Smartphones, téléphones, audio et accessoires : le stock réel de la boutique
              EliteTech à Hammamet, livré partout en Tunisie.
            </p>
            <Link href="/produits" className="btn-primary mt-5 inline-flex">
              Voir tous les produits
            </Link>
          </div>
          <div className="flex h-40 w-40 shrink-0 items-center justify-center rounded-full border-4 border-accent/30 bg-accent text-center text-white shadow-xl">
            <div>
              <p className="text-3xl font-extrabold">24-48h</p>
              <p className="text-xs">livraison</p>
            </div>
          </div>
        </div>
      </section>

      {/* Bandeau Reparation */}
      <section className="container-page py-14">
        <div className="grid grid-cols-1 gap-8 rounded-lg bg-navy-900 p-8 md:grid-cols-2 md:p-12">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber">Service réparation</p>
            <h2 className="font-sora text-2xl font-extrabold text-white sm:text-3xl">
              Votre smartphone mérite
              <br />
              <span className="text-accent">une seconde vie.</span>
            </h2>
            <p className="mt-3 max-w-md text-white/60">
              Demandez une estimation pour écran, batterie, connecteur, speaker, caméra ou diagnostic.
            </p>
            <Link href="/reparation" className="btn-primary mt-5 inline-flex">
              Demander un devis
            </Link>
          </div>
          <div className="flex items-center justify-center text-6xl">🔧📱</div>
        </div>
      </section>
    </div>
  );
}

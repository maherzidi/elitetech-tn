"use client";

import Link from "next/link";
import ProductCard, { ProductCardData } from "@/components/ProductCard";
import { useLanguage } from "@/components/LanguageProvider";

type Category = {
  id: string;
  name: string;
  nameAr: string | null;
  slug: string;
};

const CATEGORY_ICONS: Record<string, string> = {
  telephonie: "📱",
  informatique: "💻",
  "accessoires-informatique": "🖱️",
  gaming: "🎮",
  "maison-electromenager": "🏠",
  "reseau-securite": "🛜",
};

const TRUST_ITEMS = [
  { icon: "🚚", title: "Livraison rapide", text: "Partout en Tunisie" },
  { icon: "💳", title: "Paiement", text: "À la livraison" },
  { icon: "🛡️", title: "Garantie", text: "Produits sélectionnés" },
  { icon: "🔧", title: "Réparation", text: "Diagnostic & devis" },
];

export default function HomeClient({
  categories,
  featured,
}: {
  categories: Category[];
  featured: ProductCardData[];
}) {
  const { t, locale } = useLanguage();

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy-950">
        <div
          className="pointer-events-none absolute -right-24 top-1/2 h-[420px] w-[420px] -translate-y-1/2 rounded-full opacity-40 blur-3xl"
          style={{ background: "radial-gradient(circle, #F5811F 0%, transparent 70%)" }}
        />
        <div className="container-page relative grid grid-cols-1 items-center gap-10 py-14 md:grid-cols-2 md:py-24">
          <div>
            <p className="mb-3 inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber">
              Nouvelle collection
            </p>
            <h1 className="font-sora text-3xl font-extrabold leading-tight text-white sm:text-4xl md:text-5xl">
              La technologie
              <br />
              <span className="text-accent">à votre portée.</span>
            </h1>
            <p className="mt-4 max-w-md text-white/70">
              Smartphones, accessoires, informatique, composants électroniques et réparation. Une sélection moderne
              pour particuliers et professionnels.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/categories/telephonie" className="btn-primary">
                Acheter maintenant
              </Link>
              <Link href="/reparation" className="btn-outline-light">
                Demander un devis
              </Link>
            </div>
          </div>

          {/* Mockup telephone (CSS/SVG, pas d'image) */}
          <div className="relative hidden justify-self-end md:flex">
            <div className="relative h-80 w-44 rounded-[2rem] border-4 border-navy-700 bg-gradient-to-b from-navy-800 to-black shadow-2xl">
              <div className="absolute left-1/2 top-3 h-1.5 w-10 -translate-x-1/2 rounded-full bg-navy-700" />
              <div className="flex h-full flex-col items-center justify-center gap-1">
                <span className="font-sora text-lg font-extrabold text-white">ELITE</span>
                <span className="font-sora text-lg font-extrabold text-accent">TECH</span>
              </div>
              <div className="absolute -bottom-8 -right-16 w-44 rounded-lg bg-navy-900/90 p-3 shadow-xl backdrop-blur">
                <p className="text-xs text-white/60">À partir de</p>
                <p className="text-lg font-bold text-white">49 DT</p>
                <p className="text-xs text-white/50">Livraison en Tunisie</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-b border-black/5 bg-white py-8">
        <div className="container-page grid grid-cols-2 gap-6 sm:grid-cols-4">
          {TRUST_ITEMS.map((item) => (
            <div key={item.title} className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xl">
                {item.icon}
              </span>
              <div>
                <p className="text-sm font-semibold text-ink">{item.title}</p>
                <p className="text-xs text-ink/50">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="container-page py-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-sora text-2xl font-bold text-navy-900">{t("our_categories")}</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="card flex flex-col items-center gap-2 p-5 text-center transition-shadow hover:shadow-md"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-2xl">
                {CATEGORY_ICONS[cat.slug] || "🔌"}
              </span>
              <span className="text-sm font-medium text-ink">
                {locale === "ar" && cat.nameAr ? cat.nameAr : cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products */}
      {featured.length > 0 && (
        <section className="container-page py-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-sora text-2xl font-bold text-navy-900">{t("featured_products")}</h2>
            <Link href="/promotions" className="text-sm font-semibold text-accent hover:underline">
              Promotions →
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
              Catalogue prêt à être synchronisé avec vos dépôts, votre stock réel et vos prix.
            </p>
            <Link href="/promotions" className="btn-primary mt-5 inline-flex">
              Découvrir les offres
            </Link>
          </div>
          <div className="flex h-40 w-40 shrink-0 items-center justify-center rounded-full border-4 border-accent/30 bg-accent text-center text-white shadow-xl">
            <div>
              <p className="text-3xl font-extrabold">-20%</p>
              <p className="text-xs">sélection</p>
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

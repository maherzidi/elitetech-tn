"use client";

import Link from "next/link";
import ProductCard, { ProductCardData } from "./ProductCard";
import { useLanguage } from "./LanguageProvider";

type Crumb = { label: string; labelAr?: string | null; href?: string };

export default function ProductGrid({
  title,
  titleAr,
  breadcrumbs,
  subcategories,
  products,
}: {
  title: string;
  titleAr?: string | null;
  breadcrumbs: Crumb[];
  subcategories?: { name: string; nameAr: string | null; slug: string; href: string }[];
  products: ProductCardData[];
}) {
  const { t, locale } = useLanguage();
  const displayTitle = locale === "ar" && titleAr ? titleAr : title;

  return (
    <div className="container-page py-8">
      <nav className="mb-4 flex flex-wrap gap-1 text-sm text-ink/50">
        <Link href="/" className="hover:text-accent">
          {t("home")}
        </Link>
        {breadcrumbs.map((b, i) => (
          <span key={i} className="flex items-center gap-1">
            <span>/</span>
            {b.href ? (
              <Link href={b.href} className="hover:text-accent">
                {locale === "ar" && b.labelAr ? b.labelAr : b.label}
              </Link>
            ) : (
              <span className="text-ink">{locale === "ar" && b.labelAr ? b.labelAr : b.label}</span>
            )}
          </span>
        ))}
      </nav>

      <h1 className="mb-6 font-sora text-2xl font-bold text-navy-900">{displayTitle}</h1>

      {subcategories && subcategories.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          {subcategories.map((sub) => (
            <Link
              key={sub.slug}
              href={sub.href}
              className="rounded-full border border-black/10 bg-white px-4 py-1.5 text-sm font-medium text-ink hover:border-accent hover:text-accent"
            >
              {locale === "ar" && sub.nameAr ? sub.nameAr : sub.name}
            </Link>
          ))}
        </div>
      )}

      {products.length === 0 ? (
        <p className="py-16 text-center text-ink/50">Aucun produit dans cette catégorie pour le moment.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

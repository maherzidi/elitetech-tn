"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import ProductCard from "./ProductCard";
import { useLanguage } from "./LanguageProvider";
import {
  buildFacets,
  type CatalogProduct,
  type Facet,
  type FacetOption,
} from "@/lib/catalog";

type Crumb = { label: string; labelAr?: string | null; href?: string };

type SortKey = "relevance" | "price-asc" | "price-desc";

const UI_LABELS = {
  fr: {
    filters: "Filtres",
    close: "Fermer",
    sortBy: "Trier par",
    relevance: "Pertinence",
    priceAsc: "Prix croissant",
    priceDesc: "Prix décroissant",
    price: "Prix",
    min: "Min",
    max: "Max",
    availability: "Disponibilité",
    inStock: "En stock uniquement",
    reset: "Réinitialiser",
    clearAll: "Tout effacer",
    product: "produit",
    products: "produits",
    noResults: "Aucun produit ne correspond à ces filtres.",
    noResultsHint: "Élargissez le prix ou retirez un filtre pour voir plus de produits.",
    priceChip: "Prix",
    dt: "DT",
  },
  ar: {
    filters: "الفلاتر",
    close: "إغلاق",
    sortBy: "ترتيب حسب",
    relevance: "الصلة",
    priceAsc: "السعر: من الأقل إلى الأعلى",
    priceDesc: "السعر: من الأعلى إلى الأقل",
    price: "السعر",
    min: "من",
    max: "إلى",
    availability: "التوفر",
    inStock: "المتوفر فقط",
    reset: "إعادة التعيين",
    clearAll: "مسح الكل",
    product: "منتج",
    products: "منتجات",
    noResults: "لا يوجد منتج يطابق هذه الفلاتر.",
    noResultsHint: "وسّع نطاق السعر أو أزل فلتراً لعرض المزيد.",
    priceChip: "السعر",
    dt: "د.ت",
  },
} as const;

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
  products: CatalogProduct[];
}) {
  const { t, locale } = useLanguage();
  const labels = UI_LABELS[locale];
  const displayTitle = locale === "ar" && titleAr ? titleAr : title;

  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const [inStockOnly, setInStockOnly] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState<SortKey>("relevance");
  const [mobileOpen, setMobileOpen] = useState(false);

  const facets = useMemo(() => buildFacets(products), [products]);

  const bounds = useMemo(() => {
    if (products.length === 0) return { min: 0, max: 0 };
    const prices = products.map((product) => product.price);
    return {
      min: Math.floor(Math.min(...prices)),
      max: Math.ceil(Math.max(...prices)),
    };
  }, [products]);

  const filtered = useMemo(() => {
    const min = minPrice === "" ? bounds.min : Number(minPrice);
    const max = maxPrice === "" ? bounds.max : Number(maxPrice);

    const result = products.filter((product) => {
      if (inStockOnly && product.stock <= 0) return false;
      if (Number.isFinite(min) && product.price < min) return false;
      if (Number.isFinite(max) && product.price > max) return false;

      for (const facet of facets) {
        const chosen = selected[facet.id];
        if (!chosen?.length) continue;
        const options = facet.options.filter((option) => chosen.includes(option.value));
        if (options.length > 0 && !options.some((option) => option.match(product))) {
          return false;
        }
      }

      return true;
    });

    if (sort === "price-asc") return [...result].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") return [...result].sort((a, b) => b.price - a.price);
    return result;
  }, [products, facets, selected, inStockOnly, minPrice, maxPrice, sort, bounds]);

  function toggleValue(facetId: string, value: string) {
    setSelected((previous) => {
      const current = previous[facetId] ?? [];
      const next = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];
      return { ...previous, [facetId]: next };
    });
  }

  function resetFilters() {
    setSelected({});
    setInStockOnly(false);
    setMinPrice("");
    setMaxPrice("");
  }

  const selectedCount =
    Object.values(selected).reduce((total, values) => total + values.length, 0) +
    (inStockOnly ? 1 : 0) +
    (minPrice !== "" || maxPrice !== "" ? 1 : 0);

  const hasPriceFilter = minPrice !== "" || maxPrice !== "";

  const chips: { key: string; label: string; onRemove: () => void }[] = [];
  for (const facet of facets) {
    for (const value of selected[facet.id] ?? []) {
      const option = facet.options.find((item) => item.value === value);
      if (!option) continue;
      chips.push({
        key: `${facet.id}:${value}`,
        label: `${locale === "ar" && facet.labelAr ? facet.labelAr : facet.label}: ${option.label}`,
        onRemove: () => toggleValue(facet.id, value),
      });
    }
  }
  if (hasPriceFilter) {
    const min = minPrice === "" ? bounds.min : Number(minPrice);
    const max = maxPrice === "" ? bounds.max : Number(maxPrice);
    chips.push({
      key: "price",
      label: `${labels.priceChip}: ${min} – ${max} ${labels.dt}`,
      onRemove: () => {
        setMinPrice("");
        setMaxPrice("");
      },
    });
  }
  if (inStockOnly) {
    chips.push({
      key: "stock",
      label: labels.inStock,
      onRemove: () => setInStockOnly(false),
    });
  }

  const panel = (
    <div className="space-y-5">
      <section>
        <h3 className="mb-2 text-sm font-semibold text-navy-900">{labels.price}</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            aria-label={labels.min}
            placeholder={labels.min}
            min={bounds.min}
            max={bounds.max}
            value={minPrice}
            onChange={(event) => setMinPrice(event.target.value)}
            className="w-full rounded-md border border-black/10 bg-white px-2.5 py-2 text-sm text-ink placeholder:text-ink/40 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
          <span className="text-ink/30">–</span>
          <input
            type="number"
            inputMode="numeric"
            aria-label={labels.max}
            placeholder={labels.max}
            min={bounds.min}
            max={bounds.max}
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value)}
            className="w-full rounded-md border border-black/10 bg-white px-2.5 py-2 text-sm text-ink placeholder:text-ink/40 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
        <p className="mt-1.5 text-xs text-ink/40">
          {bounds.min} – {bounds.max} {labels.dt}
        </p>
      </section>

      {facets.map((facet) => (
        <FacetBlock
          key={facet.id}
          facet={facet}
          locale={locale}
          selected={selected[facet.id] ?? []}
          onToggle={(value) => toggleValue(facet.id, value)}
        />
      ))}

      <section>
        <h3 className="mb-2 text-sm font-semibold text-navy-900">{labels.availability}</h3>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-ink/80">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(event) => setInStockOnly(event.target.checked)}
            className="h-4 w-4 rounded border-black/20 accent-accent"
          />
          {labels.inStock}
        </label>
      </section>

      <button
        type="button"
        onClick={resetFilters}
        disabled={selectedCount === 0}
        className="w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm font-semibold text-ink transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
      >
        {labels.reset}
      </button>
    </div>
  );

  return (
    <div className="container-page py-8">
      <nav className="mb-4 flex flex-wrap gap-1 text-sm text-ink/50">
        <Link href="/" className="hover:text-accent">
          {t("home")}
        </Link>
        {breadcrumbs.map((crumb, index) => (
          <span key={index} className="flex items-center gap-1">
            <span>/</span>
            {crumb.href ? (
              <Link href={crumb.href} className="hover:text-accent">
                {locale === "ar" && crumb.labelAr ? crumb.labelAr : crumb.label}
              </Link>
            ) : (
              <span className="text-ink">
                {locale === "ar" && crumb.labelAr ? crumb.labelAr : crumb.label}
              </span>
            )}
          </span>
        ))}
      </nav>

      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-sora text-2xl font-bold text-navy-900">{displayTitle}</h1>
          <p className="mt-1 text-sm text-ink/50">
            {filtered.length} {filtered.length > 1 ? labels.products : labels.product}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="btn-secondary lg:hidden"
          >
            {labels.filters}
            {selectedCount > 0 && (
              <span className="rounded-full bg-accent px-1.5 text-xs font-bold text-white">
                {selectedCount}
              </span>
            )}
          </button>
          <label className="flex items-center gap-2 text-sm text-ink/60">
            <span className="hidden sm:inline">{labels.sortBy}</span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortKey)}
              className="rounded-md border border-black/10 bg-white px-3 py-2 text-sm font-medium text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="relevance">{labels.relevance}</option>
              <option value="price-asc">{labels.priceAsc}</option>
              <option value="price-desc">{labels.priceDesc}</option>
            </select>
          </label>
        </div>
      </div>

      {subcategories && subcategories.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
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

      <div className="flex items-start gap-6">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="card sticky top-40 max-h-[calc(100vh-11rem)] overflow-y-auto p-4">{panel}</div>
        </aside>

        <div className="min-w-0 flex-1">
          {chips.length > 0 && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {chips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={chip.onRemove}
                  className="flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-medium text-accent-dark transition-colors hover:bg-accent/20"
                >
                  {chip.label}
                  <span aria-hidden="true">✕</span>
                </button>
              ))}
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs font-semibold text-ink/50 underline-offset-2 hover:text-accent hover:underline"
              >
                {labels.clearAll}
              </button>
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="card flex flex-col items-center gap-3 px-6 py-14 text-center">
              <p className="text-ink/70">{labels.noResults}</p>
              <p className="text-sm text-ink/40">{labels.noResultsHint}</p>
              <button type="button" onClick={resetFilters} className="btn-secondary mt-1">
                {labels.reset}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            type="button"
            aria-label={labels.close}
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-black/40"
          />
          <div className="absolute inset-y-0 left-0 w-[86%] max-w-sm overflow-y-auto bg-white p-5 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-sora text-lg font-bold text-navy-900">{labels.filters}</h2>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label={labels.close}
                className="flex h-8 w-8 items-center justify-center rounded-full text-ink/60 hover:bg-black/5"
              >
                ✕
              </button>
            </div>
            {panel}
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="btn-primary mt-5 w-full"
            >
              {labels.close}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FacetBlock({
  facet,
  locale,
  selected,
  onToggle,
}: {
  facet: Facet;
  locale: "fr" | "ar";
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <section>
      <h3 className="mb-2 text-sm font-semibold text-navy-900">
        {locale === "ar" && facet.labelAr ? facet.labelAr : facet.label}
      </h3>
      <div className="space-y-1">
        {facet.options.map((option) => (
          <FacetCheckbox
            key={option.value}
            option={option}
            checked={selected.includes(option.value)}
            onToggle={() => onToggle(option.value)}
          />
        ))}
      </div>
    </section>
  );
}

function FacetCheckbox({
  option,
  checked,
  onToggle,
}: {
  option: FacetOption;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-sm text-ink/80 hover:bg-black/[0.03]">
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="h-4 w-4 rounded border-black/20 accent-accent"
      />
      <span className="flex-1 leading-snug">{option.label}</span>
      <span className="text-xs tabular-nums text-ink/35">{option.count}</span>
    </label>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { useLanguage } from "./LanguageProvider";

type Cat = {
  id: string;
  name: string;
  nameAr: string | null;
  slug: string;
  children: { id: string; name: string; nameAr: string | null; slug: string }[];
};

export default function CategoryNav({ categories }: { categories: Cat[] }) {
  const { locale, t } = useLanguage();
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <nav className="hidden lg:block border-b border-black/5 bg-white">
      <div className="container-page">
        <ul className="flex items-stretch gap-1 text-sm font-medium">
          <li>
            <Link href="/" className="flex h-11 items-center px-3 text-ink hover:text-accent">
              {t("home")}
            </Link>
          </li>
          {categories.map((cat) => (
            <li
              key={cat.id}
              className="relative"
              onMouseEnter={() => setOpenId(cat.id)}
              onMouseLeave={() => setOpenId(null)}
            >
              <Link
                href={`/categories/${cat.slug}`}
                className="flex h-11 items-center gap-1 px-3 text-ink hover:text-accent"
              >
                {locale === "ar" && cat.nameAr ? cat.nameAr : cat.name}
                {cat.children.length > 0 && (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                  </svg>
                )}
              </Link>
              {openId === cat.id && cat.children.length > 0 && (
                <div className="absolute left-0 top-11 z-40 grid w-64 grid-cols-1 gap-1 rounded-b-lg border border-black/5 bg-white p-3 shadow-lg">
                  {cat.children.map((sub) => (
                    <Link
                      key={sub.id}
                      href={`/categories/${cat.slug}/${sub.slug}`}
                      className="rounded px-2 py-1.5 text-ink/80 hover:bg-paper hover:text-accent"
                    >
                      {locale === "ar" && sub.nameAr ? sub.nameAr : sub.name}
                    </Link>
                  ))}
                </div>
              )}
            </li>
          ))}
          <li>
            <Link href="/promotions" className="flex h-11 items-center px-3 font-semibold text-accent hover:text-accent-dark">
              Promotions
            </Link>
          </li>
          <li>
            <Link href="/reparation" className="flex h-11 items-center px-3 text-ink hover:text-accent">
              Réparation
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

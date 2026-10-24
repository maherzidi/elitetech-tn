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
        <ul className="flex items-stretch whitespace-nowrap text-[13px] font-medium">
          <li className="shrink-0">
            <Link href="/" className="flex h-10 items-center px-2 text-ink hover:text-accent">
              {t("home")}
            </Link>
          </li>
          {categories.map((cat, index) => (
            <li
              key={cat.id}
              className="relative shrink-0"
              onMouseEnter={() => setOpenId(cat.id)}
              onMouseLeave={() => setOpenId(null)}
            >
              <Link
                href={`/categories/${cat.slug}`}
                className="flex h-10 items-center px-2 text-ink hover:text-accent"
              >
                {locale === "ar" && cat.nameAr ? cat.nameAr : cat.name}
              </Link>
              {openId === cat.id && cat.children.length > 0 && (
                <div
                  className={`absolute top-10 z-40 grid w-64 max-w-[80vw] grid-cols-1 gap-1 rounded-b-lg border border-black/5 bg-white p-3 text-left shadow-lg ${
                    index >= categories.length - 3 ? "right-0" : "left-0"
                  }`}
                >
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
          <li className="shrink-0">
            <Link href="/promotions" className="flex h-10 items-center px-2 font-semibold text-accent hover:text-accent-dark">
              Promotions
            </Link>
          </li>
          <li className="shrink-0">
            <Link href="/reparation" className="flex h-10 items-center px-2 text-ink hover:text-accent">
              Réparation
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

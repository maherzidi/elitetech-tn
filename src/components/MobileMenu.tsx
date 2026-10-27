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

export default function MobileMenu({ categories }: { categories: Cat[] }) {
  const { locale, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [openCat, setOpenCat] = useState<string | null>(null);

  return (
    <div className="lg:hidden">
      <button
        aria-label="Menu"
        onClick={() => setOpen(true)}
        className="flex h-9 w-9 items-center justify-center rounded-md text-white"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div className="w-4/5 max-w-xs overflow-y-auto bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-sora font-bold text-navy-900">{t("all_categories")}</span>
              <button onClick={() => setOpen(false)} aria-label="Fermer" className="p-1 text-ink">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <ul className="space-y-1 text-sm">
              {categories.map((cat) => (
                <li key={cat.id} className="border-b border-black/5 pb-1">
                  <button
                    className="flex w-full items-center justify-between rounded px-2 py-2 text-left font-bold text-ink hover:bg-paper"
                    onClick={() => setOpenCat(openCat === cat.id ? null : cat.id)}
                  >
                    {locale === "ar" && cat.nameAr ? cat.nameAr : cat.name}
                    <span>{openCat === cat.id ? "−" : "+"}</span>
                  </button>
                  {openCat === cat.id && (
                    <div className="ml-3 flex flex-col">
                      <Link
                        href={`/categories/${cat.slug}`}
                        onClick={() => setOpen(false)}
                        className="rounded px-2 py-1.5 text-accent hover:bg-paper"
                      >
                        {t("all_categories")}
                      </Link>
                      {cat.children.map((sub) => (
                        <Link
                          key={sub.id}
                          href={`/categories/${cat.slug}/${sub.slug}`}
                          onClick={() => setOpen(false)}
                          className="rounded px-2 py-1.5 text-ink/80 hover:bg-paper"
                        >
                          {locale === "ar" && sub.nameAr ? sub.nameAr : sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </li>
              ))}
              <li className="border-b border-black/5 pb-1">
                <Link href="/promotions" onClick={() => setOpen(false)} className="block rounded px-2 py-2 font-bold text-accent hover:bg-paper">
                  Promotions
                </Link>
              </li>
              <li>
                <Link href="/reparation" onClick={() => setOpen(false)} className="block rounded px-2 py-2 font-bold text-ink hover:bg-paper">
                  Réparation
                </Link>
              </li>
            </ul>
          </div>
          <div className="flex-1 bg-black/40" onClick={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
}

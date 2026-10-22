"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";
import { useLanguage } from "./LanguageProvider";

export default function CartIcon() {
  const { count } = useCart();
  const { t } = useLanguage();

  return (
    <Link href="/panier" className="relative flex items-center gap-2 text-white hover:text-amber transition-colors">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 1.885-4.226 2.242-6.05a1.5 1.5 0 00-1.478-1.777H5.106M7.5 14.25L5.106 5.408M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
      </svg>
      <span className="hidden sm:inline text-sm font-medium">{t("cart")}</span>
      {count > 0 && (
        <span className="absolute -top-2 -right-3 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber px-1 text-[11px] font-bold text-navy-950">
          {count}
        </span>
      )}
    </Link>
  );
}

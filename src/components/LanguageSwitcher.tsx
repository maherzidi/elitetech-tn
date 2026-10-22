"use client";

import { useLanguage } from "./LanguageProvider";

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();

  return (
    <div className="flex items-center gap-1 rounded-md border border-white/20 p-0.5 text-xs">
      <button
        onClick={() => setLocale("fr")}
        className={`rounded px-2 py-1 transition-colors ${
          locale === "fr" ? "bg-white text-navy-900 font-semibold" : "text-white/80 hover:text-white"
        }`}
      >
        FR
      </button>
      <button
        onClick={() => setLocale("ar")}
        className={`rounded px-2 py-1 transition-colors ${
          locale === "ar" ? "bg-white text-navy-900 font-semibold" : "text-white/80 hover:text-white"
        }`}
      >
        عربي
      </button>
    </div>
  );
}

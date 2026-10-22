"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { dictionary, Locale, DictKey } from "@/lib/i18n";

type LanguageContextType = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: DictKey) => string;
  dir: "ltr" | "rtl";
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("fr");

  useEffect(() => {
    const saved = window.localStorage.getItem("elitetech_locale") as Locale | null;
    if (saved === "fr" || saved === "ar") {
      setLocaleState(saved);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);

  function setLocale(l: Locale) {
    setLocaleState(l);
    window.localStorage.setItem("elitetech_locale", l);
  }

  function t(key: DictKey) {
    return dictionary[locale][key] ?? dictionary.fr[key];
  }

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, dir: locale === "ar" ? "rtl" : "ltr" }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage doit être utilisé dans LanguageProvider");
  return ctx;
}

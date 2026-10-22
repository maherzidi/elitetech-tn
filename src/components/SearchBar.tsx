"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLanguage } from "./LanguageProvider";

export default function SearchBar() {
  const router = useRouter();
  const { t } = useLanguage();
  const [q, setQ] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (q.trim()) {
      router.push(`/recherche?q=${encodeURIComponent(q.trim())}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-xl">
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t("search_placeholder")}
        className="w-full rounded-md border-0 py-2.5 pl-4 pr-11 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-amber"
      />
      <button
        type="submit"
        aria-label="Rechercher"
        className="absolute inset-y-0 right-0 flex items-center px-3 text-navy-900/70 hover:text-accent"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10.5A6.5 6.5 0 114 10.5a6.5 6.5 0 0113 0z" />
        </svg>
      </button>
    </form>
  );
}

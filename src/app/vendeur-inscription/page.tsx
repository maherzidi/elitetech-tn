"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SellerSignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/vendeur/inscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Erreur lors de l'inscription.");
      setLoading(false);
      return;
    }
    setSuccess(true);
  }

  if (success) {
    return (
      <div className="container-page flex flex-col items-center py-24 text-center">
        <span className="mb-4 text-5xl">✅</span>
        <h1 className="mb-2 font-sora text-2xl font-bold text-navy-900">Demande envoyée !</h1>
        <p className="mb-6 max-w-md text-ink/60">
          Ton compte vendeur a bien été créé et est en attente de validation par notre équipe. Tu recevras ton code
          vendeur une fois approuvé — connecte-toi régulièrement pour vérifier ton statut.
        </p>
        <Link href="/vendeur-connexion" className="btn-primary">
          Aller à la connexion
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page flex justify-center py-16">
      <form onSubmit={handleSubmit} className="w-full max-w-md card p-8">
        <h1 className="mb-1 font-sora text-xl font-bold text-navy-900">Devenir vendeur EliteTech</h1>
        <p className="mb-6 text-sm text-ink/50">
          Crée ton compte, notre équipe valide ta demande, puis tu reçois un code personnel à partager avec tes
          clients.
        </p>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Nom complet *</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-md border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Téléphone *</label>
            <input
              required
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full rounded-md border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Email *</label>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-md border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Mot de passe *</label>
            <input
              required
              type="password"
              minLength={6}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full rounded-md border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary mt-6 w-full">
          {loading ? "..." : "Créer mon compte vendeur"}
        </button>

        <p className="mt-4 text-center text-sm text-ink/50">
          Déjà vendeur ?{" "}
          <Link href="/vendeur-connexion" className="text-accent hover:underline">
            Se connecter
          </Link>
        </p>
      </form>
    </div>
  );
}

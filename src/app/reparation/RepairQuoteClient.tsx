"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/format";

type IssueType = {
  id: string;
  name: string;
  nameAr: string | null;
  minPrice: number;
  maxPrice: number;
};

export default function RepairQuoteClient({ issueTypes }: { issueTypes: IssueType[] }) {
  const [deviceModel, setDeviceModel] = useState("");
  const [issueTypeId, setIssueTypeId] = useState(issueTypes[0]?.id || "");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const selectedIssue = issueTypes.find((t) => t.id === issueTypeId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/reparation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceModel, issueTypeId, customerName: name, customerPhone: phone, notes }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Une erreur est survenue.");
        setSubmitting(false);
        return;
      }
      setSuccess(
        "Merci ! Ta demande de devis a bien été envoyée, notre équipe te contacte rapidement pour confirmer le prix et le délai."
      );
    } catch {
      setError("Impossible de contacter le serveur.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="container-page flex flex-col items-center py-20 text-center">
        <span className="mb-4 text-5xl">🔧</span>
        <h1 className="mb-2 font-sora text-2xl font-bold text-navy-900">Demande envoyée !</h1>
        <p className="max-w-md text-ink/60">{success}</p>
      </div>
    );
  }

  return (
    <div className="bg-navy-950 py-14">
      <div className="container-page grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-start">
        <div className="text-white">
          <p className="mb-3 inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-amber">
            Service réparation
          </p>
          <h1 className="font-sora text-3xl font-extrabold leading-tight sm:text-4xl">
            Votre smartphone mérite
            <br />
            <span className="text-accent">une seconde vie.</span>
          </h1>
          <p className="mt-4 max-w-md text-white/70">
            Demandez une estimation pour écran, batterie, connecteur, speaker, caméra ou diagnostic. Devis indicatif
            en quelques secondes, confirmation rapide par notre équipe.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4 bg-white p-6">
          <div className="rounded-md bg-paper p-3 text-center">
            <p className="text-xs font-medium uppercase tracking-wide text-ink/40">Devis indicatif</p>
            {selectedIssue ? (
              <p className="mt-1 text-2xl font-bold text-navy-900">
                {formatPrice(selectedIssue.minPrice)} — {formatPrice(selectedIssue.maxPrice)}
              </p>
            ) : (
              <p className="mt-1 text-sm text-ink/50">Choisissez une panne pour voir une estimation</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Modèle de l&apos;appareil *</label>
            <input
              required
              value={deviceModel}
              onChange={(e) => setDeviceModel(e.target.value)}
              placeholder="Ex: Samsung Galaxy S24"
              className="w-full rounded-md border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Panne *</label>
            <select
              required
              value={issueTypeId}
              onChange={(e) => setIssueTypeId(e.target.value)}
              className="w-full rounded-md border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            >
              {issueTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Nom et prénom *</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-md border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Téléphone *</label>
              <input
                required
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-md border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Détails (optionnel)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
          {issueTypes.length === 0 && (
            <p className="text-sm text-ink/50">Aucun type de panne configuré pour le moment.</p>
          )}

          <button type="submit" disabled={submitting || issueTypes.length === 0} className="btn-primary w-full">
            {submitting ? "..." : "Demander un devis"}
          </button>
        </form>
      </div>
    </div>
  );
}

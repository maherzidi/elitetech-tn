"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Erreur de connexion.");
      setLoading(false);
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-950 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-lg bg-white p-8 shadow-lg">
        <h1 className="mb-1 font-sora text-xl font-bold text-navy-900">EliteTech Admin</h1>
        <p className="mb-6 text-sm text-ink/50">Connectez-vous pour gérer votre boutique.</p>

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-ink">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <div className="mb-6">
          <label className="mb-1 block text-sm font-medium text-ink">Mot de passe</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "..." : "Se connecter"}
        </button>
      </form>
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/components/CartProvider";
import { useLanguage } from "@/components/LanguageProvider";
import { formatPrice } from "@/lib/format";

const SHIPPING_COST = 7;

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { t } = useLanguage();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    notes: "",
    sellerCode: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (items.length === 0 && !submitting) {
    return (
      <div className="container-page py-24 text-center text-ink/60">
        <p>{t("empty_cart")}</p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            name: form.name,
            phone: form.phone,
            email: form.email,
            address: form.address,
            city: form.city,
            notes: form.notes,
          },
          sellerCode: form.sellerCode || undefined,
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Une erreur est survenue, merci de réessayer.");
        setSubmitting(false);
        return;
      }
      clearCart();
      router.push(`/commande/confirmation/${data.orderId}`);
    } catch {
      setError("Impossible de contacter le serveur. Vérifiez votre connexion.");
      setSubmitting(false);
    }
  }

  return (
    <div className="container-page py-8">
      <h1 className="mb-6 font-sora text-2xl font-bold text-navy-900">{t("checkout")}</h1>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <form onSubmit={handleSubmit} className="card space-y-4 p-5 lg:col-span-2">
          <h2 className="font-semibold text-ink">{t("delivery_info")}</h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label={t("full_name")} required value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
            <Field label={t("phone")} required type="tel" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
          </div>
          <Field label={t("email")} type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
          <Field label={t("address")} required value={form.address} onChange={(v) => setForm({ ...form, address: v })} />
          <Field label={t("city")} required value={form.city} onChange={(v) => setForm({ ...form, city: v })} />

          <div>
            <label className="mb-1 block text-sm font-medium text-ink">{t("order_notes")}</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              className="w-full rounded-md border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Code vendeur (optionnel)</label>
            <input
              value={form.sellerCode}
              onChange={(e) => setForm({ ...form, sellerCode: e.target.value.toUpperCase() })}
              placeholder="Ex: ABC1234"
              className="w-full rounded-md border border-black/10 px-3 py-2 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <p className="mt-1 text-xs text-ink/40">
              Un vendeur t&apos;a partagé un code ? Le code n&apos;est pris en compte que pour un paiement en ligne.
            </p>
          </div>

          <div>
            <h2 className="mb-2 font-semibold text-ink">{t("payment_method")}</h2>
            <div className="space-y-2">
              <label className="flex items-center gap-2 rounded-md border border-accent bg-accent/5 p-3 text-sm">
                <input type="radio" name="payment" checked readOnly />
                {t("cash_on_delivery")}
              </label>
              <label className="flex items-center gap-2 rounded-md border border-black/10 p-3 text-sm text-ink/40">
                <input type="radio" name="payment" disabled />
                {t("online_payment_soon")}
              </label>
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? "..." : t("confirm_order")}
          </button>
        </form>

        <div className="card h-fit p-5">
          <h2 className="mb-4 font-semibold text-ink">Résumé</h2>
          <ul className="mb-4 space-y-2 text-sm">
            {items.map((i) => (
              <li key={i.productId} className="flex justify-between gap-2">
                <span className="text-ink/70">
                  {i.name} × {i.quantity}
                </span>
                <span className="font-medium">{formatPrice(i.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="space-y-2 border-t border-black/5 pt-3 text-sm">
            <div className="flex justify-between">
              <span className="text-ink/60">{t("subtotal")}</span>
              <span className="font-medium">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink/60">{t("shipping")}</span>
              <span className="font-medium">{formatPrice(SHIPPING_COST)}</span>
            </div>
            <div className="flex justify-between border-t border-black/5 pt-2 text-base font-bold text-navy-900">
              <span>{t("total")}</span>
              <span>{formatPrice(subtotal + SHIPPING_COST)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-ink">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
      />
    </div>
  );
}

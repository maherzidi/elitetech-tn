import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  EN_ATTENTE: "En attente",
  CONFIRMEE: "Confirmée",
  EN_PREPARATION: "En préparation",
  EXPEDIEE: "Expédiée",
  LIVREE: "Livrée",
  ANNULEE: "Annulée",
};

const STATUS_COLORS: Record<string, string> = {
  EN_ATTENTE: "bg-amber/20 text-amber-dark",
  CONFIRMEE: "bg-blue-100 text-blue-700",
  EN_PREPARATION: "bg-purple-100 text-purple-700",
  EXPEDIEE: "bg-indigo-100 text-indigo-700",
  LIVREE: "bg-green-100 text-green-700",
  ANNULEE: "bg-red-100 text-red-700",
};

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="mb-6 font-sora text-2xl font-bold text-navy-900">Commandes ({orders.length})</h1>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[700px] text-sm">
          <thead>
            <tr className="border-b border-black/5 text-left text-ink/50">
              <th className="p-3">N° commande</th>
              <th className="p-3">Client</th>
              <th className="p-3">Ville</th>
              <th className="p-3">Total</th>
              <th className="p-3">Statut</th>
              <th className="p-3">Date</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-black/5">
                <td className="p-3 font-medium text-ink">{o.orderNumber}</td>
                <td className="p-3">
                  {o.customerName}
                  <div className="text-xs text-ink/40">{o.customerPhone}</div>
                </td>
                <td className="p-3 text-ink/60">{o.city}</td>
                <td className="p-3 font-medium">{formatPrice(Number(o.total))}</td>
                <td className="p-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[o.status]}`}>
                    {STATUS_LABELS[o.status]}
                  </span>
                </td>
                <td className="p-3 text-ink/50">{new Date(o.createdAt).toLocaleDateString("fr-FR")}</td>
                <td className="p-3">
                  <Link href={`/admin/commandes/${o.id}`} className="text-accent hover:underline">
                    Détails
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <p className="p-6 text-center text-ink/50">Aucune commande pour le moment.</p>}
      </div>
    </div>
  );
}

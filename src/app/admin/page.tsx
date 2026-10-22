import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [productCount, pendingOrders, recentOrders, revenueAgg] = await Promise.all([
    prisma.product.count(),
    prisma.order.count({ where: { status: "EN_ATTENTE" } }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.order.aggregate({ _sum: { total: true }, where: { status: { not: "ANNULEE" } } }),
  ]);

  // Fallback low-stock query (comparaison entre deux colonnes non supportee nativement partout)
  const allActiveProducts = await prisma.product.findMany({
    where: { isActive: true },
    select: { id: true, name: true, stock: true, lowStockAlert: true, sku: true },
  });
  const lowStockProducts = allActiveProducts.filter((p) => p.stock <= p.lowStockAlert).slice(0, 6);

  const stats = [
    { label: "Produits au catalogue", value: productCount },
    { label: "Commandes en attente", value: pendingOrders },
    { label: "Produits en stock faible", value: lowStockProducts.length },
    { label: "Chiffre d'affaires (commandes)", value: formatPrice(Number(revenueAgg._sum.total || 0)) },
  ];

  return (
    <div>
      <h1 className="mb-6 font-sora text-2xl font-bold text-navy-900">Tableau de bord</h1>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-5">
            <p className="text-sm text-ink/50">{s.label}</p>
            <p className="mt-1 text-2xl font-bold text-navy-900">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-ink">Dernières commandes</h2>
            <Link href="/admin/commandes" className="text-sm text-accent hover:underline">
              Tout voir
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-ink/50">Aucune commande pour le moment.</p>
          ) : (
            <ul className="divide-y divide-black/5">
              {recentOrders.map((o) => (
                <li key={o.id} className="flex items-center justify-between py-2 text-sm">
                  <div>
                    <Link href={`/admin/commandes/${o.id}`} className="font-medium text-ink hover:text-accent">
                      {o.orderNumber}
                    </Link>
                    <p className="text-ink/50">{o.customerName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatPrice(Number(o.total))}</p>
                    <p className="text-xs text-ink/50">{o.status}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-ink">Stock faible</h2>
            <Link href="/admin/stock" className="text-sm text-accent hover:underline">
              Gérer le stock
            </Link>
          </div>
          {lowStockProducts.length === 0 ? (
            <p className="text-sm text-ink/50">Tout est bien approvisionné 👍</p>
          ) : (
            <ul className="divide-y divide-black/5">
              {lowStockProducts.map((p) => (
                <li key={p.id} className="flex items-center justify-between py-2 text-sm">
                  <span>{p.name}</span>
                  <span className="font-bold text-red-500">{p.stock} restant(s)</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

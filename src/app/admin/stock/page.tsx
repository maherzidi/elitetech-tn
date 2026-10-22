import { prisma } from "@/lib/prisma";
import { adjustStock } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminStockPage() {
  const products = await prisma.product.findMany({
    orderBy: { stock: "asc" },
    select: { id: true, name: true, sku: true, stock: true, lowStockAlert: true },
  });

  const recentMovements = await prisma.stockMovement.findMany({
    orderBy: { createdAt: "desc" },
    take: 15,
    include: { product: { select: { name: true } } },
  });

  return (
    <div>
      <h1 className="mb-6 font-sora text-2xl font-bold text-navy-900">Stock & inventaire</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card overflow-x-auto lg:col-span-2">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-black/5 text-left text-ink/50">
                <th className="p-3">Produit</th>
                <th className="p-3">SKU</th>
                <th className="p-3">Stock actuel</th>
                <th className="p-3">Ajuster</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-black/5">
                  <td className="p-3 font-medium text-ink">{p.name}</td>
                  <td className="p-3 text-ink/50">{p.sku}</td>
                  <td className={`p-3 font-bold ${p.stock <= p.lowStockAlert ? "text-red-500" : "text-ink"}`}>
                    {p.stock}
                  </td>
                  <td className="p-3">
                    <form action={adjustStock} className="flex items-center gap-1.5">
                      <input type="hidden" name="productId" value={p.id} />
                      <input
                        type="number"
                        name="delta"
                        placeholder="+/-"
                        required
                        className="w-20 rounded-md border border-black/10 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                      <input
                        type="text"
                        name="note"
                        placeholder="Motif (optionnel)"
                        className="w-36 rounded-md border border-black/10 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                      <button type="submit" className="btn-secondary px-3 py-1.5 text-xs">
                        OK
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card h-fit p-5">
          <h2 className="mb-3 font-semibold text-ink">Derniers mouvements</h2>
          <p className="mb-3 text-xs text-ink/40">
            Journal partagé avec la caisse : chaque vente (site ou magasin) et chaque ajustement y apparaît.
          </p>
          <ul className="space-y-2 text-sm">
            {recentMovements.map((m) => (
              <li key={m.id} className="flex items-center justify-between border-b border-black/5 pb-2">
                <div>
                  <p className="text-ink">{m.product.name}</p>
                  <p className="text-xs text-ink/40">
                    {m.type} · {m.source}
                  </p>
                </div>
                <span className={`font-bold ${m.quantity < 0 ? "text-red-500" : "text-green-600"}`}>
                  {m.quantity > 0 ? "+" : ""}
                  {m.quantity}
                </span>
              </li>
            ))}
            {recentMovements.length === 0 && <p className="text-ink/50">Aucun mouvement pour le moment.</p>}
          </ul>
        </div>
      </div>
    </div>
  );
}

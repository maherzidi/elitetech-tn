import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { updateOrderStatus } from "../../actions";

export const dynamic = "force-dynamic";

const STATUSES = ["EN_ATTENTE", "CONFIRMEE", "EN_PREPARATION", "EXPEDIEE", "LIVREE", "ANNULEE"];
const PAYMENT_STATUSES = ["NON_PAYE", "PAYE", "REMBOURSE"];

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: true },
  });

  if (!order) notFound();

  const boundUpdate = updateOrderStatus.bind(null, order.id);

  return (
    <div>
      <h1 className="mb-6 font-sora text-2xl font-bold text-navy-900">Commande {order.orderNumber}</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <h2 className="mb-3 font-semibold text-ink">Articles</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/5 text-left text-ink/50">
                <th className="p-2">Produit</th>
                <th className="p-2">SKU</th>
                <th className="p-2">Qté</th>
                <th className="p-2">Prix</th>
                <th className="p-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} className="border-b border-black/5">
                  <td className="p-2">{item.productName}</td>
                  <td className="p-2 text-ink/50">{item.sku}</td>
                  <td className="p-2">{item.quantity}</td>
                  <td className="p-2">{formatPrice(Number(item.unitPrice))}</td>
                  <td className="p-2 font-medium">{formatPrice(Number(item.total))}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 ml-auto max-w-xs space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-ink/60">Sous-total</span>
              <span>{formatPrice(Number(order.subtotal))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink/60">Livraison</span>
              <span>{formatPrice(Number(order.shippingCost))}</span>
            </div>
            <div className="flex justify-between border-t border-black/5 pt-1 font-bold text-navy-900">
              <span>Total</span>
              <span>{formatPrice(Number(order.total))}</span>
            </div>
          </div>

          {order.notes && (
            <div className="mt-4 rounded-md bg-paper p-3 text-sm">
              <span className="font-medium text-ink">Remarques : </span>
              {order.notes}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="card p-5">
            <h2 className="mb-3 font-semibold text-ink">Client</h2>
            <p className="text-sm text-ink">{order.customerName}</p>
            <p className="text-sm text-ink/60">{order.customerPhone}</p>
            {order.customerEmail && <p className="text-sm text-ink/60">{order.customerEmail}</p>}
            <p className="mt-2 text-sm text-ink/60">
              {order.address}, {order.city}
            </p>
          </div>

          <div className="card p-5">
            <h2 className="mb-3 font-semibold text-ink">Statut</h2>
            <form action={boundUpdate} className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-ink">Statut de la commande</label>
                <select
                  name="status"
                  defaultValue={order.status}
                  className="w-full rounded-md border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-ink">Statut du paiement</label>
                <select
                  name="paymentStatus"
                  defaultValue={order.paymentStatus}
                  className="w-full rounded-md border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  {PAYMENT_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn-primary w-full">
                Mettre à jour
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

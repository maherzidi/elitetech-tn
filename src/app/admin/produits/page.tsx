import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import DeleteButton from "@/components/admin/DeleteButton";
import { deleteProduct } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-sora text-2xl font-bold text-navy-900">Produits ({products.length})</h1>
        <Link href="/admin/produits/nouveau" className="btn-primary">
          + Nouveau produit
        </Link>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-black/5 text-left text-ink/50">
              <th className="p-3">Produit</th>
              <th className="p-3">SKU</th>
              <th className="p-3">Catégorie</th>
              <th className="p-3">Prix</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Statut</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-black/5">
                <td className="p-3 font-medium text-ink">{p.name}</td>
                <td className="p-3 text-ink/60">{p.sku}</td>
                <td className="p-3 text-ink/60">{p.category?.name || "—"}</td>
                <td className="p-3">{formatPrice(Number(p.price))}</td>
                <td className={`p-3 font-semibold ${p.stock <= p.lowStockAlert ? "text-red-500" : "text-ink"}`}>
                  {p.stock}
                </td>
                <td className="p-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      p.isActive ? "bg-green-100 text-green-700" : "bg-black/5 text-ink/50"
                    }`}
                  >
                    {p.isActive ? "Actif" : "Inactif"}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex items-center justify-end gap-3">
                    <Link href={`/admin/produits/${p.id}`} className="text-accent hover:underline">
                      Modifier
                    </Link>
                    <DeleteButton id={p.id} action={deleteProduct} confirmText="Supprimer ce produit ?" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && <p className="p-6 text-center text-ink/50">Aucun produit pour le moment.</p>}
      </div>
    </div>
  );
}

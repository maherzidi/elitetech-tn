import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { approveSeller, rejectSeller, suspendSeller, reactivateSeller } from "../actions";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  EN_ATTENTE: "En attente",
  APPROUVE: "Approuvé",
  REFUSE: "Refusé",
  SUSPENDU: "Suspendu",
};

const STATUS_COLORS: Record<string, string> = {
  EN_ATTENTE: "bg-amber/20 text-amber-dark",
  APPROUVE: "bg-green-100 text-green-700",
  REFUSE: "bg-red-100 text-red-700",
  SUSPENDU: "bg-black/10 text-ink/60",
};

export default async function AdminSellersPage() {
  const sellers = await prisma.seller.findMany({
    orderBy: { createdAt: "desc" },
    include: { earnings: true },
  });

  return (
    <div>
      <h1 className="mb-1 font-sora text-2xl font-bold text-navy-900">Programme Vendeur</h1>
      <p className="mb-6 text-sm text-ink/50">
        Valide les demandes, gère les codes vendeurs et suis les gains générés. Le montant gagné par vente est
        défini produit par produit dans la fiche de chaque produit (champ &laquo;&nbsp;Commission vendeur&nbsp;&raquo;).
      </p>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[820px] text-sm">
          <thead>
            <tr className="border-b border-black/5 text-left text-ink/50">
              <th className="p-3">Vendeur</th>
              <th className="p-3">Contact</th>
              <th className="p-3">Code</th>
              <th className="p-3">Statut</th>
              <th className="p-3">Gains cumulés</th>
              <th className="p-3">Ventes</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {sellers.map((s) => {
              const total = s.earnings.reduce((sum, e) => sum + Number(e.totalCommission), 0);
              return (
                <tr key={s.id} className="border-b border-black/5">
                  <td className="p-3 font-medium text-ink">{s.name}</td>
                  <td className="p-3 text-ink/60">
                    {s.phone}
                    <div className="text-xs text-ink/40">{s.email}</div>
                  </td>
                  <td className="p-3 font-mono">{s.code || "—"}</td>
                  <td className="p-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[s.status]}`}>
                      {STATUS_LABELS[s.status]}
                    </span>
                  </td>
                  <td className="p-3 font-medium">{formatPrice(total)}</td>
                  <td className="p-3">{s.earnings.length}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap items-center justify-end gap-3 text-sm">
                      {s.status === "EN_ATTENTE" && (
                        <>
                          <form action={approveSeller.bind(null, s.id)}>
                            <button className="text-green-600 hover:underline">Approuver</button>
                          </form>
                          <form action={rejectSeller.bind(null, s.id)}>
                            <button className="text-red-500 hover:underline">Refuser</button>
                          </form>
                        </>
                      )}
                      {s.status === "APPROUVE" && (
                        <form action={suspendSeller.bind(null, s.id)}>
                          <button className="text-red-500 hover:underline">Suspendre</button>
                        </form>
                      )}
                      {(s.status === "SUSPENDU" || s.status === "REFUSE") && (
                        <form action={reactivateSeller.bind(null, s.id)}>
                          <button className="text-accent hover:underline">Réactiver</button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {sellers.length === 0 && <p className="p-6 text-center text-ink/50">Aucun vendeur inscrit pour le moment.</p>}
      </div>
    </div>
  );
}

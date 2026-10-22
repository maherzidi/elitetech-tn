import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import DeleteButton from "@/components/admin/DeleteButton";
import { createRepairIssueType, deleteRepairIssueType, updateRepairRequestStatus } from "../actions";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  NOUVELLE: "Nouvelle",
  CONTACTE: "Contacté",
  EN_COURS: "En cours",
  TERMINEE: "Terminée",
  ANNULEE: "Annulée",
};

const STATUSES = ["NOUVELLE", "CONTACTE", "EN_COURS", "TERMINEE", "ANNULEE"];

export default async function AdminRepairPage() {
  const [requests, issueTypes] = await Promise.all([
    prisma.repairRequest.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.repairIssueType.findMany({ orderBy: { order: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="mb-6 font-sora text-2xl font-bold text-navy-900">Service Réparation</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card overflow-x-auto lg:col-span-2">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-black/5 text-left text-ink/50">
                <th className="p-3">Client</th>
                <th className="p-3">Appareil</th>
                <th className="p-3">Panne</th>
                <th className="p-3">Devis</th>
                <th className="p-3">Statut</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id} className="border-b border-black/5 align-top">
                  <td className="p-3">
                    {r.customerName}
                    <div className="text-xs text-ink/40">{r.customerPhone}</div>
                  </td>
                  <td className="p-3">{r.deviceModel}</td>
                  <td className="p-3">{r.issueLabel}</td>
                  <td className="p-3">
                    {formatPrice(Number(r.estimatedMin))} - {formatPrice(Number(r.estimatedMax))}
                  </td>
                  <td className="p-3">
                    <form action={updateRepairRequestStatus.bind(null, r.id)} className="flex items-center gap-2">
                      <select
                        name="status"
                        defaultValue={r.status}
                        className="rounded-md border border-black/10 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-accent"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {STATUS_LABELS[s]}
                          </option>
                        ))}
                      </select>
                      <button type="submit" className="text-xs text-accent hover:underline">
                        OK
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {requests.length === 0 && <p className="p-6 text-center text-ink/50">Aucune demande de devis pour le moment.</p>}
        </div>

        <div className="space-y-6">
          <div className="card p-5">
            <h2 className="mb-3 font-semibold text-ink">Types de panne</h2>
            <ul className="mb-4 space-y-2 text-sm">
              {issueTypes.map((t) => (
                <li key={t.id} className="flex items-center justify-between border-b border-black/5 pb-2">
                  <div>
                    <p className="text-ink">{t.name}</p>
                    <p className="text-xs text-ink/40">
                      {formatPrice(Number(t.minPrice))} - {formatPrice(Number(t.maxPrice))}
                    </p>
                  </div>
                  <DeleteButton id={t.id} action={deleteRepairIssueType} confirmText="Supprimer ce type de panne ?" />
                </li>
              ))}
              {issueTypes.length === 0 && <p className="text-ink/50">Aucun type de panne configuré.</p>}
            </ul>

            <h3 className="mb-2 text-sm font-semibold text-ink">Ajouter un type de panne</h3>
            <form action={createRepairIssueType} className="space-y-2">
              <input
                name="name"
                required
                placeholder="Nom (ex: Écran)"
                className="w-full rounded-md border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <input
                name="nameAr"
                dir="rtl"
                placeholder="Nom en arabe (optionnel)"
                className="w-full rounded-md border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  step="0.001"
                  name="minPrice"
                  required
                  placeholder="Prix min"
                  className="w-full rounded-md border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <input
                  type="number"
                  step="0.001"
                  name="maxPrice"
                  required
                  placeholder="Prix max"
                  className="w-full rounded-md border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <button type="submit" className="btn-primary w-full">
                Ajouter
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import { getSellerSession } from "@/lib/auth";
import { formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function SellerDashboard() {
  const session = await getSellerSession();
  const seller = await prisma.seller.findUnique({
    where: { id: session!.id as string },
  });

  if (!seller) {
    return <p className="text-ink/60">Compte introuvable.</p>;
  }

  if (seller.status === "EN_ATTENTE") {
    return (
      <div className="card p-8 text-center">
        <span className="mb-3 block text-4xl">⏳</span>
        <h2 className="mb-2 font-semibold text-ink">Ton compte est en attente de validation</h2>
        <p className="text-sm text-ink/60">
          Notre équipe examine ta demande. Reviens un peu plus tard pour voir ton code vendeur apparaître ici.
        </p>
      </div>
    );
  }

  if (seller.status === "REFUSE" || seller.status === "SUSPENDU") {
    return (
      <div className="card p-8 text-center">
        <span className="mb-3 block text-4xl">🚫</span>
        <h2 className="mb-2 font-semibold text-ink">
          {seller.status === "REFUSE" ? "Ta demande a été refusée" : "Ton compte est suspendu"}
        </h2>
        <p className="text-sm text-ink/60">Contacte-nous par téléphone ou WhatsApp pour plus d&apos;informations.</p>
      </div>
    );
  }

  const earnings = await prisma.sellerEarning.findMany({
    where: { sellerId: seller.id },
    orderBy: { createdAt: "desc" },
    include: { order: true, product: true },
  });

  const totalEarnings = earnings.reduce((sum, e) => sum + Number(e.totalCommission), 0);

  return (
    <div>
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <p className="text-sm text-ink/50">Ton code vendeur</p>
          <p className="mt-1 font-mono text-2xl font-bold tracking-wider text-accent">{seller.code}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-ink/50">Gains cumulés</p>
          <p className="mt-1 text-2xl font-bold text-navy-900">{formatPrice(totalEarnings)}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-ink/50">Ventes réalisées</p>
          <p className="mt-1 text-2xl font-bold text-navy-900">{earnings.length}</p>
        </div>
      </div>

      <div className="card mb-6 p-5 text-sm text-ink/60">
        Partage ton code <strong className="text-ink">{seller.code}</strong> avec tes clients. Ils le saisissent au
        moment de payer <strong className="text-ink">en ligne</strong> sur elitetech.tn. Le paiement en ligne n&apos;est
        pas encore actif sur le site — dès qu&apos;il le sera, tes gains apparaîtront ici automatiquement.
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="border-b border-black/5 text-left text-ink/50">
              <th className="p-3">Commande</th>
              <th className="p-3">Produit</th>
              <th className="p-3">Qté</th>
              <th className="p-3">Gain</th>
              <th className="p-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {earnings.map((e) => (
              <tr key={e.id} className="border-b border-black/5">
                <td className="p-3">{e.order.orderNumber}</td>
                <td className="p-3">{e.product.name}</td>
                <td className="p-3">{e.quantity}</td>
                <td className="p-3 font-medium text-green-600">{formatPrice(Number(e.totalCommission))}</td>
                <td className="p-3 text-ink/50">{new Date(e.createdAt).toLocaleDateString("fr-FR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {earnings.length === 0 && <p className="p-6 text-center text-ink/50">Pas encore de vente avec ton code.</p>}
      </div>
    </div>
  );
}

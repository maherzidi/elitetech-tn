import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { isPickupOrder, STORE_ADDRESS } from "@/lib/delivery";

export const dynamic = "force-dynamic";

export default async function OrderConfirmationPage({ params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: true },
  });

  if (!order) notFound();

  const pickup = isPickupOrder(order);

  return (
    <div className="container-page flex flex-col items-center py-16 text-center">
      <span className="mb-4 text-6xl">✅</span>
      <h1 className="mb-2 font-sora text-2xl font-bold text-navy-900">Commande confirmée !</h1>
      <p className="mb-1 text-ink/60">
        Merci {order.customerName}, votre commande a bien été enregistrée.{" "}
        {pickup
          ? `Nous vous appellerons au ${order.customerPhone} dès qu'elle sera prête à retirer en magasin.`
          : `Nous vous contacterons rapidement au ${order.customerPhone} pour organiser la livraison.`}
      </p>
      <p className="mb-8 text-sm font-medium text-ink/40">Numéro de commande : {order.orderNumber}</p>

      {pickup && (
        <div className="mb-4 w-full max-w-md rounded-md border border-accent/30 bg-accent/5 p-4 text-left text-sm">
          <p className="font-semibold text-ink">Retrait en magasin</p>
          <p className="mt-1 text-ink/70">{STORE_ADDRESS}</p>
          <p className="mt-1 text-xs text-ink/50">
            Retrait gratuit. Munissez-vous de votre numéro de commande.
          </p>
        </div>
      )}

      <div className="card w-full max-w-md p-5 text-left">
        <h2 className="mb-3 font-semibold text-ink">Récapitulatif</h2>
        <ul className="mb-3 space-y-2 text-sm">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between">
              <span className="text-ink/70">
                {item.productName} × {item.quantity}
              </span>
              <span className="font-medium">{formatPrice(Number(item.total))}</span>
            </li>
          ))}
        </ul>
        <div className="space-y-1 border-t border-black/5 pt-3 text-sm">
          <div className="flex justify-between text-ink/60">
            <span>{pickup ? "Retrait en magasin" : "Livraison"}</span>
            <span>{Number(order.shippingCost) === 0 ? "Gratuit" : formatPrice(Number(order.shippingCost))}</span>
          </div>
          <div className="flex justify-between text-base font-bold text-navy-900">
            <span>Total</span>
            <span>{formatPrice(Number(order.total))}</span>
          </div>
        </div>
      </div>

      <Link href="/" className="btn-primary mt-8">
        Continuer mes achats
      </Link>
    </div>
  );
}

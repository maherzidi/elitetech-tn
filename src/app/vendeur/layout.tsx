import { redirect } from "next/navigation";
import { getSellerSession } from "@/lib/auth";
import { sellerLogoutAction } from "./actions";

export default async function SellerLayout({ children }: { children: React.ReactNode }) {
  const session = await getSellerSession();
  if (!session) redirect("/vendeur-connexion");

  return (
    <div className="container-page py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-sora text-2xl font-bold text-navy-900">Espace Vendeur</h1>
        <form action={sellerLogoutAction}>
          <button className="text-sm text-ink/50 hover:text-red-500">Déconnexion</button>
        </form>
      </div>
      {children}
    </div>
  );
}

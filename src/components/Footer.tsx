import Link from "next/link";

const SHOP_PHONE = process.env.NEXT_PUBLIC_SHOP_PHONE || "+21652322608";
const SHOP_WHATSAPP = process.env.NEXT_PUBLIC_SHOP_WHATSAPP || "21652322608";

export default function Footer() {
  return (
    <footer className="mt-16 bg-navy-950 text-white/80">
      <div className="container-page grid grid-cols-1 gap-8 border-b border-white/10 py-10 lg:grid-cols-2">
        <div>
          <div className="mb-1 font-sora text-lg font-bold text-white">
            Besoin d&apos;aide ? <span className="text-accent">Parlons tech.</span>
          </div>
          <p className="text-sm leading-relaxed">
            Avenue Taieb Azabi, 8050 Hammamet, Tunisie
            <br />
            WhatsApp : {SHOP_PHONE}
          </p>
        </div>
        <div className="card flex flex-col gap-3 bg-white/5 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-white">Espaces professionnels</p>
            <p className="text-sm text-white/60">Administration, stock, vendeurs et commissions.</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Link href="/admin-login" className="btn-dark">
              Administration
            </Link>
            <Link href="/vendeur-connexion" className="btn-primary">
              Espace vendeur
            </Link>
          </div>
        </div>
      </div>

      <div className="container-page grid grid-cols-1 gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="mb-3 font-sora text-lg font-bold text-white">
            Elite<span className="text-accent">tech</span>
          </div>
          <p className="text-sm leading-relaxed">
            Vente d&apos;électronique, téléphonie, accessoires et matériel informatique à Hammamet.
          </p>
        </div>

        <div>
          <div className="mb-3 text-sm font-semibold text-white">Navigation</div>
          <ul className="space-y-2 text-sm">
            <li><Link href="/" className="hover:text-white">Accueil</Link></li>
            <li><Link href="/promotions" className="hover:text-white">Promotions</Link></li>
            <li><Link href="/reparation" className="hover:text-white">Réparation</Link></li>
            <li><Link href="/panier" className="hover:text-white">Panier</Link></li>
          </ul>
        </div>

        <div>
          <div className="mb-3 text-sm font-semibold text-white">Programme Vendeur</div>
          <ul className="space-y-2 text-sm">
            <li><Link href="/vendeur-inscription" className="hover:text-white">Devenir vendeur</Link></li>
            <li><Link href="/vendeur-connexion" className="hover:text-white">Espace vendeur</Link></li>
          </ul>
        </div>

        <div>
          <div className="mb-3 text-sm font-semibold text-white">Contact</div>
          <ul className="space-y-2 text-sm">
            <li>
              <a href={`tel:${SHOP_PHONE}`} className="hover:text-white">
                ☎ {SHOP_PHONE}
              </a>
            </li>
            <li>
              <a href={`https://wa.me/${SHOP_WHATSAPP}`} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                WhatsApp Business
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">
        © {new Date().getFullYear()} EliteTech — elitetech.tn — Tous droits réservés.
      </div>
    </footer>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { logoutAction } from "./actions";

const NAV = [
  { href: "/admin", label: "Tableau de bord", icon: "📊" },
  { href: "/admin/produits", label: "Produits", icon: "📦" },
  { href: "/admin/categories", label: "Catégories", icon: "🗂️" },
  { href: "/admin/stock", label: "Stock & inventaire", icon: "📈" },
  { href: "/admin/commandes", label: "Commandes", icon: "🧾" },
  { href: "/admin/reparations", label: "Réparations", icon: "🔧" },
  { href: "/admin/vendeurs", label: "Programme Vendeur", icon: "🤝" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) redirect("/admin-login");

  return (
    <div className="flex min-h-screen bg-paper font-inter text-ink">
      <aside className="hidden w-60 shrink-0 flex-col bg-navy-950 text-white/80 md:flex">
        <div className="flex h-16 items-center px-5 font-sora text-lg font-bold text-white">EliteTech Admin</div>
        <nav className="flex-1 space-y-1 px-3">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-white/10 hover:text-white"
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-white/10 p-3">
          <p className="mb-2 truncate px-2 text-xs text-white/50">{session.email as string}</p>
          <form action={logoutAction}>
            <button className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-white/10 hover:text-white">
              ↩ Déconnexion
            </button>
          </form>
        </div>
      </aside>

      <div className="flex-1">
        <div className="flex h-14 items-center justify-between border-b border-black/5 bg-white px-4 md:hidden">
          <span className="font-sora font-bold text-navy-900">EliteTech Admin</span>
          <form action={logoutAction}>
            <button className="text-sm text-ink/60">Déconnexion</button>
          </form>
        </div>
        <div className="p-4 md:p-8">{children}</div>
      </div>
    </div>
  );
}

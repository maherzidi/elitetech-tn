import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import CartIcon from "./CartIcon";
import LanguageSwitcher from "./LanguageSwitcher";
import SearchBar from "./SearchBar";
import CategoryNav from "./CategoryNav";
import MobileMenu from "./MobileMenu";

const SHOP_PHONE = process.env.NEXT_PUBLIC_SHOP_PHONE || "+21652322608";
const SHOP_WHATSAPP = process.env.NEXT_PUBLIC_SHOP_WHATSAPP || "21652322608";

export default async function Header() {
  const [categories, activeCounts] = await Promise.all([
    prisma.category.findMany({
      where: { parentId: null, isActive: true },
      orderBy: { order: "asc" },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { order: "asc" },
          select: { id: true, name: true, nameAr: true, slug: true },
        },
      },
    }),
    prisma.product.groupBy({
      by: ["categoryId"],
      where: { isActive: true },
      _count: { _all: true },
    }),
  ]);

  const countByCategory = new Map(
    activeCounts.map((row) => [row.categoryId, row._count._all]),
  );

  // On n'encombre pas le menu avec les rayons vides : seules les categories
  // qui contiennent des produits en stock sont proposees.
  const navCategories = categories
    .map((category) => ({
      ...category,
      children: category.children.filter((child) => countByCategory.get(child.id)),
    }))
    .filter(
      (category) =>
        category.slug !== "divers" &&
        (category.children.length > 0 || countByCategory.get(category.id)),
    );

  return (
    <header className="sticky top-0 z-50">
      {/* Barre du haut */}
      <div className="hidden bg-navy-950 text-white/80 sm:block">
        <div className="container-page flex h-8 items-center justify-between text-xs">
          <span>Avenue Taieb Azabi, 8050 Hammamet, Tunisie</span>
          <div className="flex items-center gap-4">
            <a href={`tel:${SHOP_PHONE}`} className="hover:text-white">
              ☎ {SHOP_PHONE}
            </a>
            <a
              href={`https://wa.me/${SHOP_WHATSAPP}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Bandeau principal */}
      <div className="bg-navy-900">
        <div className="container-page flex h-16 items-center gap-4">
          <MobileMenu categories={navCategories as any} />

          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image
              src="/images/logo.png"
              alt="EliteTech"
              width={175}
              height={36}
              className="h-8 w-auto object-contain sm:h-9"
              priority
            />
          </Link>

          <div className="hidden flex-1 md:block">
            <SearchBar />
          </div>

          <div className="ml-auto flex items-center gap-4">
            <LanguageSwitcher />
            <CartIcon />
          </div>
        </div>
        <div className="pb-3 px-4 md:hidden">
          <SearchBar />
        </div>
      </div>

      <CategoryNav categories={navCategories as any} />
    </header>
  );
}

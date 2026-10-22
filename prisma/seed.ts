import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Structure de categories inspiree de mytek.tn / tunisianet.tn
const CATEGORIES: {
  name: string;
  nameAr: string;
  slug: string;
  children: { name: string; nameAr: string; slug: string }[];
}[] = [
  {
    name: "Téléphonie",
    nameAr: "الهواتف",
    slug: "telephonie",
    children: [
      { name: "Smartphones", nameAr: "هواتف ذكية", slug: "smartphones" },
      { name: "Tablettes", nameAr: "أجهزة لوحية", slug: "tablettes" },
      { name: "Montres connectées", nameAr: "ساعات ذكية", slug: "montres-connectees" },
      { name: "Écouteurs & Casques", nameAr: "سماعات", slug: "ecouteurs-casques" },
      { name: "Accessoires téléphone", nameAr: "إكسسوارات الهاتف", slug: "accessoires-telephone" },
    ],
  },
  {
    name: "Informatique",
    nameAr: "الإعلامية",
    slug: "informatique",
    children: [
      { name: "Ordinateurs portables", nameAr: "حواسيب محمولة", slug: "ordinateurs-portables" },
      { name: "Ordinateurs de bureau", nameAr: "حواسيب مكتبية", slug: "ordinateurs-bureau" },
      { name: "Composants PC", nameAr: "مكونات الحاسوب", slug: "composants-pc" },
      { name: "Écrans", nameAr: "شاشات", slug: "ecrans" },
      { name: "Imprimantes", nameAr: "طابعات", slug: "imprimantes" },
    ],
  },
  {
    name: "Accessoires Informatique",
    nameAr: "إكسسوارات الإعلامية",
    slug: "accessoires-informatique",
    children: [
      { name: "Claviers & Souris", nameAr: "لوحات مفاتيح وفأرات", slug: "claviers-souris" },
      { name: "Stockage (SSD, HDD, clé USB)", nameAr: "وسائط التخزين", slug: "stockage" },
      { name: "Sacoches & Sacs à dos", nameAr: "حقائب", slug: "sacoches-sacs" },
      { name: "Webcams & Micros", nameAr: "كاميرات ومايكروفونات", slug: "webcams-micros" },
    ],
  },
  {
    name: "Gaming",
    nameAr: "الألعاب",
    slug: "gaming",
    children: [
      { name: "Consoles", nameAr: "أجهزة الألعاب", slug: "consoles" },
      { name: "Périphériques gaming", nameAr: "ملحقات الألعاب", slug: "peripheriques-gaming" },
      { name: "Chaises gaming", nameAr: "كراسي الألعاب", slug: "chaises-gaming" },
    ],
  },
  {
    name: "Maison & Électroménager",
    nameAr: "المنزل والأجهزة الكهرومنزلية",
    slug: "maison-electromenager",
    children: [
      { name: "Petit électroménager", nameAr: "أجهزة كهرومنزلية صغيرة", slug: "petit-electromenager" },
      { name: "TV & Image", nameAr: "التلفزيون والصورة", slug: "tv-image" },
    ],
  },
  {
    name: "Réseau & Sécurité",
    nameAr: "الشبكات والأمان",
    slug: "reseau-securite",
    children: [
      { name: "Routeurs & Modems", nameAr: "أجهزة التوجيه", slug: "routeurs-modems" },
      { name: "Caméras de surveillance", nameAr: "كاميرات المراقبة", slug: "cameras-surveillance" },
    ],
  },
];

async function main() {
  console.log("Seed: categories...");
  for (const [i, cat] of CATEGORIES.entries()) {
    const parent = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: { name: cat.name, nameAr: cat.nameAr, slug: cat.slug, order: i },
    });
    for (const [j, sub] of cat.children.entries()) {
      await prisma.category.upsert({
        where: { slug: sub.slug },
        update: {},
        create: {
          name: sub.name,
          nameAr: sub.nameAr,
          slug: sub.slug,
          order: j,
          parentId: parent.id,
        },
      });
    }
  }

  console.log("Seed: compte admin...");
  const adminEmail = process.env.ADMIN_EMAIL || "admin@elitetech.tn";
  const adminPassword = process.env.ADMIN_PASSWORD || "ChangeMoi123!";
  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash,
      name: "Administrateur",
      role: "SUPER_ADMIN",
    },
  });

  console.log("Seed: quelques produits d'exemple...");
  const smartphones = await prisma.category.findUnique({ where: { slug: "smartphones" } });
  const laptops = await prisma.category.findUnique({ where: { slug: "ordinateurs-portables" } });

  const sampleProducts = [
    {
      sku: "TEL-0001",
      name: "Smartphone EliteTech X1 128Go",
      nameAr: "هاتف ذكي EliteTech X1 128 جيجا",
      slug: "smartphone-elitetech-x1-128go",
      description: "Exemple de fiche produit à modifier depuis l'administration : écran 6.5\", 128 Go, double SIM.",
      purchasePrice: 800,
      price: 999,
      comparePrice: 1099,
      stock: 15,
      categoryId: smartphones?.id,
      images: ["/images/placeholder-product.svg"],
      isFeatured: true,
    },
    {
      sku: "PC-0001",
      name: "Ordinateur portable EliteTech Pro 15",
      nameAr: "حاسوب محمول EliteTech Pro 15",
      slug: "ordinateur-portable-elitetech-pro-15",
      description: "Exemple de fiche produit à modifier : Core i5, 8 Go RAM, SSD 512 Go, écran 15.6\".",
      purchasePrice: 1600,
      price: 1999,
      stock: 8,
      categoryId: laptops?.id,
      images: ["/images/placeholder-product.svg"],
      isFeatured: true,
    },
  ];

  for (const p of sampleProducts) {
    await prisma.product.upsert({
      where: { sku: p.sku },
      update: {},
      create: p as any,
    });
  }

  console.log("Seed: vendeur de démonstration (Programme Vendeur)...");
  const demoPasswordHash = await bcrypt.hash("Vendeur123!", 10);
  await prisma.seller.upsert({
    where: { email: "vendeur-demo@elitetech.tn" },
    update: {},
    create: {
      name: "Vendeur Démo",
      phone: "+21600000000",
      email: "vendeur-demo@elitetech.tn",
      passwordHash: demoPasswordHash,
      status: "APPROUVE",
      code: "DEMO001",
    },
  });
  // N'oublie pas de définir une "Commission vendeur" sur tes produits
  // depuis l'admin pour que ce code rapporte quelque chose une fois le
  // paiement en ligne activé.

  console.log("Seed: types de panne (service réparation)...");
  const REPAIR_TYPES = [
    { name: "Écran", nameAr: "الشاشة", minPrice: 120, maxPrice: 450, order: 0 },
    { name: "Batterie", nameAr: "البطارية", minPrice: 60, maxPrice: 150, order: 1 },
    { name: "Connecteur de charge", nameAr: "منفذ الشحن", minPrice: 50, maxPrice: 120, order: 2 },
    { name: "Speaker / Micro", nameAr: "السماعة", minPrice: 40, maxPrice: 100, order: 3 },
    { name: "Caméra", nameAr: "الكاميرا", minPrice: 80, maxPrice: 220, order: 4 },
    { name: "Diagnostic général", nameAr: "تشخيص عام", minPrice: 20, maxPrice: 50, order: 5 },
  ];
  for (const rt of REPAIR_TYPES) {
    await prisma.repairIssueType.upsert({
      where: { name: rt.name },
      update: {},
      create: rt,
    });
  }

  console.log("Seed terminé.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

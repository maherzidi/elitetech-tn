// Repare le catalogue : recree l'arborescence Stockage, corrige les noms
// casses (encodage) et reclasse les produits restes dans "Divers".
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const norm = (v) =>
  String(v || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const slugify = (v) =>
  norm(v).replace(/\s+/g, "-").slice(0, 70) || "divers";

// "clÃ© usb" -> "clé usb"
function fixMojibake(value) {
  const s = String(value || "");
  if (!/[ÃÂ]/.test(s)) return s;
  const repaired = Buffer.from(s, "latin1").toString("utf8");
  return repaired.includes("\uFFFD") ? s : repaired;
}

const STOCKAGE = [
  "Disques Internes",
  "Disque Dur externe",
  "Serveur de stockage",
  "Accessoires pour Storage",
  "Clé USB",
];

const PHONE_BRANDS = [
  "infinix", "itel", "oppo", "honor", "smartec", "tecno", "nokia",
  "xiaomi", "redmi", "samsung", "condor", "realme", "vivo", "lenovo", "lp",
];

function target(product) {
  const name = norm(fixMojibake(product.name));
  const brand = norm(fixMojibake(product.brand));
  const cat = norm(fixMojibake(product.cat));

  if (/cle usb|usb flash/.test(name)) return ["stockage", "Clé USB"];
  if (/etui|coque|vitre|film/.test(name))
    return ["telephonie-tablette", "Accessoires Téléphones"];
  if (/cable|chargeur|adapter|adaptateur|kit filiaire|power bank|batterie/.test(name))
    return ["telephonie-tablette", "Accessoires Téléphones"];
  if (/ecouteur|casque|haut parleur|enceinte/.test(name))
    return ["tv-son-photos", "SON"];
  if (PHONE_BRANDS.includes(brand)) return ["telephonie-tablette", "Téléphone Portable"];
  if (/smartphone|iphone|galaxy|redmi/.test(name))
    return ["telephonie-tablette", "Téléphone Portable"];
  if (cat === "son") return ["tv-son-photos", "SON"];
  if (cat === "services") return ["services", null];
  return null;
}

(async () => {
  // 1. Arborescence Stockage
  const parent = await prisma.category.upsert({
    where: { slug: "stockage" },
    update: { name: "Stockage", order: 3, isActive: true },
    create: { name: "Stockage", slug: "stockage", order: 3 },
  });

  let order = 0;
  for (const childName of STOCKAGE) {
    await prisma.category.upsert({
      where: { slug: `stockage-${slugify(childName)}` },
      update: { name: childName, parentId: parent.id, order: order++, isActive: true },
      create: {
        name: childName,
        slug: `stockage-${slugify(childName)}`,
        parentId: parent.id,
        order: order++,
      },
    });
  }

  // 2. Noms casses
  const products = await prisma.product.findMany({
    select: { id: true, name: true, sku: true, brand: { select: { name: true } }, category: { select: { name: true } } },
  });

  let renamed = 0;
  let moved = 0;

  for (const p of products) {
    const cleanName = fixMojibake(p.name);
    const cleanBrand = fixMojibake(p.brand?.name || "");

    const data = {};
    if (cleanName !== p.name) data.name = cleanName;

    const next = target({
      name: cleanName,
      brand: cleanBrand,
      cat: p.category?.name || "",
    });

    if (next) {
      const childSlug = next[1] ? `${next[0]}-${slugify(next[1])}` : next[0];
      const cat = await prisma.category.findUnique({ where: { slug: childSlug } });
      if (cat && cat.id !== undefined) {
        const current = await prisma.product.findUnique({ where: { id: p.id }, select: { categoryId: true } });
        if (current.categoryId !== cat.id) {
          data.categoryId = cat.id;
          moved++;
        }
      }
    }

    if (Object.keys(data).length) {
      await prisma.product.update({ where: { id: p.id }, data });
      if (data.name) renamed++;
    }
  }

  const divers = await prisma.category.findUnique({ where: { slug: "divers" } });
  const remaining = await prisma.product.count({ where: { categoryId: divers.id } });

  console.log(JSON.stringify({ renamed, moved, remainingInDivers: remaining }));
  await prisma.$disconnect();
})().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});

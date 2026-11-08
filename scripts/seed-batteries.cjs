/* Insere le catalogue batteries (site + caisse) et le Samsung Galaxy A07.
 * Usage: node scripts/seed-batteries.cjs
 */
const fs = require("fs");
const path = require("path");
const { batteries, description, specs } = require("./batteries-data.cjs");

for (const line of fs.readFileSync(path.join(process.cwd(), ".env.local"), "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Za-z0-9_]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2].replace(/^"|"$/g, "");
}
process.env.DATABASE_URL = process.env.DIRECT_URL || process.env.DATABASE_URL;

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const CAISSE = "C:\\Users\\Elite Tech\\Documents\\Elitetech\\base-de-donnees\\elitetech.json";

const A07_DESC = [
  "Écran : 6,7 pouces PLS LCD, 1600 x 720 pixels HD+, 90 Hz.",
  "Processeur : MediaTek Helio G99 (6 nm) Octa-Core.",
  "Système : Android 15, One UI 7.",
  "Mémoire : 8 Go de RAM (4 Go + 4 Go extensible), stockage 128 Go.",
  "Caméras : 50 MP + 2 MP à l'arrière, 8 MP à l'avant.",
  "Connectivité : 4G, Wi-Fi Direct, Bluetooth 5.3, USB Type-C, GPS.",
  "Capteurs : empreinte digitale latérale.",
  "Résistance : IP54 (poussière et éclaboussures).",
  "Batterie : 5000 mAh, charge rapide 25 W.",
  "Double SIM. Disponible en Noir, Vert et Violet.",
].join(" ");

const A07_SPECS = {
  "Écran": "6,7 pouces PLS LCD HD+ 90 Hz",
  "Processeur": "MediaTek Helio G99 (6 nm) Octa-Core",
  "RAM": "8 Go (4 Go + 4 Go extensible)",
  "Stockage": "128 Go",
  "Caméras": "50 MP + 2 MP arrière / 8 MP avant",
  "Batterie": "5000 mAh",
  "Charge": "25 W",
  "Réseau": "4G, double SIM",
  "Système": "Android 15, One UI 7",
  "Connectivité": "Wi-Fi Direct, Bluetooth 5.3, USB Type-C, GPS",
  "Résistance": "IP54",
  "Capteur": "Empreinte digitale latérale",
  "Couleur": "Noir, Vert, Violet",
  "Couleurs": "Noir, Vert, Violet",
};

async function seedSite() {
  const parent = await prisma.category.findUnique({ where: { slug: "telephonie-tablette" } });
  if (!parent) throw new Error("Categorie parente Téléphonie & Tablette introuvable");

  const category = await prisma.category.upsert({
    where: { slug: "telephonie-tablette-batteries" },
    update: { name: "Batteries", parentId: parent.id, order: 4, isActive: true },
    create: {
      name: "Batteries",
      slug: "telephonie-tablette-batteries",
      parentId: parent.id,
      order: 4,
      isActive: true,
    },
  });

  const brands = {};
  let created = 0;
  let updated = 0;

  for (const b of batteries) {
    if (!brands[b.brand]) {
      brands[b.brand] = await prisma.brand.upsert({
        where: { name: b.brand },
        update: {},
        create: { name: b.brand },
      });
    }
    const data = {
      name: b.name,
      slug: b.slug,
      description: description(b),
      price: 0,
      purchasePrice: 0,
      stock: 0,
      images: [`/images/products/batteries/${b.slug}.webp`],
      specs: specs(b),
      categoryId: category.id,
      brandId: brands[b.brand].id,
      isActive: true,
      isFeatured: false,
    };
    const existing = await prisma.product.findUnique({ where: { sku: b.sku } });
    if (existing) {
      await prisma.product.update({ where: { id: existing.id }, data });
      updated++;
    } else {
      await prisma.product.create({ data: { ...data, sku: b.sku } });
      created++;
    }
  }

  // Samsung Galaxy A07 4/128, disponible en 3 coloris.
  const smartphone = await prisma.category.findUnique({
    where: { slug: "telephonie-tablette-smartphone" },
  });
  const samsung = await prisma.brand.upsert({
    where: { name: "Samsung" },
    update: {},
    create: { name: "Samsung" },
  });
  const a07Data = {
    externalId: "1794155930120",
    sku: "C-1794155930120",
    name: "Samsung Galaxy A07 4/128",
    slug: "smartphone-samsung-galaxy-a07-4-128",
    description: A07_DESC,
    price: 579,
    purchasePrice: 480,
    stock: 4,
    images: [
      "/images/products/galaxy-a07-noir.webp",
      "/images/products/galaxy-a07-vert.webp",
      "/images/products/galaxy-a07-violet.webp",
    ],
    specs: A07_SPECS,
    categoryId: smartphone?.id ?? category.id,
    brandId: samsung.id,
    isActive: true,
    isFeatured: true,
  };
  const a07 = await prisma.product.findFirst({
    where: { OR: [{ sku: "C-1794155930120" }, { externalId: "1794155930120" }] },
  });
  if (a07) {
    await prisma.product.update({ where: { id: a07.id }, data: a07Data });
  } else {
    await prisma.product.create({ data: a07Data });
  }

  console.log(`Site: ${created} batteries creees, ${updated} mises a jour, Galaxy A07 OK`);
  return { category, batteries };
}

function seedCaisse(category) {
  const json = JSON.parse(fs.readFileSync(CAISSE, "utf8"));
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backup = CAISSE.replace(/\.json$/, `.backup-${stamp}.json`);
  fs.copyFileSync(CAISSE, backup);

  const existingByName = (name) =>
    json.products.find((p) => String(p.name).toLowerCase().trim() === name.toLowerCase().trim());
  const existingByCode = (code) => json.products.find((p) => String(p.code) === String(code));

  let added = 0;
  let touched = 0;
  let nextId = Date.now();
  const used = new Set(json.products.map((p) => p.id));

  for (const b of batteries) {
    const desc = description(b);
    const existing =
      existingByName(`batterie ${b.key}`) ||
      existingByCode(b.sku) ||
      (b.key === "bn46" ? existingByName("batterie BN46") : null);

    if (existing) {
      Object.assign(existing, {
        code: b.sku,
        name: b.name,
        cat: "Téléphonie & Tablette",
        brand: b.brand,
        sup: "",
        qty: 0,
        min: 0,
        buy: 0,
        price: 0,
        sub: "Batteries",
        ssub: "",
        desc,
        track: false,
      });
      touched++;
      continue;
    }

    while (used.has(nextId)) nextId++;
    used.add(nextId);
    json.products.push({
      id: nextId,
      code: b.sku,
      name: b.name,
      cat: "Téléphonie & Tablette",
      brand: b.brand,
      sup: "",
      qty: 0,
      min: 0,
      buy: 0,
      price: 0,
      sub: "Batteries",
      track: false,
      ssub: "",
      desc,
    });
    added++;
  }

  json.settings = json.settings || {};
  json.settings.cats = json.settings.cats || {};
  const subs = json.settings.cats["Téléphonie & Tablette"] || [];
  if (!subs.some((s) => String(s).toLowerCase() === "batteries")) {
    subs.push("Batteries");
  }
  json.settings.cats["Téléphonie & Tablette"] = subs;

  fs.writeFileSync(CAISSE, JSON.stringify(json, null, 1));
  console.log(`Caisse: ${added} ajoutees, ${touched} mises a jour. Sauvegarde: ${backup}`);
}

(async () => {
  try {
    const { category } = await seedSite();
    seedCaisse(category);
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();

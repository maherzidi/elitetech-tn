// Restructure les categories du site selon l'arborescence Tunisianet
// et rattache les produits existants (caisse + site) aux bonnes sous-categories.
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const TREE = [
  ["Informatique", ["Ordinateur Portable", "Accessoires et Périphériques", "Ordinateur de Bureau", "Logiciels", "Serveur informatique", "Meubles Pc", "Composant Informatique"]],
  ["Téléphonie & Tablette", ["Téléphone Portable", "Tablette tactile", "Accessoires Téléphones", "SmartWatch"]],
  ["Impression", ["Imprimantes", "Fax", "Scanners", "Photocopieurs", "Papier", "Consommables"]],
  ["Stockage", ["Disques Internes", "Disque Dur externe", "Serveur de stockage", "Accessoires pour Storage", "Clé USB"]],
  ["TV-Son-Photos", ["Montres", "Vidéoprojecteurs", "Consoles & Jeux", "Téléviseurs", "Récepteur / Abonnement", "Instrument de musique", "Appareils Photos", "Piles et Chargeurs", "SON"]],
  ["Électroménager", ["Climatisation", "Gros Electro Cuisine", "Gros Electro Lavage", "Chauffages", "Petit Electro Cuisine", "Entretien – Soin", "Machine à coudre", "Ventilateurs", "Scooter Electriques"]],
  ["Bureautique", ["Matériel point de vente", "Papier", "Ecriture & Correction", "Accessoires de bureau", "Classement & Archivage", "Cahiers, blocs et feuilles", "Calculatrices", "Nettoyage", "Décoration", "Bagageries", "Adhésifs, Agrafage & Découpe", "Tableaux"]],
  ["Réseau & Sécurité", ["Réseau", "Câbles et Connectiques", "Coffrets et Accessoires", "Système d'alarme", "Matériel de sécurité"]],
  ["Services", []],
  ["Divers", []],
];

const norm = (v) =>
  String(v || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const slug = (v) =>
  norm(v).replace(/\s+/g, "-").slice(0, 60) || "divers";

// regles par nom de produit (prioritaires), puis par ancienne categorie
const NAME_RULES = [
  [/ecouteur|casque|enceinte|haut parleur|barre de son|home cinema|microphone|speaker/, "TV-Son-Photos", "SON"],
  [/power ?bank|batterie externe/, "Téléphonie & Tablette", "Accessoires Téléphones"],
  [/etui|coque|film de protection|protection ecran|verre trempe/, "Téléphonie & Tablette", "Accessoires Téléphones"],
  [/chargeur|cable|adaptateur/, "Téléphonie & Tablette", "Accessoires Téléphones"],
  [/smartphone|iphone|galaxy|redmi|telephone|phone/, "Téléphonie & Tablette", "Téléphone Portable"],
  [/tablette|tablet/, "Téléphonie & Tablette", "Tablette tactile"],
  [/montre|smartwatch|watch/, "TV-Son-Photos", "Montres"],
  [/console|manette|playstation|xbox|nintendo/, "TV-Son-Photos", "Consoles & Jeux"],
  [/televiseur|smart tv| android tv|tv /, "TV-Son-Photos", "Téléviseurs"],
  [/ssd|disque dur|disque|hdd|carte memoire/, "Stockage", "Disques Internes"],
  [/cle usb|usb flash/, "Stockage", "Clé USB"],
  [/souris|clavier|webcam|hub|tapis|sacoche|sac a dos|refroidisseur|support/, "Informatique", "Accessoires et Périphériques"],
  [/pc portable|ordinateur portable|laptop|notebook/, "Informatique", "Ordinateur Portable"],
  [/imprimante|toner|cartouche|encre|papier/, "Impression", "Imprimantes"],
  [/routeur|switch|wifi|cpl|rj45|reseau/, "Réseau & Sécurité", "Réseau"],
  [/camera|alarme|surveillance|detecteur/, "Réseau & Sécurité", "Matériel de sécurité"],
  [/aspirateur|friteuse|cafetiere|micro onde|robot cuisine|bouilloire/, "Électroménager", "Petit Electro Cuisine"],
  [/stylo|cahier|agrafe|classeur|bloc notes/, "Bureautique", "Ecriture & Correction"],
];

const CAT_RULES = {
  chargeur: ["Téléphonie & Tablette", "Accessoires Téléphones"],
  son: ["TV-Son-Photos", "SON"],
  "accessoires informatiques": ["Informatique", "Accessoires et Périphériques"],
  accessoires: ["Informatique", "Accessoires et Périphériques"],
  smartphone: ["Téléphonie & Tablette", "Téléphone Portable"],
  smartphones: ["Téléphonie & Tablette", "Téléphone Portable"],
  afficheur: ["Informatique", "Composant Informatique"],
  "accessoires telephoniques": ["Téléphonie & Tablette", "Accessoires Téléphones"],
  etui: ["Téléphonie & Tablette", "Accessoires Téléphones"],
  "stockage ssd hdd cle usb": ["Stockage", "Disques Internes"],
  stockage: ["Stockage", "Disques Internes"],
  "telephone portable": ["Téléphonie & Tablette", "Téléphone Portable"],
  "telephone basique": ["Téléphonie & Tablette", "Téléphone Portable"],
  "ordinateurs portables": ["Informatique", "Ordinateur Portable"],
  services: ["Services", null],
};

function targetFor(product) {
  const name = norm(`${product.name} ${product.sku || ""}`);
  for (const [re, parent, child] of NAME_RULES) if (re.test(name)) return [parent, child];
  const cat = norm(product.cat);
  if (CAT_RULES[cat]) return CAT_RULES[cat];
  if (cat && cat !== "undefined") return ["Divers", null];
  return ["Divers", null];
}

(async () => {
  const parents = new Map();
  const createdSlugs = new Set();

  let order = 0;
  for (const [name, children] of TREE) {
    const pSlug = slug(name);
    const parent = await prisma.category.upsert({
      where: { slug: pSlug },
      update: { name, order: order++, isActive: true },
      create: { name, slug: pSlug, order: order++ },
    });
    parents.set(name, parent);
    createdSlugs.add(parent.slug);

    let cOrder = 0;
    for (const childName of children) {
      const cSlug = `${pSlug}-${slug(childName)}`;
      await prisma.category.upsert({
        where: { slug: cSlug },
        update: { name: childName, parentId: parent.id, order: cOrder++, isActive: true },
        create: { name: childName, slug: cSlug, parentId: parent.id, order: cOrder++ },
      });
      createdSlugs.add(cSlug);
    }
  }

  const products = await prisma.product.findMany({
    select: { id: true, name: true, sku: true, category: { select: { name: true, parent: { select: { name: true } } } } },
  });

  let moved = 0;
  for (const p of products) {
    const legacyCat = p.category ? (p.category.parent ? p.category.parent.name : p.category.name) : "";
    const [parentName, childName] = targetFor({ name: p.name, sku: p.sku, cat: legacyCat });
    const parent = parents.get(parentName) || parents.get("Divers");
    let categoryId = parent.id;
    if (childName) {
      const childSlug = `${parent.slug}-${slug(childName)}`;
      const child = await prisma.category.findUnique({ where: { slug: childSlug } });
      if (child) categoryId = child.id;
    }
    if (p.category?.name !== childName) moved++;
    await prisma.product.update({ where: { id: p.id }, data: { categoryId } });
  }

  const stale = await prisma.category.findMany({
    where: { slug: { notIn: [...createdSlugs] } },
    select: { id: true, slug: true, name: true },
  });
  if (stale.length) {
    await prisma.category.deleteMany({ where: { id: { in: stale.map((c) => c.id) } } });
  }

  console.log(JSON.stringify({
    categories: createdSlugs.size,
    products: products.length,
    reassigned: moved,
    deletedCategories: stale.length,
  }));
  await prisma.$disconnect();
})().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});

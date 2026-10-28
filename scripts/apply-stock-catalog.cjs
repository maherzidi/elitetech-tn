/**
 * Remplace le catalogue de démonstration par les 20 produits réellement en
 * stock dans la caisse EliteTech (base-de-donnees/elitetech.json).
 *
 * - Les anciens produits sont désactivés (jamais supprimés : ils sont
 *   référencés par l'historique des commandes).
 * - Les 14 produits qui partagent déjà un SKU 2000000x sont mis à jour.
 * - Les 6 accessoires sans code reçoivent le SKU "C-<id>" comme le fait
 *   /api/sync.
 * - Les événements de l'outbox de la caisse sont marqués comme traités pour
 *   éviter un double comptage du stock.
 *
 * Usage: node scripts/apply-stock-catalog.cjs
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const ENV = fs.readFileSync(path.join(ROOT, ".env.local"), "utf8");
for (const line of ENV.split(/\r?\n/)) {
  const m = line.match(/^([A-Za-z0-9_]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2].replace(/^"|"$/g, "");
}
process.env.DATABASE_URL = process.env.DIRECT_URL || process.env.DATABASE_URL;

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const STOCK_FILE = "C:\\Users\\Elite Tech\\Documents\\Elitetech\\base-de-donnees\\elitetech.json";
const stock = JSON.parse(fs.readFileSync(STOCK_FILE, "utf8"));

const IMG = "/images/products/";
const CAT = {
  accessoires: "cmvmnrwc500046d19be6zmypx", // Informatique > accessoires & périphériques
  telephone: "cmvmgjwes016u2hcupv4wu123", // Téléphonie & Tablette > Téléphone Portable
  chargeur: "cmvmnt76a00086d19eb6tjqot", // Téléphonie & Tablette > Chargeur
};

const catalog = {
  "20000001": {
    slug: "enceinte-bluetooth-p-pro5",
    name: "Enceinte Bluetooth P Pro5",
    categoryId: CAT.accessoires,
    image: "p-pro5.png",
    description:
      "Enceinte Bluetooth portable au format cylindrique, pensée pour accompagner la musique à la maison comme en déplacement. Elle diffuse un son puissant avec basses renforcées, se connecte en Bluetooth 5.1 jusqu'à 10 mètres et résiste aux éclaboussures grâce à sa certification IPX6. Lecture depuis une carte microSD ou une clé USB, radio FM et éclairage LED intégré.",
    specs: {
      Type: "Enceinte Bluetooth portable",
      Bluetooth: "5.1",
      Portée: "10 m",
      Étanchéité: "IPX6",
      Puissance: "5 W",
      Lecture: "MicroSD, USB, radio FM",
      Éclairage: "LED intégré",
      Couleur: "Noir",
    },
  },
  "20000002": {
    slug: "enceinte-bluetooth-romis",
    name: "Enceinte Bluetooth ROMIS",
    categoryId: CAT.accessoires,
    image: "romis-speaker.png",
    description:
      "Enceinte Bluetooth ROMIS RM-S616 au design compact et élégant, idéale pour les petits espaces. Elle délivre un son stéréo de 2 x 5 W avec une batterie de 1200 mAh pour plusieurs heures d'écoute. Compatible Bluetooth, carte TF, clé USB et radio FM, avec microphone intégré pour les appels.",
    specs: {
      Modèle: "ROMIS RM-S616",
      Puissance: "2 x 5 W",
      Batterie: "1200 mAh",
      Connexion: "Bluetooth",
      Lecture: "Carte TF, USB, radio FM",
      Microphone: "Intégré",
      Couleur: "Noir",
    },
  },
  "20000003": {
    slug: "enceinte-bluetooth-zqs1430",
    name: "Enceinte Bluetooth ZQS1430",
    categoryId: CAT.accessoires,
    image: "zqs-1430.png",
    description:
      "Enceinte Bluetooth ZQS-1430 avec éclairage RGB multicolore et microphone, parfaite pour les soirées et le karaoké. Ses deux haut-parleurs de 5 W offrent un son ample, avec une autonomie de 2 à 3 heures grâce à sa batterie de 1200 mAh. Lecture Bluetooth 5.0, USB, carte TF et radio FM.",
    specs: {
      Modèle: "ZQS-1430",
      Bluetooth: "5.0",
      Puissance: "2 x 5 W",
      Batterie: "1200 mAh",
      Autonomie: "2 à 3 heures",
      Lecture: "USB, carte TF, radio FM",
      Éclairage: "LED RGB",
      Microphone: "Inclus",
    },
  },
  "20000004": {
    slug: "casque-bluetooth-p47",
    name: "Casque Bluetooth P47",
    categoryId: CAT.accessoires,
    image: "casque-p47.png",
    description:
      "Casque Bluetooth P47 au format supra-auriculaire, léger et pliable pour un rangement facile. Il offre une connexion Bluetooth 5.0 + EDR stable, un micro intégré pour les appels et une autonomie adaptée à une journée d'utilisation. Compatible carte TF et radio FM, avec commandes intégrées sur l'oreillette.",
    specs: {
      Modèle: "P47",
      Bluetooth: "5.0 + EDR",
      Format: "Supra-auriculaire pliable",
      Microphone: "Intégré",
      Autonomie: "Environ 10 heures",
      Lecture: "Carte TF, radio FM",
      Prise: "Jack 3,5 mm",
      Couleur: "Blanc / noir",
    },
  },
  "20000005": {
    slug: "casque-bluetooth-p47m",
    name: "Casque Bluetooth P47M",
    categoryId: CAT.accessoires,
    image: "casque-p47m.png",
    description:
      "Casque Bluetooth P47M avec oreilles de chat lumineuses RGB, un look fun et un son généreux. Il se connecte en Bluetooth, intègre un microphone pour les appels et se replie pour être transporté facilement. Éclairage LED, lecture carte TF et radio FM.",
    specs: {
      Modèle: "P47M",
      Bluetooth: "5.0",
      Format: "Supra-auriculaire pliable",
      Éclairage: "Oreilles LED RGB",
      Microphone: "Intégré",
      Lecture: "Carte TF, radio FM",
      Couleur: "Bleu",
    },
  },
  "20000006": {
    slug: "telephone-portable-smartec-prime",
    name: "Smartec Prime",
    categoryId: CAT.telephone,
    image: "smartec-prime.png",
    description:
      "Téléphone portable Smartec Prime, simple et robuste, conçu pour les appels et les messages du quotidien. Son clavier physique confortable, son écran couleur et sa batterie longue durée en font un excellent téléphone d'appoint ou pour les seniors. Double SIM, radio FM, lampe torche et Bluetooth.",
    specs: {
      Écran: "1,77 pouces couleur",
      SIM: "Double SIM",
      Batterie: "800 mAh",
      Réseau: "2G",
      Fonctions: "Radio FM, lampe torche, Bluetooth",
      Stockage: "MicroSD",
      Couleur: "Noir / bleu",
    },
  },
  "20000007": {
    slug: "telephone-portable-itel-it2165",
    name: "itel it2165",
    categoryId: CAT.telephone,
    image: "itel-it2165.png",
    description:
      "Téléphone portable itel it2165 au format compact, avec clavier physique et écran couleur 1,77 pouce. Il embarque une batterie de 1000 mAh offrant jusqu'à 9,5 h de communication, la radio FM sans fil, une lampe torche puissante et un emplacement microSD. Double SIM et Bluetooth pour rester connecté simplement.",
    specs: {
      Écran: "1,77 pouces QVGA",
      Batterie: "1000 mAh",
      Autonomie: "Jusqu'à 9,5 h d'appels",
      SIM: "Double SIM",
      Réseau: "2G",
      Fonctions: "FM sans fil, lampe torche, Bluetooth",
      Stockage: "MicroSD jusqu'à 32 Go",
      Couleur: "Bleu",
    },
  },
  "20000008": {
    slug: "telephone-portable-lp-starlight-m06",
    name: "LP Starlight M06",
    categoryId: CAT.telephone,
    image: "lp-starlight-m06.png",
    description:
      "Téléphone portable LP Starlight M06, un mobile compact et économique pour les appels quotidiens. Écran 1,77 pouce, double SIM, radio FM, lampe torche et batterie de 800 mAh : l'essentiel pour téléphoner toute la journée. Emplacement microSD pour stocker contacts et musiques.",
    specs: {
      Modèle: "Starlight M06",
      Écran: "1,77 pouces",
      RAM: "32 Mo",
      Stockage: "32 Mo + microSD",
      Batterie: "800 mAh",
      SIM: "Double SIM",
      Fonctions: "Radio FM, lampe torche, Bluetooth",
      Couleur: "Bleu",
    },
  },
  "20000009": {
    slug: "telephone-portable-sunelan-s30",
    name: "Sunelan S30",
    categoryId: CAT.telephone,
    image: "sunelan-s30.png",
    description:
      "Téléphone portable Sunelan S30 au design fin et coloré, avec clavier large et écran 1,77 pouce. Batterie 1000 mAh, double SIM, radio FM sans fil et lampe torche : tout l'essentiel pour communiquer au quotidien. Emplacement microSD pour étendre la mémoire.",
    specs: {
      Écran: "1,77 pouces",
      Batterie: "1000 mAh",
      SIM: "Double SIM",
      Réseau: "2G",
      Fonctions: "FM sans fil, lampe torche",
      Stockage: "MicroSD jusqu'à 32 Go",
      Couleur: "Bleu",
    },
  },
  "20000010": {
    slug: "smartphone-honor-x5c-4-128",
    name: "HONOR X5C 4/128",
    categoryId: CAT.telephone,
    image: "honor-x5c.png",
    description:
      "Le HONOR X5c est un smartphone accessible qui mise sur l'autonomie et la fluidité. Son grand écran HD+ de 6,74 pouces à 90 Hz est agréable pour les vidéos et la navigation, tandis que le MediaTek Helio G81, 4 Go de RAM et 128 Go de stockage assurent le quotidien. Capteur photo 13 MP, batterie 5260 mAh et MagicOS 9 sous Android 15.",
    specs: {
      Écran: "6,74 pouces HD+ 90 Hz",
      Processeur: "MediaTek Helio G81",
      RAM: "4 Go",
      Stockage: "128 Go (extensible microSD)",
      Caméras: "13 MP arrière / 5 MP avant",
      Batterie: "5260 mAh",
      Charge: "15 W",
      Système: "Android 15, MagicOS 9",
      Réseau: "4G, double SIM",
      Couleur: "Vert",
    },
  },
  "20000011": {
    slug: "smartphone-redmi-15c-6-128",
    name: "Redmi 15C 6/128",
    categoryId: CAT.telephone,
    image: "redmi-15c.png",
    description:
      "Le Redmi 15C offre un très grand écran de 6,9 pouces à 120 Hz, idéal pour le streaming et les jeux. Il est animé par un MediaTek Helio G81 Ultra épaulé par 6 Go de RAM et 128 Go de stockage, avec un capteur principal de 50 MP. Sa batterie de 6000 mAh accepte la charge rapide 33 W et le téléphone est certifié IP64.",
    specs: {
      Écran: "6,9 pouces HD+ 120 Hz",
      Processeur: "MediaTek Helio G81 Ultra",
      RAM: "6 Go",
      Stockage: "128 Go (extensible microSD)",
      Caméras: "50 MP arrière / 13 MP avant",
      Batterie: "6000 mAh",
      Charge: "33 W",
      Système: "Xiaomi HyperOS 2",
      Résistance: "IP64",
      Réseau: "4G, double SIM",
      Couleur: "Lavande",
    },
  },
  "20000012": {
    slug: "smartphone-redmi-a7-pro-4-128",
    name: "Redmi A7 Pro 4/128",
    categoryId: CAT.telephone,
    image: "redmi-a7-pro.png",
    description:
      "Le Redmi A7 Pro est un smartphone d'entrée de gamme généreux, avec un écran 6,9 pouces à 120 Hz et une batterie de 6000 mAh. Le Unisoc T7250, 4 Go de RAM et 128 Go de stockage suffisent pour les usages essentiels, tandis que le capteur 13 MP capture les moments du quotidien. Double SIM, HyperOS et charge 15 W.",
    specs: {
      Écran: "6,9 pouces HD+ 120 Hz",
      Processeur: "Unisoc T7250",
      RAM: "4 Go",
      Stockage: "128 Go (extensible microSD)",
      Caméras: "13 MP arrière / 8 MP avant",
      Batterie: "6000 mAh",
      Charge: "15 W",
      Système: "Android 16, HyperOS 3",
      Réseau: "4G, double SIM",
      Poids: "208 g",
      Couleur: "Vert",
    },
  },
  "20000013": {
    slug: "smartphone-infinix-smart-20-4-128",
    name: "Infinix Smart 20 4/128",
    categoryId: CAT.telephone,
    image: "infinix-smart-20.png",
    description:
      "L'Infinix Smart 20 combine un grand écran 6,78 pouces à 120 Hz, un design ultra-fin de 7,7 mm et une batterie de 5200 mAh. Le MediaTek Helio G81 Ultimate, 4 Go de RAM (+4 Go virtuels) et 128 Go de stockage assurent une expérience fluide au quotidien. Certification IP64, NFC et XOS 16.",
    specs: {
      Écran: "6,78 pouces HD+ 120 Hz",
      Processeur: "MediaTek Helio G81 Ultimate",
      RAM: "4 Go (+4 Go virtuels)",
      Stockage: "128 Go (extensible microSD)",
      Caméras: "8 MP arrière / 8 MP avant",
      Batterie: "5200 mAh",
      Résistance: "IP64",
      Connectivité: "4G, NFC, double SIM",
      Système: "Android 16, XOS 16",
      Épaisseur: "7,7 mm",
      Couleur: "Orange",
    },
  },
  "20000014": {
    slug: "smartphone-oppo-a6c-4-128",
    name: "OPPO A6c 4/128",
    categoryId: CAT.telephone,
    image: "oppo-a6c.png",
    description:
      "L'OPPO A6c mise sur une autonomie exceptionnelle avec sa batterie de 7000 mAh et un grand écran 6,75 pouces à 120 Hz. Le Unisoc T7250, 4 Go de RAM et 128 Go de stockage couvrent les usages courants, et la certification IP64 protège l'appareil au quotidien. Capteur 13 MP, charge 15 W et ColorOS.",
    specs: {
      Écran: "6,75 pouces HD+ 120 Hz",
      Processeur: "Unisoc T7250",
      RAM: "4 Go",
      Stockage: "128 Go (extensible microSD)",
      Caméras: "13 MP arrière / 5 MP avant",
      Batterie: "7000 mAh",
      Charge: "15 W",
      Résistance: "IP64",
      Système: "Android, ColorOS",
      Réseau: "4G, double SIM",
      Couleur: "Blanc",
    },
  },
};

// Accessoires sans code caisse : SKU C-<id>.
const ACCESSOIRES = {
  "1793176645320": {
    slug: "chargeur-samsung-25w-blanc",
    name: "Power Adapter 25W Blanc",
    brand: "Samsung",
    image: "samsung-25w.png",
    description:
      "Chargeur secteur Samsung 25 W blanc, compatible Power Delivery 3.0 et PPS pour recharger rapidement smartphones, tablettes et accessoires USB-C. Son format compact et sa régulation de charge protègent la batterie au quotidien. Câble vendu séparément.",
    specs: {
      Puissance: "25 W",
      Norme: "USB PD 3.0 / PPS",
      Port: "USB-C",
      Couleur: "Blanc",
      Modèle: "EP-T2510",
    },
  },
  "1793176700904": {
    slug: "cable-usb-c-vers-usb-c-blanc",
    name: "Câble charge type C / type C Blanc",
    brand: "Samsung",
    image: "cable-usb-c.png",
    description:
      "Câble de charge USB-C vers USB-C blanc de 1 mètre, conçu pour la recharge rapide et le transfert de données. Il supporte jusqu'à 3 A / 60 W et reste compatible avec les chargeurs Samsung, Apple et la plupart des appareils USB-C.",
    specs: {
      Connecteurs: "USB-C mâle / USB-C mâle",
      Longueur: "1 m",
      Courant: "3 A",
      Puissance: "Jusqu'à 60 W",
      Norme: "USB 2.0",
      Couleur: "Blanc",
    },
  },
  "1793176754904": {
    slug: "chargeur-samsung-45w-complet-blanc",
    name: "Chargeur Complet 45W Blanc",
    brand: "Samsung",
    image: "samsung-45w.png",
    description:
      "Chargeur complet Samsung 45 W blanc avec câble USB-C 5 A inclus, pour une recharge ultra-rapide des smartphones et tablettes compatibles. Compatible Power Delivery 3.0 et PPS, il recharge un Galaxy compatible à 100 % en moins d'une heure. Protection contre les surtensions et les courts-circuits.",
    specs: {
      Puissance: "45 W",
      Norme: "USB PD 3.0 / PPS",
      Port: "USB-C",
      Câble: "USB-C 5 A inclus (1,8 m)",
      Couleur: "Blanc",
      Modèle: "EP-T4511",
    },
  },
  "1793176799135": {
    slug: "cable-iphone-lightning-original",
    name: "Câble iPhone Original",
    brand: "Apple",
    image: "cable-lightning.png",
    description:
      "Câble Apple USB-C vers Lightning de 1 mètre, idéal pour recharger et synchroniser un iPhone, un iPad ou des AirPods. Certifié MFi, il prend en charge la charge rapide 20 W avec un adaptateur USB-C compatible et résiste à l'usure quotidienne.",
    specs: {
      Connecteurs: "USB-C vers Lightning",
      Longueur: "1 m",
      Certification: "MFi",
      Charge: "Rapide 20 W",
      Compatibilité: "iPhone, iPad, AirPods",
      Couleur: "Blanc",
    },
  },
  "1793176840072": {
    slug: "cable-iphone-lightning-rommos",
    name: "Câble iPhone Lightning USB-A",
    brand: "Rommos",
    image: "cable-lightning-rommos.png",
    description:
      "Câble USB-A vers Lightning de 1 mètre, pratique pour recharger un iPhone depuis un chargeur USB classique, un ordinateur ou une batterie externe. Connecteurs renforcés et charge jusqu'à 2,4 A pour un usage quotidien.",
    specs: {
      Connecteurs: "USB-A vers Lightning",
      Longueur: "1 m",
      Courant: "2,4 A",
      Compatibilité: "iPhone, iPad",
      Couleur: "Blanc",
    },
  },
  "1793176889696": {
    slug: "adaptateur-apple-20w",
    name: "Adaptateur 20W iPhone",
    brand: "Apple",
    image: "apple-20w.png",
    description:
      "Adaptateur secteur Apple 20 W USB-C, le chargeur officiel pour recharger rapidement un iPhone ou un iPad. Compatible Power Delivery, il délivre 20 W et fonctionne avec les câbles USB-C vers Lightning ou USB-C. Format compact, idéal à la maison comme en déplacement.",
    specs: {
      Puissance: "20 W",
      Norme: "USB Power Delivery",
      Port: "USB-C",
      Compatibilité: "iPhone, iPad",
      Couleur: "Blanc",
    },
  },
};

async function main() {
  const finalExternalIds = new Set(stock.products.map((p) => String(p.id)));
  const finalSkus = new Set(stock.products.map((p) => p.code || `C-${p.id}`));

  // 1. Categories et marques.
  const brands = new Map();
  const brandName = (p) => (ACCESSOIRES[String(p.id)]?.brand || p.brand || "").trim();
  for (const p of stock.products) {
    const name = brandName(p);
    if (!name) continue;
    const brand = await prisma.brand.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    brands.set(name, brand.id);
  }

  // 2. Desactivation de tout ce qui ne fait pas partie du stock reel.
  const all = await prisma.product.findMany({ select: { id: true, sku: true, externalId: true } });
  const keep = new Set();
  for (const p of all) {
    const isKept = finalExternalIds.has(String(p.externalId)) || finalSkus.has(p.sku);
    if (isKept) keep.add(p.id);
  }
  const toDisable = all.filter((p) => !keep.has(p.id));
  if (toDisable.length) {
    await prisma.product.updateMany({
      where: { id: { in: toDisable.map((p) => p.id) } },
      data: { isActive: false, isFeatured: false },
    });
  }
  console.log(`Desactives: ${toDisable.length} anciens produits`);

  // 3. Mise a jour / creation des 20 produits.
  let created = 0;
  let updated = 0;
  for (const p of stock.products) {
    const externalId = String(p.id);
    const sku = (p.code || `C-${externalId}`).trim();
    const extra = ACCESSOIRES[externalId];
    const meta = catalog[sku] || extra;
    if (!meta) throw new Error(`Pas de fiche produit pour ${sku} (${p.name})`);

    const data = {
      externalId,
      sku,
      name: meta.name,
      slug: meta.slug,
      description: meta.description,
      price: p.price,
      purchasePrice: p.buy,
      stock: p.qty,
      lowStockAlert: p.min || 2,
      categoryId: extra ? CAT.chargeur : meta.categoryId,
      brandId: brands.get(brandName(p)) || null,
      images: [`${IMG}${meta.image}`],
      specs: meta.specs,
      isActive: true,
      isFeatured: Boolean(
        sku.startsWith("2000001") || ["20000001", "20000002", "20000003"].includes(sku)
      ),
    };

    const existing = await prisma.product.findFirst({
      where: { OR: [{ externalId }, { sku }] },
      select: { id: true },
    });
    if (existing) {
      await prisma.product.update({ where: { id: existing.id }, data });
      updated++;
    } else {
      await prisma.product.create({ data });
      created++;
    }
    console.log(`${existing ? "MAJ" : "NEW"} ${sku.padEnd(12)} ${meta.name}`);
  }

  // 4. Outbox de la caisse : deja integree, on la marque comme traitee.
  const events = [];
  for (const e of stock.outbox || []) {
    if (!e.id) continue;
    events.push({ id: String(e.id), type: String(e.t || "event") });
  }
  if (events.length) {
    const res = await prisma.syncEvent.createMany({ data: events, skipDuplicates: true });
    console.log(`SyncEvent: ${res.count} evenements marques (${events.length} dans l'outbox)`);
  }

  console.log(`\nTermine: ${created} crees, ${updated} mis a jour, ${toDisable.length} desactives.`);
}

main()
  .catch((e) => {
    console.error("ERREUR:", e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

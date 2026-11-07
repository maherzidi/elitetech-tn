/**
 * Applique les galeries photos nettoyees et les designations corrigees.
 *
 * Ce script ne touche NI au stock, NI aux prix : il met seulement a jour le
 * nom, les images, les caracteristiques et la description des fiches dont les
 * visuels ont ete retravailles depuis le dossier "elitetech photo articles".
 *
 * Les images sont generees par scripts/import_product_gallery.py.
 *
 * Usage: node scripts/apply-product-galleries.cjs
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

const IMG = "/images/products/";

const PATCHES = {
  // HONOR X5c Plus 4/128 : les photos fournies et le prix caisse (479 DT)
  // correspondent au X5c Plus 4G, pas au X5c.
  "20000010": {
    name: "HONOR X5c Plus 4/128",
    images: [
      "honor-x5c-plus-cyan-avant-arriere.webp",
      "honor-x5c-plus-cyan-arriere.webp",
      "honor-x5c-plus-cyan-profil.webp",
      "honor-x5c-plus-noir-avant-arriere.webp",
      "honor-x5c-plus-noir-arriere.webp",
      "honor-x5c-plus-noir-profil.webp",
    ],
    specs: {
      Caméras: "50 MP arrière / 5 MP avant",
      Couleur: "Bleu cyan",
      Couleurs: "Bleu cyan, Noir",
    },
    description:
      "Le HONOR X5c Plus est un smartphone accessible qui mise sur l'autonomie et la fluidité. Son grand écran HD+ de 6,74 pouces à 90 Hz est agréable pour les vidéos et la navigation, tandis que le MediaTek Helio G81, 4 Go de RAM et 128 Go de stockage assurent le quotidien. Capteur photo 50 MP, batterie 5260 mAh, charge 15 W et MagicOS 9 sous Android 15. Disponible en Bleu cyan et en Noir.",
  },
  // ROMIS : la caisse et la boite indiquent RM-S213 (et non RM-S616).
  "20000002": {
    name: "Enceinte Bluetooth ROMIS RM-S213 LED",
    images: ["romis-rm-s213-noir.webp", "romis-rm-s213-lineup.webp"],
    specs: {
      Modèle: "ROMIS RM-S213 LED",
      Puissance: "10 W",
      Batterie: "1200 mAh",
      Autonomie: "Environ 3 heures",
      Connexion: "Bluetooth, USB, AUX",
      Lecture: "Carte TF, USB, radio FM",
      Éclairage: "LED RGB",
      Microphone: "Intégré",
      Dimensions: "95 x 140 mm",
      Couleur: "Noir",
    },
    description:
      "Enceinte Bluetooth ROMIS RM-S213 LED au format cylindrique, avec anneau lumineux RGB sur le dessus. Elle délivre 10 W de puissance, se connecte en Bluetooth et accepte une carte TF, une clé USB ou une entrée AUX. Radio FM, microphone intégré et batterie de 1200 mAh pour environ 3 heures d'écoute.",
  },
  "20000001": {
    images: [
      "p-pro5.png",
      "p-pro5-lineup.webp",
      "p-pro5-bleu.webp",
      "p-pro5-rouge.webp",
      "p-pro5-noir-action.webp",
      "p-pro5-bleu-action.webp",
      "p-pro5-camouflage-action.webp",
      "p-pro5-rouge-action.webp",
    ],
    specs: {
      Couleur: "Noir",
      Couleurs: "Noir, Bleu, Camouflage, Rouge",
    },
  },
  "20000003": {
    images: ["zqs-1430-noir.webp", "zqs-1430.png"],
  },
  "20000005": {
    images: ["casque-p47m.png", "casque-p47m-bleu.webp"],
  },
  "20000008": {
    images: [
      "lp-starlight-m06.png",
      "lp-starlight-noir.webp",
      "lp-starlight-bleu.webp",
      "lp-starlight-argent.webp",
    ],
    specs: {
      Couleur: "Bleu",
      Couleurs: "Noir, Bleu, Argent",
    },
  },
  "20000007": {
    images: [
      "itel-it2165.png",
      "itel-it2165-noir-avant.webp",
      "itel-it2165-noir-arriere.webp",
    ],
    specs: {
      Couleur: "Bleu",
      Couleurs: "Noir, Bleu",
    },
  },
  "20000006": {
    images: ["smartec-prime.png", "smartec-prime-noir.webp"],
    specs: {
      Couleur: "Noir / bleu",
      Couleurs: "Noir, Bleu",
    },
  },
  "20000013": {
    images: ["infinix-smart-20.png", "infinix-smart-20-noir.webp"],
  },
};

async function main() {
  const skus = Object.keys(PATCHES);
  const rows = await prisma.product.findMany({
    where: { sku: { in: skus } },
    select: { id: true, sku: true, name: true, specs: true },
  });
  const bySku = new Map(rows.map((r) => [r.sku, r]));

  for (const sku of skus) {
    const current = bySku.get(sku);
    if (!current) {
      console.warn(`INTROUVABLE ${sku}`);
      continue;
    }
    const patch = PATCHES[sku];
    const data = {
      ...(patch.name ? { name: patch.name } : {}),
      ...(patch.description ? { description: patch.description } : {}),
      ...(patch.images
        ? { images: patch.images.map((file) => `${IMG}${file}`) }
        : {}),
      ...(patch.specs
        ? { specs: { ...(current.specs || {}), ...patch.specs } }
        : {}),
    };
    await prisma.product.update({ where: { id: current.id }, data });
    console.log(
      `MAJ ${sku.padEnd(12)} ${data.name || current.name}  images=${(data.images || []).length}`
    );
  }

  console.log("\nTermine.");
}

main()
  .catch((e) => {
    console.error("ERREUR:", e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

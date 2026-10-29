/**
 * Remplace le catalogue de démonstration par les produits réellement en
 * stock dans la caisse EliteTech (base-de-donnees/elitetech.json).
 *
 * - Les anciens produits sont désactivés (jamais supprimés : ils sont
 *   référencés par l'historique des commandes).
 * - Les produits qui partagent déjà un SKU 2000000x sont mis à jour.
 * - Les produits sans code caisse reçoivent le SKU "C-<id>" comme le fait
 *   /api/sync.
 * - Les catégories "Smartphone" et "Téléphone Portable" reproduisent le
 *   classement de la caisse.
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
  smartphone: "", // Téléphonie & Tablette > Smartphone (créé au démarrage)
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
    images: ["redmi-15c.png", "redmi-15c-lineup.png"],
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
    images: ["redmi-a7-pro.png", "redmi-a7-pro-lineup.png"],
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

// Produits sans code caisse : SKU C-<id>.
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
  "1793261256793": {
    slug: "smartphone-honor-x6c-6-256",
    name: "HONOR X6C 6/256",
    brand: "Honor",
    image: "honor-x6c.png",
    images: ["honor-x6c.png", "honor-x6c-noir.png"],
    description:
      "Le HONOR X6c 6/256 associe un grand écran 6,61 pouces à 120 Hz, un capteur principal de 50 MP et une batterie de 5300 mAh avec charge rapide 35 W. Le MediaTek Helio G81 Ultra, 6 Go de RAM et 256 Go de stockage assurent une expérience fluide au quotidien, le tout dans un châssis fin et résistant. MagicOS 9 sous Android 15, double SIM et connectivité 4G.",
    specs: {
      Écran: "6,61 pouces HD+ 120 Hz",
      Processeur: "MediaTek Helio G81 Ultra",
      RAM: "6 Go",
      Stockage: "256 Go (extensible microSD)",
      Caméras: "50 MP arrière / 5 MP avant",
      Batterie: "5300 mAh",
      Charge: "35 W",
      Système: "Android 15, MagicOS 9",
      Réseau: "4G, double SIM",
      Couleur: "Vert menthe / noir",
    },
  },
  "1793262002761": {
    slug: "cable-charge-inkax-x01",
    name: "Câble de charge Inkax X01",
    brand: "INKAX",
    image: "inkax-x01.png",
    description:
      "Câble de charge Inkax X01 en PVC souple, long de 0,9 m et prévu pour un courant de 3,1 A. La série X01 couvre les connecteurs Lightning, micro USB et USB-C : elle recharge rapidement le smartphone au quotidien et assure aussi le transfert de données. Connecteurs moulés et gaine résistante aux pliures.",
    specs: {
      Connecteurs: "USB-A vers Lightning / micro USB / USB-C",
      Longueur: "0,9 m",
      Courant: "3,1 A",
      Matériau: "PVC",
      Fonction: "Charge et données",
      Couleur: "Blanc",
      Modèle: "X01",
    },
  },
  "1793262054825": {
    slug: "cable-charge-inkax-cb-33",
    name: "Câble de charge Inkax CB-33",
    brand: "INKAX",
    image: "inkax-cb33.png",
    description:
      "Le câble Inkax CB-33 réunit trois connecteurs en un seul câble : USB-A d'un côté, puis Type-C, micro USB et Lightning de l'autre. Long de 1 m et traversé par un courant de 2,1 A, il permet de recharger presque tous les smartphones avec un seul accessoire. Gaine TPE douce au toucher, boîtier ABS et finition « pebble » résistante.",
    specs: {
      Connecteurs: "USB-A vers Type-C / micro USB / Lightning",
      Longueur: "1 m",
      Courant: "2,1 A",
      Matériau: "TPE, boîtier ABS",
      Fonction: "Charge et données",
      Couleur: "Blanc",
      Modèle: "CB-33",
    },
  },
  "1793262094881": {
    slug: "cable-charge-inkax-cb-07",
    name: "Câble de charge Inkax CB-07",
    brand: "INKAX",
    image: "inkax-cb07.png",
    description:
      "Câble USB-A vers Lightning Inkax CB-07 de 1 m, conçu pour la recharge rapide des iPhone et iPad. Il supporte jusqu'à 3,1 A et offre une finition TPE souple et résistante, avec des connecteurs moulés par injection qui tiennent dans le temps. Idéal pour la maison, la voiture ou le bureau.",
    specs: {
      Connecteurs: "USB-A vers Lightning",
      Longueur: "1 m",
      Courant: "3,1 A",
      Matériau: "TPE (injection)",
      Compatibilité: "iPhone, iPad",
      Couleur: "Blanc",
      Modèle: "CB-07",
    },
  },
  "1793262187553": {
    slug: "chargeur-inkax-y03-qc20w-type-c",
    name: "Chargeur complet Inkax Y-03 QC 20W Type-C",
    brand: "INKAX",
    image: "inkax-y03.png",
    description:
      "Chargeur secteur Inkax Y-03 de 20 W avec port USB-A et technologie Quick Charge 3.0, livré complet avec son câble USB-A vers USB-C. Il recharge rapidement smartphones et tablettes compatibles tout en régulant la puissance pour protéger la batterie. Format compact, prise européenne et finition blanche.",
    specs: {
      Puissance: "20 W",
      Norme: "Quick Charge 3.0",
      Port: "USB-A",
      Câble: "USB-A vers USB-C inclus",
      Prise: "Européenne (EU)",
      Couleur: "Blanc",
      Modèle: "Y03",
    },
  },
  "1793262224513": {
    slug: "chargeur-inkax-y03-qc20w-micro-usb",
    name: "Chargeur complet Inkax Y-03 QC 20W Micro USB",
    brand: "INKAX",
    image: "inkax-y03.png",
    description:
      "Chargeur secteur Inkax Y-03 de 20 W avec port USB-A et Quick Charge 3.0, fourni avec son câble USB-A vers micro USB. Il assure une recharge rapide des téléphones et accessoires micro USB, avec protection contre les surcharges et les surchauffes. Format compact, prise européenne et finition blanche.",
    specs: {
      Puissance: "20 W",
      Norme: "Quick Charge 3.0",
      Port: "USB-A",
      Câble: "USB-A vers micro USB inclus",
      Prise: "Européenne (EU)",
      Couleur: "Blanc",
      Modèle: "Y03",
    },
  },
  "1793262309385": {
    slug: "cable-micro-usb-vdenmenv-2-4a",
    name: "Câble micro USB Vdenmenv 2,4 A",
    brand: "Vdenmenv",
    image: "vdenmenv-micro-usb.png",
    description:
      "Câble micro USB Vdenmenv de 1 m, prévu pour un courant de 2,4 A et la synchronisation des données. Ses connecteurs renforcés et sa gaine PVC résistante en font un câble fiable pour recharger un téléphone Android, une batterie externe ou tout accessoire micro USB au quotidien.",
    specs: {
      Connecteurs: "USB-A vers micro USB",
      Longueur: "1 m",
      Courant: "2,4 A",
      Matériau: "PVC",
      Fonction: "Charge et données",
      Couleur: "Blanc",
      Modèle: "D01V",
    },
  },
  "1793262467298": {
    slug: "clavier-yatel-k11",
    name: "Clavier Yatel K11",
    brand: "YATEL",
    image: "yatel-k11.png",
    description:
      "Clavier filaire Yatel K11 au format complet, avec pavé numérique et touches souples pour une frappe confortable au bureau comme à la maison. Il se branche en USB et fonctionne immédiatement, sans pilote à installer. Sa structure renforcée résiste à un usage quotidien intensif.",
    specs: {
      Connexion: "USB filaire",
      Format: "Complet avec pavé numérique",
      Touches: "104 touches",
      Disposition: "AZERTY",
      Couleur: "Noir",
      Compatibilité: "Windows, macOS, Linux",
    },
  },
  "1793262560018": {
    slug: "clavier-r8-1801",
    name: "Clavier R8 1801",
    brand: "R8",
    image: "r8-1801.png",
    description:
      "Clavier filaire R8 1801 au format complet, avec pavé numérique et touches gravées bilingues arabe / anglais. Son câble de 1,3 m laisse de la liberté sur le bureau et le branchement USB fonctionne en plug-and-play, sans installation. Boîtier ABS robuste et frappe silencieuse pour le bureau, l'école ou la maison.",
    specs: {
      Connexion: "USB 2.0 filaire",
      Longueur: "Câble 1,3 m",
      Format: "Complet avec pavé numérique",
      Disposition: "Bilingue arabe / anglais",
      Dimensions: "440 x 138 x 25 mm",
      Matériau: "ABS",
      Couleur: "Noir",
    },
  },
  "1793262608937": {
    slug: "clavier-redragon-bk-7092",
    name: "Clavier Redragon BK-7092",
    brand: "Redragon",
    image: "redragon-bk7092.png",
    description:
      "Clavier filaire Redragon BK-7092 au format complet, pensé pour le bureau et la saisie prolongée. Ses touches membrane silencieuses, ses 14 raccourcis FN et sa conception ergonomique offrent une frappe confortable et précise. La fonction anti-ghosting évite les touches manquées, même en frappe rapide. Branchement USB plug-and-play.",
    specs: {
      Connexion: "USB filaire",
      Format: "Complet 104 touches",
      Raccourcis: "14 touches FN",
      Technologie: "Membrane silencieuse",
      "Anti-ghosting": "Oui",
      Dimensions: "44,3 x 14,5 x 2,5 cm",
      Poids: "482 g",
      Couleur: "Noir",
    },
  },
};

const normalize = (value) =>
  String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();

async function main() {
  const finalExternalIds = new Set(stock.products.map((p) => String(p.id)));
  const finalSkus = new Set(stock.products.map((p) => p.code || `C-${p.id}`));

  // 1. Categories et marques.
  // La caisse distingue desormais "Smartphone" et "Telephone portable" :
  // on reproduit cette arborescence sur le site.
  const telephonie = await prisma.category.findUnique({ where: { slug: "telephonie-tablette" } });
  if (telephonie) {
    let smartphone = await prisma.category.findFirst({
      where: {
        OR: [
          { slug: "telephonie-tablette-smartphone" },
          { parentId: telephonie.id, name: { equals: "Smartphone", mode: "insensitive" } },
        ],
      },
    });
    if (!smartphone) {
      smartphone = await prisma.category.create({
        data: {
          name: "Smartphone",
          slug: "telephonie-tablette-smartphone",
          parentId: telephonie.id,
          order: 0,
        },
      });
    }
    CAT.smartphone = smartphone.id;

    // Smartphone, Telephone Portable, Chargeur : ordre d'affichage du menu.
    const orderUpdates = [
      [CAT.smartphone, 0],
      [CAT.telephone, 1],
      [CAT.chargeur, 2],
    ];
    for (const [id, order] of orderUpdates) {
      if (id) await prisma.category.update({ where: { id }, data: { order } });
    }
    console.log("Categories telephone: Smartphone / Telephone Portable / Chargeur");
  }

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

  // 3. Mise a jour / creation des produits du stock.
  let created = 0;
  let updated = 0;
  for (const p of stock.products) {
    const externalId = String(p.id);
    const sku = (p.code || `C-${externalId}`).trim();
    const extra = ACCESSOIRES[externalId];
    let meta = catalog[sku] || extra;
    if (!meta) {
      // La caisse peut ajouter un article avant qu'on ait redige sa fiche :
      // on cree une fiche minimale pour ne pas bloquer la synchronisation.
      const cleanName = String(p.name || sku).trim();
      const baseSlug =
        normalize(cleanName)
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
          .slice(0, 60) || "produit";
      meta = {
        slug: `${baseSlug}-${externalId}`,
        name: cleanName,
        image: null,
        description: `${cleanName} disponible chez EliteTech. Fiche descriptive en cours de mise à jour.`,
        specs: {},
      };
      console.warn(`FICHE GENERIQUE ${sku} ${cleanName}`);
    }

    const sub = normalize(p.sub);
    const categoryId =
      sub === "smartphone"
        ? CAT.smartphone
        : sub === "telephone portable"
          ? CAT.telephone
          : sub === "chargeur"
            ? CAT.chargeur
            : CAT.accessoires;

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
      categoryId,
      brandId: brands.get(brandName(p)) || null,
      images: meta.image
        ? (meta.images || [meta.image]).map((file) => `${IMG}${file}`)
        : ["/images/placeholder-product.svg"],
      specs: meta.specs,
      isActive: true,
      isFeatured: sub === "smartphone",
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

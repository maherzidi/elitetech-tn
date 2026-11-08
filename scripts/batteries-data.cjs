// Catalogue des batteries issues des fiches constructeur 2019-2026.
// Utilise par scripts/seed-batteries.cjs (site + caisse) et
// scripts/fetch-battery-images.cjs (visuels).

const APPLE = { brand: "Apple", prefix: "BAT-APL-", cat: "apple" };
const SAMSUNG = { brand: "Samsung", prefix: "BAT-SAM-", cat: "samsung" };
const XIAOMI = { brand: "Xiaomi", prefix: "BAT-XIA-", cat: "xiaomi" };

function entry(meta, key, name, capacity, ref, compat) {
  return {
    key,
    sku: meta.prefix + key.toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/^-|-$/g, ""),
    brand: meta.brand,
    family: meta.cat,
    name,
    capacity,
    ref,
    compat,
    slug: `batterie-${key}`,
  };
}

const batteries = [
  // ---------------- Apple iPhone ----------------
  entry(APPLE, "iphone-11", "Batterie iPhone 11", "3110 mAh", "616-00641 / 616-00644", "iPhone 11"),
  entry(APPLE, "iphone-11-pro", "Batterie iPhone 11 Pro", "3046 mAh", "616-00659", "iPhone 11 Pro"),
  entry(APPLE, "iphone-11-pro-max", "Batterie iPhone 11 Pro Max", "3969 mAh", "616-00651", "iPhone 11 Pro Max"),
  entry(APPLE, "iphone-se-2-3", "Batterie iPhone SE 2 / SE 3", "1821 / 2018 mAh", "616-00687", "iPhone SE (2020) et iPhone SE (2022)"),
  entry(APPLE, "iphone-12-mini", "Batterie iPhone 12 Mini", "2227 mAh", "616-00701", "iPhone 12 Mini"),
  entry(APPLE, "iphone-12-12-pro", "Batterie iPhone 12 / 12 Pro", "2815 mAh", "616-00711", "iPhone 12 et iPhone 12 Pro (pièce interchangeable)"),
  entry(APPLE, "iphone-12-pro-max", "Batterie iPhone 12 Pro Max", "3687 mAh", "616-00722", "iPhone 12 Pro Max"),
  entry(APPLE, "iphone-13-mini", "Batterie iPhone 13 Mini", "2406 mAh", "616-00806", "iPhone 13 Mini"),
  entry(APPLE, "iphone-13", "Batterie iPhone 13", "3227 mAh", "A2655", "iPhone 13"),
  entry(APPLE, "iphone-13-pro", "Batterie iPhone 13 Pro", "3095 mAh", "A2653", "iPhone 13 Pro"),
  entry(APPLE, "iphone-13-pro-max", "Batterie iPhone 13 Pro Max", "4352 mAh", "A2656", "iPhone 13 Pro Max"),
  entry(APPLE, "iphone-14-14-plus", "Batterie iPhone 14 / 14 Plus", "3279 / 4325 mAh", "A2863 / A2877", "iPhone 14 et iPhone 14 Plus"),
  entry(APPLE, "iphone-14-pro-pro-max", "Batterie iPhone 14 Pro / 14 Pro Max", "3200 / 4323 mAh", "A2872 / A2880", "iPhone 14 Pro et iPhone 14 Pro Max"),
  entry(APPLE, "iphone-15-15-plus", "Batterie iPhone 15 / 15 Plus", "3349 / 4383 mAh", "A3119 / A3120", "iPhone 15 et iPhone 15 Plus"),
  entry(APPLE, "iphone-15-pro-pro-max", "Batterie iPhone 15 Pro / 15 Pro Max", "3274 / 4441 mAh", "A3121 / A3122", "iPhone 15 Pro et iPhone 15 Pro Max"),
  entry(APPLE, "iphone-16-16-plus", "Batterie iPhone 16 / 16 Plus", "3561 / 4674 mAh", "Série A329x", "iPhone 16 et iPhone 16 Plus"),
  entry(APPLE, "iphone-16-pro-pro-max", "Batterie iPhone 16 Pro / 16 Pro Max", "3582 / 4685 mAh", "Série A329x (boîtier métallique)", "iPhone 16 Pro et iPhone 16 Pro Max"),

  // ---------------- Samsung Galaxy ----------------
  entry(SAMSUNG, "galaxy-s10", "Batterie Samsung Galaxy S10", "3400 mAh", "EB-BG973ABU", "Galaxy S10"),
  entry(SAMSUNG, "galaxy-s10-plus", "Batterie Samsung Galaxy S10+", "4100 mAh", "EB-BG975ABU", "Galaxy S10+"),
  entry(SAMSUNG, "galaxy-s20", "Batterie Samsung Galaxy S20", "4000 mAh", "EB-BG980ABY", "Galaxy S20"),
  entry(SAMSUNG, "galaxy-s20-plus", "Batterie Samsung Galaxy S20+", "4500 mAh", "EB-BG985ABY", "Galaxy S20+"),
  entry(SAMSUNG, "galaxy-s20-fe", "Batterie Samsung Galaxy S20 FE", "4500 mAh", "EB-BG780ABY", "Galaxy S20 FE"),
  entry(SAMSUNG, "galaxy-s21", "Batterie Samsung Galaxy S21", "4000 mAh", "EB-BG991ABY", "Galaxy S21"),
  entry(SAMSUNG, "galaxy-s21-plus", "Batterie Samsung Galaxy S21+", "4800 mAh", "EB-BG996ABY", "Galaxy S21+"),
  entry(SAMSUNG, "galaxy-s21-ultra", "Batterie Samsung Galaxy S21 Ultra", "5000 mAh", "EB-BG998ABY", "Galaxy S21 Ultra"),
  entry(SAMSUNG, "galaxy-s22", "Batterie Samsung Galaxy S22", "3700 mAh", "EB-BS901ABY", "Galaxy S22"),
  entry(SAMSUNG, "galaxy-s23", "Batterie Samsung Galaxy S23", "3900 mAh", "EB-BS911ABY", "Galaxy S23"),
  entry(SAMSUNG, "galaxy-s24", "Batterie Samsung Galaxy S24", "4000 mAh", "EB-BS921ABY", "Galaxy S24"),
  entry(SAMSUNG, "galaxy-s25", "Batterie Samsung Galaxy S25", "4000 mAh", "EB-BS931ABY", "Galaxy S25"),
  entry(SAMSUNG, "galaxy-s22-ultra", "Batterie Samsung Galaxy S22 Ultra", "5000 mAh", "EB-BS908ABY", "Galaxy S22 Ultra"),
  entry(SAMSUNG, "galaxy-s23-ultra", "Batterie Samsung Galaxy S23 Ultra", "5000 mAh", "EB-BS918ABY", "Galaxy S23 Ultra"),
  entry(SAMSUNG, "galaxy-s24-ultra", "Batterie Samsung Galaxy S24 Ultra", "5000 mAh", "EB-BS928ABY", "Galaxy S24 Ultra"),
  entry(SAMSUNG, "galaxy-s25-ultra", "Batterie Samsung Galaxy S25 Ultra", "5000 mAh", "EB-BS938ABY", "Galaxy S25 Ultra"),
  entry(SAMSUNG, "eb-ba217aby", "Batterie Samsung EB-BA217ABY (Galaxy A21s, A31, A41, A12)", "5000 mAh", "EB-BA217ABY", "Galaxy A21s, Galaxy A31, Galaxy A41, Galaxy A12"),
  entry(SAMSUNG, "eb-ba505abu", "Batterie Samsung EB-BA505ABU (Galaxy A50, A30, A30s, A20)", "4000 mAh", "EB-BA505ABU", "Galaxy A50, Galaxy A30, Galaxy A30s, Galaxy A20"),
  entry(SAMSUNG, "eb-ba515aby", "Batterie Samsung EB-BA515ABY (Galaxy A51 4G, A32 5G)", "4000 mAh", "EB-BA515ABY", "Galaxy A51 4G et Galaxy A32 5G"),
  entry(SAMSUNG, "eb-ba526aby", "Batterie Samsung EB-BA526ABY (Galaxy A52, A52 5G, A52s 5G)", "4500 mAh", "EB-BA526ABY", "Galaxy A52 4G, Galaxy A52 5G, Galaxy A52s 5G"),
  entry(SAMSUNG, "eb-ba536aby", "Batterie Samsung EB-BA536ABY (Galaxy A53 5G, A33 5G, A73 5G)", "5000 mAh", "EB-BA536ABY", "Galaxy A53 5G, Galaxy A33 5G, Galaxy A73 5G"),
  entry(SAMSUNG, "eb-ba546aby", "Batterie Samsung EB-BA546ABY (Galaxy A54 5G, A35 5G)", "5000 mAh", "EB-BA546ABY", "Galaxy A54 5G et Galaxy A35 5G"),
  entry(SAMSUNG, "eb-bm515aby", "Batterie Samsung EB-BM515ABY (Galaxy M51, M62)", "7000 mAh", "EB-BM515ABY", "Galaxy M51 et Galaxy M62"),

  // ---------------- Xiaomi / Redmi ----------------
  entry(XIAOMI, "bn46", "Batterie Xiaomi BN46 (Redmi Note 8, Note 8T, Redmi 7)", "4000 mAh", "BN46", "Redmi Note 8, Redmi Note 8T, Redmi 7"),
  entry(XIAOMI, "bm4j", "Batterie Xiaomi BM4J (Redmi Note 8 Pro)", "4500 mAh", "BM4J", "Redmi Note 8 Pro"),
  entry(XIAOMI, "bn53", "Batterie Xiaomi BN53 (Redmi Note 9 Pro, Note 9S, Poco X3 NFC)", "5020 mAh", "BN53", "Redmi Note 9 Pro, Redmi Note 9S, Redmi Note 9 Pro Max, Poco X3 NFC"),
  entry(XIAOMI, "bn54", "Batterie Xiaomi BN54 (Redmi Note 9, Redmi 10X 4G)", "5020 mAh", "BN54", "Redmi Note 9 (4G) et Redmi 10X 4G"),
  entry(XIAOMI, "bn59", "Batterie Xiaomi BN59 (Redmi Note 10 4G, Note 10S, Poco M5s)", "5000 mAh", "BN59", "Redmi Note 10 4G, Redmi Note 10S, Poco M5s"),
  entry(XIAOMI, "bn5a", "Batterie Xiaomi BN5A (Redmi Note 10 5G, Poco M3 Pro 5G)", "5000 mAh", "BN5A", "Redmi Note 10 5G, Poco M3 Pro 5G, Redmi Note 11 SE"),
  entry(XIAOMI, "bn5e", "Batterie Xiaomi BN5E (Redmi Note 11 4G, Note 11S, Poco M4 Pro 4G)", "5000 mAh", "BN5E", "Redmi Note 11 4G, Redmi Note 11S, Poco M4 Pro 4G"),
  entry(XIAOMI, "bm5a", "Batterie Xiaomi BM5A (Redmi Note 11 Pro, Poco X4 Pro 5G)", "5000 mAh", "BM5A", "Redmi Note 11 Pro 4G, Redmi Note 11 Pro 5G, Poco X4 Pro 5G"),
  entry(XIAOMI, "bn50", "Batterie Xiaomi BN50 (Redmi Note 12 4G, Note 12 5G, Poco X5 5G)", "5000 mAh", "BN50", "Redmi Note 12 4G, Redmi Note 12 5G, Poco X5 5G"),
  entry(XIAOMI, "bp4k", "Batterie Xiaomi BP4K (Redmi Note 12 Pro 5G, Pro+ 5G)", "5000 mAh", "BP4K", "Redmi Note 12 Pro 5G et Redmi Note 12 Pro+ 5G"),
  entry(XIAOMI, "bm5r-bm5s", "Batterie Xiaomi BM5R / BM5S (Redmi Note 13 4G/5G, Poco M6 Pro)", "5000 mAh", "BM5R / BM5S", "Redmi Note 13 4G, Redmi Note 13 5G, Poco M6 Pro"),
  entry(XIAOMI, "bm5t-bm5u", "Batterie Xiaomi BM5T / BM5U (Redmi Note 13 Pro, Poco X6 5G)", "5100 / 5000 mAh", "BM5T / BM5U", "Redmi Note 13 Pro 5G, Redmi Note 13 Pro+ 5G, Poco X6 5G"),
  entry(XIAOMI, "bm5x-bm5y", "Batterie Xiaomi BM5X / BM5Y (Redmi Note 14 5G/Pro, Poco X7)", "5110 / 5500 mAh", "BM5X / BM5Y", "Redmi Note 14 5G, Redmi Note 14 Pro 5G, Poco X7 Series"),
];

function description(b) {
  return [
    `${b.name} de remplacement, capacité ${b.capacity}.`,
    `Référence constructeur : ${b.ref}.`,
    `Compatible avec : ${b.compat}.`,
    "Batterie Li-ion rechargeable de qualité, sélectionnée pour restaurer l'autonomie d'origine de votre appareil.",
    "Installation par un technicien recommandée. Produit disponible en arrivage : contactez-nous pour connaître le délai exact.",
  ].join(" ");
}

function specs(b) {
  return {
    "Capacité": b.capacity,
    "Référence": b.ref,
    "Compatibilité": b.compat,
    "Type": "Li-ion rechargeable",
    "Statut": "En arrivage",
  };
}

module.exports = { batteries, description, specs };

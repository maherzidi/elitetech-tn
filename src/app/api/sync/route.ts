import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

// Synchronisation avec l'application de caisse "EliteTech Gestion".
// Protocole : POST /api/sync  { events: [...], since: number }
// En-tete     : Authorization: Bearer <SYNC_TOKEN>
// Reponse     : { products: [...], cursor: number }
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Ev = Record<string, any>;

function authorized(req: NextRequest): boolean {
  const expected = process.env.SYNC_TOKEN;
  if (!expected) return false;
  const header = req.headers.get("authorization") || "";
  const got = header.replace(/^Bearer\s+/i, "").trim();
  if (!got || got.length !== expected.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(got), Buffer.from(expected));
  } catch {
    return false;
  }
}

const num = (v: unknown, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const slugify = (v: string) =>
  v
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70) || "divers";

// Certains noms arrivent de la caisse deja casses ("clÃ© usb"). On les repare.
function fixMojibake(value: unknown): string {
  const s = String(value ?? "");
  if (!/[ÃÂ]/.test(s)) return s;
  const repaired = Buffer.from(s, "latin1").toString("utf8");
  return repaired.includes("\uFFFD") ? s : repaired;
}

const normName = (v: string) =>
  v
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();

async function uniqueCategorySlug(base: string) {
  let candidate = base.slice(0, 70) || "divers";
  let i = 2;
  while (await prisma.category.findUnique({ where: { slug: candidate } })) {
    candidate = `${base.slice(0, 65)}-${i++}`;
  }
  return candidate;
}

// La caisse envoie la sous-categorie dans "cat" (et "sub" est vide).
// On rattache donc le produit a une categorie existante au lieu d'en recreer une.
async function resolveCategory(name?: string, sub?: string) {
  const catName = fixMojibake(name).trim();
  if (!catName) return null;

  const all = await prisma.category.findMany({
    select: { id: true, name: true, slug: true, parentId: true },
  });
  const key = normName(catName);

  const subName = fixMojibake(sub).trim();
  if (subName) {
    const parent =
      all.find((c) => c.parentId === null && normName(c.name) === key) ??
      all.find((c) => normName(c.name) === key);
    if (parent) {
      const child = all.find(
        (c) => c.parentId === parent.id && normName(c.name) === normName(subName)
      );
      if (child) return prisma.category.findUnique({ where: { id: child.id } });
      return prisma.category.create({
        data: {
          name: subName,
          slug: await uniqueCategorySlug(`${parent.slug}-${slugify(subName)}`),
          parentId: parent.id,
        },
      });
    }
  }

  const match =
    all.find((c) => c.parentId !== null && normName(c.name) === key) ??
    all.find((c) => normName(c.name) === key);
  if (match) return prisma.category.findUnique({ where: { id: match.id } });

  // La caisse concatene parfois la categorie et la sous-categorie
  // ("Téléphonie & TabletteTéléphones") : on rattache au bon parent au lieu
  // de creer une categorie racine en double.
  const rootPrefix = all
    .filter(
      (c) => c.parentId === null && key.startsWith(normName(c.name)) && key !== normName(c.name)
    )
    .sort((a, b) => b.name.length - a.name.length)[0];
  if (rootPrefix) {
    const rest = key.slice(normName(rootPrefix.name).length).trim();
    const child = all.find(
      (c) =>
        c.parentId === rootPrefix.id &&
        rest &&
        (normName(c.name).includes(rest) || rest.includes(normName(c.name)))
    );
    const target = child ?? all.find((c) => c.parentId === rootPrefix.id) ?? rootPrefix;
    return prisma.category.findUnique({ where: { id: target.id } });
  }

  return prisma.category.create({
    data: { name: catName, slug: await uniqueCategorySlug(slugify(catName)) },
  });
}

async function resolveBrand(name?: string) {
  const brandName = fixMojibake(name).trim();
  if (!brandName) return null;
  return prisma.brand.upsert({
    where: { name: brandName },
    update: {},
    create: { name: brandName },
  });
}

async function findProductByAppId(appId: unknown) {
  return prisma.product.findFirst({ where: { externalId: String(appId) } });
}

async function handleProduct(p: Ev) {
  const externalId = String(p.id);
  const sku = String(p.code || `C-${externalId}`).trim() || `C-${externalId}`;
  const name = fixMojibake(p.name || "").trim() || sku;

  const [category, brand] = await Promise.all([
    resolveCategory(p.cat, p.sub),
    resolveBrand(p.brand),
  ]);

  const existing = await prisma.product.findFirst({
    where: { OR: [{ externalId }, { sku }] },
  });

  const data = {
    externalId,
    sku,
    name,
    price: num(p.price),
    purchasePrice: num(p.buy),
    lowStockAlert: Math.max(0, Math.trunc(num(p.min, 3))),
    categoryId: category?.id ?? null,
    brandId: brand?.id ?? null,
    isActive: true,
  };

  if (existing) {
    await prisma.product.update({ where: { id: existing.id }, data });
  } else {
    await prisma.product.create({
      data: {
        ...data,
        slug: `${slugify(name)}-${slugify(externalId)}`.slice(0, 90),
      },
    });
  }
}

async function handleDelete(appId: unknown) {
  await prisma.product.updateMany({
    where: { externalId: String(appId) },
    data: { isActive: false },
  });
}

async function handleMove(appId: unknown, delta: number) {
  const product = await findProductByAppId(appId);
  if (!product || !delta) return;

  await prisma.$transaction([
    prisma.stockMovement.create({
      data: {
        productId: product.id,
        type: delta > 0 ? "ENTREE" : "VENTE_CAISSE",
        quantity: delta,
        source: "CAISSE",
        note: "Synchronisation caisse",
      },
    }),
    prisma.product.update({
      where: { id: product.id },
      data: { stock: { increment: delta } },
    }),
  ]);
}

async function handleSale(s: Ev) {
  if (!s) return;
  const orderNumber = String(s.no || "").trim();
  if (!orderNumber) return;

  const already = await prisma.order.findUnique({ where: { orderNumber } });
  if (already) return;

  const lines: Ev[] = Array.isArray(s.lines) ? s.lines : [];
  const items: { productId: string; productName: string; sku: string; unitPrice: number; quantity: number }[] = [];

  for (const line of lines) {
    const product = await findProductByAppId(line?.id);
    if (!product) continue;
    items.push({
      productId: product.id,
      productName: String(line?.name || product.name),
      sku: product.sku,
      unitPrice: num(line?.price),
      quantity: Math.max(1, Math.trunc(num(line?.qty, 1))),
    });
  }

  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const total = num(s.total, subtotal);
  const client = s.client || {};
  const credit = s.credit;

  await prisma.order.create({
    data: {
      orderNumber,
      customerName: String(client.name || "Client comptoir").trim() || "Client comptoir",
      customerPhone: String(client.tel || "-").trim() || "-",
      address: String(client.adr || "Vente en magasin").trim() || "Vente en magasin",
      city: "Hammamet",
      subtotal,
      shippingCost: 0,
      total,
      status: "LIVREE",
      paymentMethod: "COD",
      paymentStatus: credit ? "NON_PAYE" : "PAYE",
      notes: `Caisse · ${String(s.pay || "Espèces")}${credit ? " (crédit)" : ""} · vendeur ${String(s.by || "-")}`,
      items: {
        create: items.map((i) => ({
          productId: i.productId,
          productName: i.productName,
          sku: i.sku,
          unitPrice: i.unitPrice,
          quantity: i.quantity,
          total: i.unitPrice * i.quantity,
        })),
      },
    },
  });
}

async function handleRepair(r: Ev) {
  if (!r) return;
  const reference = String(r.no || "").trim();
  if (!reference) return;

  const marker = `Caisse:${reference}`;
  const already = await prisma.repairRequest.findFirst({ where: { notes: { startsWith: marker } } });
  if (already) return;

  const price = num(r.price);
  await prisma.repairRequest.create({
    data: {
      deviceModel: String(r.dev || "Appareil").trim() || "Appareil",
      issueLabel: String(r.issue || "Diagnostic").trim() || "Diagnostic",
      estimatedMin: price,
      estimatedMax: price,
      customerName: String(r.name || "Client").trim() || "Client",
      customerPhone: String(r.tel || "-").trim() || "-",
      status: "NOUVELLE",
      notes: `${marker} IMEI:${String(r.imei || "-")} Dépôt:${num(r.dep)} Statut:${String(r.st || "-")}`,
    },
  });
}

async function applyEvent(ev: Ev) {
  switch (ev.t) {
    case "product":
      await handleProduct(ev.p || {});
      break;
    case "del":
      await handleDelete(ev.pid);
      break;
    case "move":
      await handleMove(ev.pid, Math.trunc(num(ev.d)));
      break;
    case "sale":
      await handleSale(ev.s || {});
      break;
    case "repair":
      await handleRepair(ev.r || {});
      break;
    default:
      break;
  }
}

export async function POST(req: NextRequest) {
  if (!process.env.SYNC_TOKEN) {
    return NextResponse.json(
      { error: "Synchronisation non configurée (SYNC_TOKEN absent)" },
      { status: 503 }
    );
  }
  if (!authorized(req)) {
    return NextResponse.json({ error: "Code de synchronisation refusé" }, { status: 401 });
  }

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 });
  }

  const events: Ev[] = Array.isArray(body?.events) ? body.events : [];

  for (const ev of events) {
    const id = String(ev?.id || "").trim();
    if (!id) continue;
    try {
      const seen = await prisma.syncEvent.findUnique({ where: { id } });
      if (seen) continue;
      await applyEvent(ev);
      await prisma.syncEvent.create({ data: { id, type: String(ev.t || "?") } });
    } catch (error) {
      console.error("[sync] événement ignoré", id, error);
    }
  }

  const products = await prisma.product.findMany({
    include: { category: true, brand: true },
    orderBy: { createdAt: "asc" },
    take: 5000,
  });

  return NextResponse.json({
    ok: true,
    cursor: Date.now(),
    products: products.map((p) => ({
      id: p.externalId || p.sku,
      code: p.sku,
      name: p.name,
      cat: p.category?.name || "",
      sub: "",
      brand: p.brand?.name || "",
      sup: "",
      price: Number(p.price),
      buy: Number(p.purchasePrice),
      min: p.lowStockAlert,
      qty: p.stock,
      deleted: !p.isActive,
    })),
  });
}

export async function GET() {
  return NextResponse.json(
    { ok: true, endpoint: "/api/sync", method: "POST" },
    { status: 200 }
  );
}

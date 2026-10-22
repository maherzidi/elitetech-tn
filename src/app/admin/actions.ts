"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAdminSession, clearAdminSession } from "@/lib/auth";
import { generateSellerCode } from "@/lib/format";

async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) redirect("/admin-login");
  return session;
}

function slugify(text: string) {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

// ---------- Produits ----------

export async function createProduct(formData: FormData) {
  await requireAdmin();

  const name = String(formData.get("name") || "");
  const nameAr = String(formData.get("nameAr") || "") || null;
  const sku = String(formData.get("sku") || "");
  const description = String(formData.get("description") || "") || null;
  const price = parseFloat(String(formData.get("price") || "0"));
  const purchasePrice = parseFloat(String(formData.get("purchasePrice") || "0"));
  const comparePriceRaw = String(formData.get("comparePrice") || "");
  const stock = parseInt(String(formData.get("stock") || "0"), 10);
  const categoryId = String(formData.get("categoryId") || "") || null;
  const isFeatured = formData.get("isFeatured") === "on";
  const sellerCommission = parseFloat(String(formData.get("sellerCommission") || "0"));

  await prisma.product.create({
    data: {
      name,
      nameAr,
      slug: `${slugify(name)}-${Date.now().toString().slice(-5)}`,
      sku,
      description,
      price,
      purchasePrice,
      comparePrice: comparePriceRaw ? parseFloat(comparePriceRaw) : null,
      stock,
      categoryId,
      isFeatured,
      sellerCommission,
      images: ["/images/placeholder-product.svg"],
    },
  });

  revalidatePath("/admin/produits");
  redirect("/admin/produits");
}

export async function updateProduct(productId: string, formData: FormData) {
  await requireAdmin();

  const name = String(formData.get("name") || "");
  const nameAr = String(formData.get("nameAr") || "") || null;
  const sku = String(formData.get("sku") || "");
  const description = String(formData.get("description") || "") || null;
  const price = parseFloat(String(formData.get("price") || "0"));
  const purchasePrice = parseFloat(String(formData.get("purchasePrice") || "0"));
  const comparePriceRaw = String(formData.get("comparePrice") || "");
  const stock = parseInt(String(formData.get("stock") || "0"), 10);
  const categoryId = String(formData.get("categoryId") || "") || null;
  const isFeatured = formData.get("isFeatured") === "on";
  const isActive = formData.get("isActive") === "on";
  const sellerCommission = parseFloat(String(formData.get("sellerCommission") || "0"));

  await prisma.product.update({
    where: { id: productId },
    data: {
      name,
      nameAr,
      sku,
      description,
      price,
      purchasePrice,
      comparePrice: comparePriceRaw ? parseFloat(comparePriceRaw) : null,
      stock,
      categoryId,
      isFeatured,
      isActive,
      sellerCommission,
    },
  });

  revalidatePath("/admin/produits");
  redirect("/admin/produits");
}

export async function deleteProduct(productId: string) {
  await requireAdmin();
  await prisma.product.delete({ where: { id: productId } });
  revalidatePath("/admin/produits");
}

// ---------- Catégories ----------

export async function createCategory(formData: FormData) {
  await requireAdmin();

  const name = String(formData.get("name") || "");
  const nameAr = String(formData.get("nameAr") || "") || null;
  const parentId = String(formData.get("parentId") || "") || null;

  await prisma.category.create({
    data: { name, nameAr, slug: `${slugify(name)}-${Date.now().toString().slice(-4)}`, parentId },
  });

  revalidatePath("/admin/categories");
}

export async function deleteCategory(categoryId: string) {
  await requireAdmin();
  await prisma.category.delete({ where: { id: categoryId } });
  revalidatePath("/admin/categories");
}

// ---------- Stock / inventaire ----------

export async function adjustStock(formData: FormData) {
  await requireAdmin();

  const productId = String(formData.get("productId") || "");
  const delta = parseInt(String(formData.get("delta") || "0"), 10);
  const note = String(formData.get("note") || "") || null;

  if (!productId || !delta) return;

  await prisma.$transaction([
    prisma.product.update({
      where: { id: productId },
      data: { stock: { increment: delta } },
    }),
    prisma.stockMovement.create({
      data: {
        productId,
        type: "AJUSTEMENT",
        quantity: delta,
        source: "ADMIN",
        note: note || "Ajustement manuel depuis l'administration",
      },
    }),
  ]);

  revalidatePath("/admin/stock");
  revalidatePath("/admin/produits");
}

// ---------- Commandes ----------

export async function updateOrderStatus(orderId: string, formData: FormData) {
  await requireAdmin();
  const status = String(formData.get("status") || "");
  const paymentStatus = String(formData.get("paymentStatus") || "");

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: status as any,
      paymentStatus: paymentStatus as any,
    },
  });

  revalidatePath(`/admin/commandes/${orderId}`);
  revalidatePath("/admin/commandes");
}

// ---------- Programme Vendeur ----------

export async function approveSeller(sellerId: string) {
  await requireAdmin();
  const seller = await prisma.seller.findUnique({ where: { id: sellerId } });
  if (!seller) return;

  const code = seller.code || generateSellerCode(seller.name);

  await prisma.seller.update({
    where: { id: sellerId },
    data: { status: "APPROUVE", code },
  });

  revalidatePath("/admin/vendeurs");
}

export async function rejectSeller(sellerId: string) {
  await requireAdmin();
  await prisma.seller.update({ where: { id: sellerId }, data: { status: "REFUSE" } });
  revalidatePath("/admin/vendeurs");
}

export async function suspendSeller(sellerId: string) {
  await requireAdmin();
  await prisma.seller.update({ where: { id: sellerId }, data: { status: "SUSPENDU" } });
  revalidatePath("/admin/vendeurs");
}

export async function reactivateSeller(sellerId: string) {
  await requireAdmin();
  await prisma.seller.update({ where: { id: sellerId }, data: { status: "APPROUVE" } });
  revalidatePath("/admin/vendeurs");
}

// ---------- Session ----------

export async function logoutAction() {
  clearAdminSession();
  redirect("/admin-login");
}

// ---------- Service Reparation ----------

export async function createRepairIssueType(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") || "");
  const nameAr = String(formData.get("nameAr") || "") || null;
  const minPrice = parseFloat(String(formData.get("minPrice") || "0"));
  const maxPrice = parseFloat(String(formData.get("maxPrice") || "0"));

  await prisma.repairIssueType.create({
    data: { name, nameAr, minPrice, maxPrice },
  });

  revalidatePath("/admin/reparations");
  revalidatePath("/reparation");
}

export async function deleteRepairIssueType(id: string) {
  await requireAdmin();
  await prisma.repairIssueType.delete({ where: { id } });
  revalidatePath("/admin/reparations");
  revalidatePath("/reparation");
}

export async function updateRepairRequestStatus(requestId: string, formData: FormData) {
  await requireAdmin();
  const status = String(formData.get("status") || "");
  await prisma.repairRequest.update({
    where: { id: requestId },
    data: { status: status as any },
  });
  revalidatePath("/admin/reparations");
}

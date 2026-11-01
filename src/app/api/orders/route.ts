import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/format";
import { resolveProductColor } from "@/lib/product-variants";

const SHIPPING_COST = 7;

const OrderSchema = z.object({
  customer: z.object({
    name: z.string().min(2),
    phone: z.string().min(6),
    email: z.string().email().optional().or(z.literal("")),
    address: z.string().min(3),
    city: z.string().min(2),
    notes: z.string().optional(),
  }),
  sellerCode: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().min(1),
        color: z.string().trim().max(40).optional().nullable(),
      })
    )
    .min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = OrderSchema.parse(await req.json());

    const productIds = [...new Set(body.items.map((i) => i.productId))];
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } });

    if (products.length !== productIds.length) {
      return NextResponse.json({ error: "Un ou plusieurs produits sont introuvables." }, { status: 400 });
    }

    for (const item of body.items) {
      const product = products.find((p) => p.id === item.productId)!;
      if (item.color && !resolveProductColor(product.specs, item.color)) {
        return NextResponse.json(
          { error: `Le coloris choisi pour "${product.name}" n'est plus disponible.` },
          { status: 400 }
        );
      }
    }

    // Un même produit peut être commandé en plusieurs coloris : le stock est
    // vérifié sur la quantité totale, pas ligne par ligne.
    const quantityByProduct = new Map<string, number>();
    for (const item of body.items) {
      quantityByProduct.set(
        item.productId,
        (quantityByProduct.get(item.productId) ?? 0) + item.quantity
      );
    }

    for (const [productId, quantity] of quantityByProduct) {
      const product = products.find((p) => p.id === productId)!;
      if (product.stock < quantity) {
        return NextResponse.json(
          { error: `Stock insuffisant pour "${product.name}" (${product.stock} disponible(s)).` },
          { status: 400 }
        );
      }
    }

    const subtotal = body.items.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.productId)!;
      return sum + Number(product.price) * item.quantity;
    }, 0);

    // Programme Vendeur : le code n'est associe que s'il correspond a un
    // vendeur APPROUVE. Le gain n'est cree que pour un paiement en ligne
    // (voir plus bas) - pour le paiement a la livraison, le code est
    // simplement ignore pour le calcul du gain.
    let seller = null;
    if (body.sellerCode) {
      seller = await prisma.seller.findUnique({
        where: { code: body.sellerCode.trim().toUpperCase() },
      });
      if (!seller || seller.status !== "APPROUVE") {
        seller = null;
      }
    }

    const order = await prisma.$transaction(async (tx) => {
      const customer = await tx.customer.create({
        data: {
          name: body.customer.name,
          phone: body.customer.phone,
          email: body.customer.email || null,
          address: body.customer.address,
          city: body.customer.city,
        },
      });

      const createdOrder = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          customerId: customer.id,
          customerName: body.customer.name,
          customerPhone: body.customer.phone,
          customerEmail: body.customer.email || null,
          address: body.customer.address,
          city: body.customer.city,
          notes: body.customer.notes || null,
          subtotal,
          shippingCost: SHIPPING_COST,
          total: subtotal + SHIPPING_COST,
          sellerId: seller?.id || null,
          sellerCode: seller?.code || null,
          items: {
            create: body.items.map((item) => {
              const product = products.find((p) => p.id === item.productId)!;
              const color = resolveProductColor(product.specs, item.color);
              return {
                productId: product.id,
                productName: color ? `${product.name} (${color})` : product.name,
                sku: product.sku,
                unitPrice: product.price,
                quantity: item.quantity,
                total: Number(product.price) * item.quantity,
              };
            }),
          },
        },
      });

      // Programme Vendeur : le gain n'est genere que pour un paiement en
      // ligne (CARTE). La commande est creee en COD par defaut tant que le
      // paiement en ligne n'est pas active sur le site.
      if (seller && createdOrder.paymentMethod === "CARTE") {
        for (const item of body.items) {
          const product = products.find((p) => p.id === item.productId)!;
          const unitCommission = Number(product.sellerCommission);
          if (unitCommission > 0) {
            await tx.sellerEarning.create({
              data: {
                sellerId: seller.id,
                orderId: createdOrder.id,
                productId: product.id,
                quantity: item.quantity,
                unitCommission,
                totalCommission: unitCommission * item.quantity,
              },
            });
          }
        }
      }

      // Decremente le stock et journalise le mouvement (partage avec la caisse)
      for (const item of body.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            type: "VENTE_SITE",
            quantity: -item.quantity,
            source: "SITE",
            orderId: createdOrder.id,
            note: `Commande ${createdOrder.orderNumber}`,
          },
        });
      }

      return createdOrder;
    });

    return NextResponse.json({ orderId: order.id, orderNumber: order.orderNumber });
  } catch (err: any) {
    if (err?.issues) {
      return NextResponse.json({ error: "Formulaire invalide, vérifiez les champs." }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Erreur serveur, merci de réessayer." }, { status: 500 });
  }
}

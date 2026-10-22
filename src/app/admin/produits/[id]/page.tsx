import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductForm from "@/components/admin/ProductForm";
import { updateProduct } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id: params.id } }),
    prisma.category.findMany({ include: { parent: true }, orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();

  const boundUpdate = updateProduct.bind(null, product.id);

  return (
    <div>
      <h1 className="mb-6 font-sora text-2xl font-bold text-navy-900">Modifier : {product.name}</h1>
      <ProductForm
        action={boundUpdate}
        categories={categories as any}
        product={{
          name: product.name,
          nameAr: product.nameAr,
          sku: product.sku,
          description: product.description,
          price: Number(product.price),
          purchasePrice: Number(product.purchasePrice),
          comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
          stock: product.stock,
          categoryId: product.categoryId,
          isFeatured: product.isFeatured,
          isActive: product.isActive,
          sellerCommission: Number(product.sellerCommission),
        }}
      />
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import ProductForm from "@/components/admin/ProductForm";
import { createProduct } from "../../actions";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    include: { parent: true },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <h1 className="mb-6 font-sora text-2xl font-bold text-navy-900">Nouveau produit</h1>
      <ProductForm action={createProduct} categories={categories as any} />
    </div>
  );
}

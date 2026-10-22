import { prisma } from "@/lib/prisma";
import DeleteButton from "@/components/admin/DeleteButton";
import { createCategory, deleteCategory } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: { order: "asc" },
    include: { children: { orderBy: { order: "asc" } } },
  });
  const allCategories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="mb-6 font-sora text-2xl font-bold text-navy-900">Catégories</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {categories.map((cat) => (
            <div key={cat.id} className="card p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-semibold text-ink">{cat.name}</span>
                <DeleteButton id={cat.id} action={deleteCategory} confirmText="Supprimer cette catégorie et ses sous-catégories ?" />
              </div>
              {cat.children.length > 0 && (
                <ul className="ml-4 space-y-1 border-l border-black/10 pl-4 text-sm">
                  {cat.children.map((sub) => (
                    <li key={sub.id} className="flex items-center justify-between">
                      <span className="text-ink/70">{sub.name}</span>
                      <DeleteButton id={sub.id} action={deleteCategory} confirmText="Supprimer cette sous-catégorie ?" />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        <div className="card h-fit p-5">
          <h2 className="mb-4 font-semibold text-ink">Ajouter une catégorie</h2>
          <form action={createCategory} className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Nom (FR) *</label>
              <input
                name="name"
                required
                className="w-full rounded-md border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Nom (AR)</label>
              <input
                name="nameAr"
                dir="rtl"
                className="w-full rounded-md border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Catégorie parente</label>
              <select
                name="parentId"
                className="w-full rounded-md border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="">— Catégorie principale —</option>
                {allCategories
                  .filter((c) => !c.parentId)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </div>
            <button type="submit" className="btn-primary w-full">
              Ajouter
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

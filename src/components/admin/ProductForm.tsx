type Category = { id: string; name: string; parent: { name: string } | null };

export default function ProductForm({
  action,
  categories,
  product,
}: {
  action: (formData: FormData) => Promise<void>;
  categories: Category[];
  product?: {
    name: string;
    nameAr: string | null;
    sku: string;
    description: string | null;
    price: number;
    purchasePrice: number;
    comparePrice: number | null;
    stock: number;
    categoryId: string | null;
    isFeatured: boolean;
    isActive: boolean;
    sellerCommission?: number;
  };
}) {
  return (
    <form action={action} className="card space-y-4 p-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Nom du produit (FR) *</label>
          <input
            name="name"
            required
            defaultValue={product?.name}
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Nom du produit (AR)</label>
          <input
            name="nameAr"
            dir="rtl"
            defaultValue={product?.nameAr || ""}
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">SKU / Référence *</label>
          <input
            name="sku"
            required
            defaultValue={product?.sku}
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Catégorie</label>
          <select
            name="categoryId"
            defaultValue={product?.categoryId || ""}
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="">— Aucune —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.parent ? `${c.parent.name} > ${c.name}` : c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-ink">Description</label>
        <textarea
          name="description"
          rows={4}
          defaultValue={product?.description || ""}
          className="w-full rounded-md border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Prix d&apos;achat</label>
          <input
            type="number"
            step="0.001"
            name="purchasePrice"
            defaultValue={product?.purchasePrice}
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Prix de vente *</label>
          <input
            type="number"
            step="0.001"
            required
            name="price"
            defaultValue={product?.price}
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Prix barré (promo)</label>
          <input
            type="number"
            step="0.001"
            name="comparePrice"
            defaultValue={product?.comparePrice || ""}
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Stock *</label>
          <input
            type="number"
            required
            name="stock"
            defaultValue={product?.stock ?? 0}
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Commission vendeur (DT)</label>
          <input
            type="number"
            step="0.001"
            name="sellerCommission"
            defaultValue={product?.sellerCommission ?? 0}
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <p className="mt-1 text-xs text-ink/40">Programme Vendeur : gain versé si acheté via un code, en ligne.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isFeatured" defaultChecked={product?.isFeatured} />
          Mettre en avant sur la page d&apos;accueil
        </label>
        {product && (
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isActive" defaultChecked={product?.isActive} />
            Produit actif (visible sur le site)
          </label>
        )}
      </div>

      <p className="text-xs text-ink/40">
        Les photos ne sont pas encore gérées ici — un visuel provisoire est utilisé. Tu pourras brancher l&apos;envoi
        d&apos;images plus tard (voir le README).
      </p>

      <button type="submit" className="btn-primary">
        Enregistrer
      </button>
    </form>
  );
}

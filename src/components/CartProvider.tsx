"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type CartItem = {
  productId: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  image: string | null;
  quantity: number;
  stock: number;
  color: string | null;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity" | "color"> & { color?: string | null }, qty?: number) => void;
  removeItem: (key: string) => void;
  updateQuantity: (key: string, qty: number) => void;
  clearCart: () => void;
  subtotal: number;
  count: number;
};

const CartContext = createContext<CartContextType | null>(null);
const STORAGE_KEY = "elitetech_cart";

/** Identifie une ligne de panier : un même produit peut avoir plusieurs coloris. */
export function cartItemKey(item: Pick<CartItem, "productId" | "color">): string {
  return `${item.productId}::${item.color ?? ""}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          // Les paniers enregistrés avant l'ajout des coloris n'ont pas le champ.
          setItems(parsed.map((item) => ({ ...item, color: item.color ?? null })));
        }
      }
    } catch {
      // ignore
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, loaded]);

  function addItem(
    item: Omit<CartItem, "quantity" | "color"> & { color?: string | null },
    qty = 1,
  ) {
    const nextItem: CartItem = { ...item, color: item.color?.trim() || null, quantity: 0 };
    const key = cartItemKey(nextItem);

    setItems((prev) => {
      const existing = prev.find((entry) => cartItemKey(entry) === key);
      if (existing) {
        const newQty = Math.min(existing.quantity + qty, existing.stock || 99);
        return prev.map((entry) =>
          cartItemKey(entry) === key ? { ...entry, quantity: newQty } : entry,
        );
      }
      return [...prev, { ...nextItem, quantity: Math.min(qty, nextItem.stock || 99) }];
    });
  }

  function removeItem(key: string) {
    setItems((prev) => prev.filter((entry) => cartItemKey(entry) !== key));
  }

  function updateQuantity(key: string, qty: number) {
    setItems((prev) =>
      prev.map((entry) =>
        cartItemKey(entry) === key
          ? { ...entry, quantity: Math.max(1, Math.min(qty, entry.stock || 99)) }
          : entry,
      ),
    );
  }

  function clearCart() {
    setItems([]);
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, subtotal, count }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart doit être utilisé dans CartProvider");
  return ctx;
}

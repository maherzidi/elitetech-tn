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
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, qty: number) => void;
  clearCart: () => void;
  subtotal: number;
  count: number;
};

const CartContext = createContext<CartContextType | null>(null);
const STORAGE_KEY = "elitetech_cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
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

  function addItem(item: Omit<CartItem, "quantity">, qty = 1) {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === item.productId);
      if (existing) {
        const newQty = Math.min(existing.quantity + qty, existing.stock || 99);
        return prev.map((i) => (i.productId === item.productId ? { ...i, quantity: newQty } : i));
      }
      return [...prev, { ...item, quantity: Math.min(qty, item.stock || 99) }];
    });
  }

  function removeItem(productId: string) {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }

  function updateQuantity(productId: string, qty: number) {
    setItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, quantity: Math.max(1, Math.min(qty, i.stock || 99)) } : i))
    );
  }

  function clearCart() {
    setItems([]);
  }

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

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

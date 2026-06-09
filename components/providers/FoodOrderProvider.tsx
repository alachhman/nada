import { createContext, useContext, useState } from "react";
import type { CartItem } from "@/lib/types";
import type { MenuItem, Restaurant } from "@/lib/food";
import { menuItemToCartItem } from "@/lib/food";

interface FoodOrderCtx {
  restaurant: Restaurant | null;
  items: CartItem[];
  total: number;
  setRestaurant: (r: Restaurant) => void;
  add: (m: MenuItem) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
}

const Ctx = createContext<FoodOrderCtx | null>(null);

export function FoodOrderProvider({ children }: { children: React.ReactNode }) {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [items, setItems] = useState<CartItem[]>([]);

  const add = (m: MenuItem) =>
    setItems((prev) => {
      const found = prev.find((i) => i.id === m.id);
      if (found) return prev.map((i) => (i.id === m.id ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, menuItemToCartItem(m)];
    });

  const remove = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));

  const setQty = (id: string, qty: number) =>
    setItems((prev) =>
      qty <= 0 ? prev.filter((i) => i.id !== id) : prev.map((i) => (i.id === id ? { ...i, qty } : i)),
    );

  const clear = () => setItems([]);

  const total = items.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <Ctx.Provider value={{ restaurant, items, total, setRestaurant, add, remove, setQty, clear }}>
      {children}
    </Ctx.Provider>
  );
}

export function useFoodOrder(): FoodOrderCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useFoodOrder must be used within FoodOrderProvider");
  return ctx;
}

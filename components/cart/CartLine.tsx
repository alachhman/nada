"use client";

import Image from "next/image";
import { usd } from "@/lib/format";
import type { CartItem } from "@/lib/types";
import { useCart } from "@/components/providers/CartProvider";

export function CartLine({ item }: { item: CartItem }) {
  const { setQty, remove } = useCart();
  return (
    <div className="flex items-center gap-3 rounded-xl p-3" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
      <div className="relative h-14 w-14 rounded-lg overflow-hidden shrink-0" style={{ background: "var(--bg)" }}>
        {item.image ? <Image src={item.image} alt={item.name} fill className="object-cover" sizes="56px" /> : null}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{item.name}</div>
        <div className="text-sm" style={{ color: "var(--positive)" }}>{usd(item.price)}</div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => setQty(item.id, item.qty - 1)} className="h-7 w-7 rounded-full border" style={{ borderColor: "var(--border)" }}>−</button>
        <span className="w-5 text-center text-sm">{item.qty}</span>
        <button onClick={() => setQty(item.id, item.qty + 1)} className="h-7 w-7 rounded-full border" style={{ borderColor: "var(--border)" }}>+</button>
      </div>
      <button onClick={() => remove(item.id)} className="text-xs ml-1" style={{ color: "var(--muted)" }}>Remove</button>
    </div>
  );
}

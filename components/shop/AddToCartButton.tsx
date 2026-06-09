"use client";

import { useRouter } from "next/navigation";
import { useCart } from "@/components/providers/CartProvider";
import type { Product } from "@/lib/types";

export function AddToCartButton({ product }: { product: Product }) {
  const { add } = useCart();
  const router = useRouter();
  return (
    <div className="flex gap-3 mt-5">
      <button
        onClick={() => add(product)}
        className="flex-1 rounded-xl py-3 font-semibold"
        style={{ background: "var(--accent)", color: "var(--accent-fg)" }}
      >
        Add to cart
      </button>
      <button
        onClick={() => { add(product); router.push("/cart"); }}
        className="rounded-xl py-3 px-5 font-semibold border"
        style={{ borderColor: "var(--border)" }}
      >
        Buy now
      </button>
    </div>
  );
}

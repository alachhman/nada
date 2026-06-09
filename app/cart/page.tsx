"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/ui/AppHeader";
import { CartLine } from "@/components/cart/CartLine";
import { InterceptOverlay } from "@/components/intercept/InterceptOverlay";
import { useCart } from "@/components/providers/CartProvider";
import { useNada } from "@/components/providers/NadaProvider";
import { usd } from "@/lib/format";

export default function CartPage() {
  const { items, total, clear } = useCart();
  const { intercept } = useNada();
  const router = useRouter();
  const [overlay, setOverlay] = useState<{ amount: number } | null>(null);

  const checkout = () => {
    if (items.length === 0) return;
    const saved = intercept(items);
    clear();
    setOverlay({ amount: saved });
  };

  return (
    <main className="min-h-screen">
      <AppHeader />
      <div className="max-w-xl mx-auto px-5 pb-16">
        <h1 className="text-2xl font-semibold py-6">Your cart</h1>

        {items.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-sm" style={{ color: "var(--muted)" }}>Nothing here yet.</div>
            <Link href="/shop" className="inline-block mt-4 rounded-xl py-3 px-6 font-semibold" style={{ background: "var(--accent)", color: "var(--accent-fg)" }}>
              Browse the shop
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {items.map((i) => <CartLine key={i.id} item={i} />)}
            </div>
            <div className="flex items-center justify-between mt-6 text-lg font-semibold">
              <span>Total</span>
              <span>{usd(total)}</span>
            </div>
            <button
              onClick={checkout}
              className="w-full mt-4 rounded-xl py-4 font-semibold text-lg"
              style={{ background: "var(--accent)", color: "var(--accent-fg)" }}
            >
              Check out
            </button>
            <p className="text-center text-xs mt-3" style={{ color: "var(--muted)" }}>
              (you know how this ends)
            </p>
          </>
        )}
      </div>

      {overlay && (
        <InterceptOverlay
          amount={overlay.amount}
          processingMs={2000}
          onClose={() => { setOverlay(null); router.push("/"); }}
        />
      )}
    </main>
  );
}

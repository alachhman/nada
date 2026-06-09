"use client";

import Link from "next/link";
import { useCart } from "@/components/providers/CartProvider";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export function AppHeader() {
  const { items } = useCart();
  const count = items.reduce((s, i) => s + i.qty, 0);
  return (
    <header
      className="flex items-center justify-between px-5 py-4 border-b"
      style={{ borderColor: "var(--border)" }}
    >
      <Link href="/" className="text-xl font-semibold tracking-tight">
        nada
      </Link>
      <div className="flex items-center gap-3">
        <Link href="/shop" className="text-sm" style={{ color: "var(--muted)" }}>
          Shop
        </Link>
        <Link href="/cart" className="text-sm" style={{ color: "var(--muted)" }}>
          Cart{count > 0 ? ` (${count})` : ""}
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}

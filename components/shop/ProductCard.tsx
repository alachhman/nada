import Link from "next/link";
import Image from "next/image";
import { usd } from "@/lib/format";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/shop/${product.id}`}
      className="rounded-2xl overflow-hidden block"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      <div className="relative aspect-square">
        <Image src={product.image} alt={product.name} fill className="object-cover" sizes="(max-width:640px) 50vw, 300px" />
      </div>
      <div className="p-3">
        <div className="text-sm font-medium truncate">{product.name}</div>
        <div className="text-xs" style={{ color: "var(--muted)" }}>
          {"★".repeat(product.rating)} {product.reviewCount.toLocaleString()}
        </div>
        <div className="text-sm font-semibold mt-1" style={{ color: "var(--positive)" }}>
          {usd(product.price)}
        </div>
      </div>
    </Link>
  );
}

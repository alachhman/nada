import { notFound } from "next/navigation";
import Image from "next/image";
import { AppHeader } from "@/components/ui/AppHeader";
import { ReviewBlock } from "@/components/shop/ReviewBlock";
import { AddToCartButton } from "@/components/shop/AddToCartButton";
import { CATALOG, getProduct } from "@/lib/catalog";
import { usd } from "@/lib/format";

export function generateStaticParams() {
  return CATALOG.map((p) => ({ id: p.id }));
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = getProduct(id);
  if (!product) notFound();

  return (
    <main className="min-h-screen">
      <AppHeader />
      <div className="max-w-xl mx-auto px-5 pb-16">
        <div className="relative aspect-square rounded-2xl overflow-hidden mt-4">
          <Image src={product.image} alt={product.name} fill className="object-cover" sizes="(max-width:640px) 100vw, 500px" />
        </div>
        <h1 className="text-2xl font-semibold mt-4">{product.name}</h1>
        <div className="text-sm" style={{ color: "var(--muted)" }}>
          {"★".repeat(product.rating)} {product.rating}.0 · {product.reviewCount.toLocaleString()} reviews
        </div>
        <div className="text-3xl font-bold mt-2" style={{ color: "var(--positive)" }}>
          {usd(product.price)}
        </div>
        <AddToCartButton product={product} />
        <ReviewBlock reviews={product.reviews} />
      </div>
    </main>
  );
}

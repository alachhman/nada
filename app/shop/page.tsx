import { AppHeader } from "@/components/ui/AppHeader";
import { ProductCard } from "@/components/shop/ProductCard";
import { CATALOG } from "@/lib/catalog";

export default function ShopPage() {
  return (
    <main className="min-h-screen">
      <AppHeader />
      <div className="max-w-3xl mx-auto px-5 pb-16">
        <h1 className="text-2xl font-semibold py-6">Everything you don’t need</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {CATALOG.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </main>
  );
}

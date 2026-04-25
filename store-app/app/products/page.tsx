import { Filter, Plus } from "lucide-react";
import ProductCard from "@/components/product-card";
import { mockProducts } from "@/lib/mock-data";

export default function ProductsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
          <p className="text-sm text-ink-500 mt-1">
            Upload photos and set the maximum discount the AI can offer for
            each product.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-600 hover:text-ink-900 border border-ink-200 bg-white rounded-lg px-3 py-2">
            <Filter className="size-4" />
            All categories
          </button>
          <button className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg px-3 py-2">
            <Plus className="size-4" />
            Add product
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 flex items-start gap-3">
        <div className="size-8 rounded-lg bg-amber-100 grid place-items-center shrink-0">
          <Plus className="size-4 text-amber-700" />
        </div>
        <div className="text-sm text-amber-900 leading-relaxed">
          <span className="font-semibold">You set the ceiling, the AI picks the offer.</span>{" "}
          Max discount is the highest the AI may apply — actual values depend on
          live demand, weather, and your monitoring signal.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {mockProducts.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}

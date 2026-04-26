import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black p-8">
      <main className="w-full max-w-2xl space-y-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">City Wallet — services</h1>
          <p className="text-zinc-500 mt-1">Demo backend: context, catalog, and Payone simulator.</p>
        </div>

        <Link
          href="/playground"
          className="block rounded-lg border border-zinc-200 dark:border-zinc-800 p-5 hover:border-zinc-400 dark:hover:border-zinc-600 transition"
        >
          <div className="text-sm font-medium">→ API Playground</div>
          <div className="text-xs text-zinc-500 mt-1">
            Visual UI with a Google Map to test the APIs (places, weather, events, merchants, density, scenario).
          </div>
        </Link>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Endpoints</h2>
          <ul className="text-xs font-mono space-y-1 text-zinc-700 dark:text-zinc-300">
            <li>GET    /api/weather?lat&amp;lon</li>
            <li>GET    /api/places?lat&amp;lon&amp;radius&amp;types</li>
            <li>GET    /api/places/details?placeId</li>
            <li>GET    /api/events?lat&amp;lon&amp;within</li>
            <li>GET    /api/merchants/nearby?lat&amp;lon&amp;radiusKm&amp;category</li>
            <li>GET    /api/merchants/[id]</li>
            <li>GET    /api/transactions/density?lat&amp;lon&amp;radiusKm&amp;windowMinutes</li>
            <li>GET    /api/transactions/scenario</li>
            <li>POST   /api/transactions/scenario   {"{"} merchantId, multiplier {"}"}</li>
            <li>DELETE /api/transactions/scenario?merchantId</li>
          </ul>
        </section>
      </main>
    </div>
  );
}

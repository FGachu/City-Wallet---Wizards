import { Building2, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

const inputCls =
  "w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500";

export function IdentityCard({
  name,
  setName,
  address,
  setAddress,
}: {
  name: string;
  setName: (v: string) => void;
  address: string;
  setAddress: (v: string) => void;
}) {
  return (
    <section className="rounded-2xl border border-ink-200 bg-white p-5 lg:p-6">
      <div className="flex items-start gap-3 mb-4">
        <span className="size-8 rounded-lg bg-ink-100 grid place-items-center shrink-0">
          <Building2 className="size-4 text-ink-700" />
        </span>
        <div>
          <h2 className="text-base font-semibold">Your venue</h2>
          <p className="text-xs text-ink-500 mt-0.5 leading-relaxed">
            We use the address to match the Handelsregister and find quiet
            windows nearby.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_1.4fr] gap-3">
        <label className="block">
          <div className="text-[11px] uppercase tracking-wider text-ink-500 mb-1">
            Restaurant name
          </div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Café Müller"
            className={inputCls}
          />
        </label>
        <label className="block">
          <div className="text-[11px] uppercase tracking-wider text-ink-500 mb-1">
            Address
          </div>
          <div className="relative">
            <MapPin className="size-4 text-ink-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Königstraße 12, 70173 Stuttgart"
              className={cn(inputCls, "pl-9")}
            />
          </div>
        </label>
      </div>
    </section>
  );
}

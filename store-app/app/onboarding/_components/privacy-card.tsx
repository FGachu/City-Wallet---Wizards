import { ShieldCheck } from "lucide-react";

export function PrivacyCard() {
  return (
    <div className="rounded-2xl border border-ink-200 bg-white p-4">
      <div className="flex items-start gap-2.5">
        <div className="size-8 rounded-lg bg-emerald-50 border border-emerald-100 grid place-items-center shrink-0">
          <ShieldCheck className="size-4 text-emerald-600" />
        </div>
        <div className="text-xs text-ink-600 leading-relaxed">
          <strong className="text-ink-900">GDPR by design.</strong> Customer
          location stays on-device. Only an abstract intent reaches the cloud.
        </div>
      </div>
    </div>
  );
}

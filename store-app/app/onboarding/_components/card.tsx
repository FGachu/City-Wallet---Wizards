import { Check, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CardStatus } from "./types";

export function Card({
  children,
  status = "active",
}: {
  children: React.ReactNode;
  status?: CardStatus;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border bg-white p-5 lg:p-6 transition",
        status === "locked" &&
          "opacity-50 pointer-events-none select-none border-ink-200",
        status === "active" &&
          "border-brand-200 shadow-[0_0_0_4px] shadow-brand-50/60",
        status === "done" && "border-ink-200"
      )}
    >
      {children}
    </section>
  );
}

export function CardHead({
  step,
  title,
  hint,
  status,
}: {
  step: string;
  title: string;
  hint: string;
  status?: CardStatus;
}) {
  const numberCls =
    status === "done"
      ? "bg-emerald-500 text-white"
      : status === "active"
      ? "bg-brand-500 text-white"
      : "bg-ink-100 text-ink-500";

  return (
    <div className="flex items-start gap-3 mb-5">
      <span
        className={cn(
          "size-8 rounded-lg grid place-items-center text-sm font-semibold shrink-0 transition",
          numberCls
        )}
      >
        {status === "done" ? <Check className="size-4" /> : step}
      </span>
      <div className="flex-1 min-w-0">
        <h2 className="text-base font-semibold">{title}</h2>
        <p className="text-xs text-ink-500 mt-0.5 leading-relaxed">{hint}</p>
      </div>
      {status && <StatusPill status={status} />}
    </div>
  );
}

function StatusPill({ status }: { status: CardStatus }) {
  if (status === "done")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider shrink-0">
        <Check className="size-3" />
        Done
      </span>
    );
  if (status === "active")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider shrink-0">
        <span className="relative size-1.5 rounded-full bg-brand-500">
          <span className="absolute inset-0 rounded-full bg-brand-500 animate-ping" />
        </span>
        Active
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-ink-100 border border-ink-200 text-ink-500 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider shrink-0">
      <Lock className="size-3" />
      Locked
    </span>
  );
}

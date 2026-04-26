import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { KPI } from "@/lib/types";

export default function StatCard({ label, value, change, trend }: KPI) {
  const Icon =
    trend === "up" ? ArrowUpRight : trend === "down" ? ArrowDownRight : Minus;
  const tone =
    trend === "up"
      ? "text-emerald-600 bg-emerald-50 border-emerald-200"
      : trend === "down"
        ? "text-rose-600 bg-rose-50 border-rose-200"
        : "text-ink-600 bg-ink-100 border-ink-200";
  return (
    <div className="rounded-xl border border-ink-200 bg-white p-5">
      <div className="text-xs text-ink-500">{label}</div>
      <div className="mt-2 flex items-end justify-between">
        <div className="text-2xl font-semibold tracking-tight">{value}</div>
        <span
          className={cn(
            "inline-flex items-center gap-1 text-[11px] font-medium border rounded-full px-2 py-0.5",
            tone
          )}
        >
          <Icon className="size-3" />
          {change}
        </span>
      </div>
    </div>
  );
}

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function LiveToggle({
  live,
  setLive,
  disabled,
  blockedReason,
}: {
  live: boolean;
  setLive: (v: boolean) => void;
  disabled: boolean;
  blockedReason?: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => setLive(!live)}
      aria-pressed={live}
      className={cn(
        "inline-flex items-center gap-2.5 rounded-xl border px-3 py-2 transition shadow-sm",
        disabled
          ? "border-ink-200 text-ink-300 cursor-not-allowed bg-white"
          : live
          ? "border-emerald-300 bg-emerald-50 text-emerald-700"
          : "border-ink-300 bg-white text-ink-700 hover:border-ink-400"
      )}
    >
      <span
        className={cn(
          "relative inline-flex w-9 h-5 rounded-full transition shrink-0",
          live ? "bg-emerald-500" : "bg-ink-300"
        )}
      >
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className={cn(
            "absolute top-0.5 size-4 rounded-full bg-white shadow",
            live ? "right-0.5" : "left-0.5"
          )}
        />
      </span>
      <div className="text-left">
        <div className="text-xs font-semibold leading-tight">
          {live ? "Live" : "Paused"}
        </div>
        <div className="text-[10px] leading-tight opacity-70">
          {disabled
            ? blockedReason ?? "Locked"
            : live
            ? "Pipeline running"
            : "Click to enable"}
        </div>
      </div>
      {live && (
        <span className="relative size-2 rounded-full bg-emerald-500 ml-1">
          <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping" />
        </span>
      )}
    </button>
  );
}

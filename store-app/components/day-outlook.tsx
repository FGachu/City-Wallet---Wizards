import { cn } from "@/lib/utils";

const HOURS = [
  { h: "09", state: "steady", label: "Morning Routine", volume: 40 },
  { h: "10", state: "steady", label: "Late Morning", volume: 50 },
  { h: "11", state: "bring", label: "Quiet Period", volume: 20 },
  { h: "12", state: "bring", label: "Pre-Lunch Lull", volume: 30 },
  { h: "13", state: "bring", label: "Lunch Dip", volume: 25 },
  { h: "14", state: "steady", label: "Post-Lunch", volume: 60 },
  { h: "15", state: "steady", label: "Afternoon", volume: 55 },
  { h: "16", state: "steady", label: "Late Afternoon", volume: 70 },
  { h: "17", state: "bring", label: "Quiet Period", volume: 35 },
  { h: "18", state: "full", label: "Peak Demand", volume: 95 },
  { h: "19", state: "full", label: "Peak Demand", volume: 100 },
  { h: "20", state: "full", label: "Peak Demand", volume: 85 },
  { h: "21", state: "steady", label: "Wind Down", volume: 45 },
];

const stateConfig = {
  bring: { color: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50" },
  steady: { color: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50" },
  full: { color: "bg-rose-500", text: "text-rose-700", bg: "bg-rose-50" },
};

export default function DayOutlook() {
  return (
    <div className="relative mt-8 mb-4">
      {/* Timeline Base */}
      <div className="absolute bottom-[28px] left-0 right-0 h-px bg-ink-200 z-0" />
      
      <div className="relative z-10 flex justify-between items-end gap-1.5 h-48">
        {HOURS.map((h, i) => {
          const isQuiet = h.state === "bring";
          const isPeak = h.state === "full";
          const config = stateConfig[h.state as keyof typeof stateConfig];
          
          return (
            <div key={h.h} className="flex flex-col items-center justify-end h-full group relative w-full">
              {/* Highlight Labels */}
              <div className={cn(
                "absolute -top-8 text-[10px] font-medium whitespace-nowrap px-2 py-1 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none",
                config.bg, config.text
              )}>
                {h.label} ({h.volume}%)
              </div>
              
              {/* Volume Bar */}
              <div 
                className={cn(
                  "w-full rounded-t-md transition-all duration-300 group-hover:brightness-110 cursor-pointer relative",
                  config.color,
                  isQuiet ? "opacity-60 hover:opacity-80" : "opacity-90 hover:opacity-100"
                )}
                style={{ height: `${h.volume}%`, minHeight: "5%" }}
              >
                {isPeak && (
                  <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-rose-600" />
                )}
                {isQuiet && (
                  <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-600" />
                )}
              </div>
              
              {/* Time Label */}
              <div className="mt-3 text-[11px] font-medium text-ink-500 pb-1 z-10 bg-white px-1">
                {h.h}:00
              </div>
            </div>
          )
        })}
      </div>
      
      <div className="flex items-center justify-center gap-6 mt-6 pt-5 border-t border-ink-100">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-emerald-500 opacity-70" />
          <span className="text-xs text-ink-600 font-medium">Quiet Period (Auto-Promos)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-amber-500 opacity-90" />
          <span className="text-xs text-ink-600 font-medium">Steady</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-rose-500 opacity-90" />
          <span className="text-xs text-ink-600 font-medium">Peak Demand (No Promos)</span>
        </div>
      </div>
    </div>
  );
}
import { Clock, Info, Sparkles } from "lucide-react";
import TrafficLight from "@/components/traffic-light";

const HOURS = [
  { h: "09", state: "steady" },
  { h: "10", state: "steady" },
  { h: "11", state: "bring" },
  { h: "12", state: "bring" },
  { h: "13", state: "bring" },
  { h: "14", state: "steady" },
  { h: "15", state: "steady" },
  { h: "16", state: "steady" },
  { h: "17", state: "bring" },
  { h: "18", state: "full" },
  { h: "19", state: "full" },
  { h: "20", state: "full" },
  { h: "21", state: "steady" },
];

const stateColor: Record<string, string> = {
  bring: "bg-emerald-500",
  steady: "bg-amber-500",
  full: "bg-rose-500",
};

const stateLabel: Record<string, string> = {
  bring: "Bring them in",
  steady: "Steady",
  full: "Full",
};

export default function MonitoringPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Monitoring</h1>
        <p className="text-sm text-ink-500 mt-1">
          Tell the AI how busy you are right now. The signal directly shapes
          what offers go out and how aggressive they get.
        </p>
      </div>

      <div className="rounded-2xl border border-ink-200 bg-gradient-to-br from-white to-ink-50 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-brand-600" />
            <div className="text-sm font-medium">Right now</div>
          </div>
          <div className="text-xs text-ink-500">Updates apply instantly</div>
        </div>
        <TrafficLight initial="bring-them-in" />
      </div>

      <div className="rounded-2xl border border-ink-200 bg-white p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Clock className="size-4 text-ink-600" />
            <div>
              <h2 className="font-semibold">Today's schedule</h2>
              <p className="text-xs text-ink-500 mt-0.5">
                A typical Tuesday — set per hour, override anytime.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-ink-500">
            <Legend color="bg-emerald-500" label="Bring them in" />
            <Legend color="bg-amber-500" label="Steady" />
            <Legend color="bg-rose-500" label="Full" />
          </div>
        </div>

        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${HOURS.length}, 1fr)` }}>
          {HOURS.map((h) => (
            <div key={h.h} className="flex flex-col items-center gap-1.5">
              <div
                className={
                  "h-16 w-full rounded-md " + stateColor[h.state]
                }
                title={stateLabel[h.state]}
              />
              <div className="text-[10px] text-ink-500">{h.h}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-ink-200 bg-white p-6">
        <div className="flex items-start gap-3 mb-5">
          <span className="size-8 rounded-lg bg-brand-50 grid place-items-center shrink-0">
            <Info className="size-4 text-brand-600" />
          </span>
          <div>
            <h2 className="font-semibold">How the signal becomes an offer</h2>
            <p className="text-xs text-ink-500 mt-0.5">
              You only set the lever. The AI handles creative, targeting and
              timing.
            </p>
          </div>
        </div>
        <ol className="space-y-3 text-sm text-ink-700">
          <Step
            n={1}
            title="Read the moment"
            body="Combines your signal with weather, time, foot traffic and Payone transaction density."
          />
          <Step
            n={2}
            title="Pick the angle"
            body="Chooses a product from your enabled list and a discount within your max — not above."
          />
          <Step
            n={3}
            title="Generate creative"
            body="Writes the message and visual on-device. Only an abstract intent reaches the cloud."
          />
          <Step
            n={4}
            title="Deliver and learn"
            body="Sends to nearby users matching the intent. Acceptance and dismissal feed back into ranking."
          />
        </ol>
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={"size-2 rounded-full " + color} />
      {label}
    </span>
  );
}

function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <li className="flex gap-3">
      <span className="size-6 rounded-full bg-ink-100 grid place-items-center shrink-0 text-[11px] font-semibold text-ink-700">
        {n}
      </span>
      <div>
        <div className="font-medium text-ink-900">{title}</div>
        <div className="text-ink-500 text-[13px] leading-relaxed">{body}</div>
      </div>
    </li>
  );
}

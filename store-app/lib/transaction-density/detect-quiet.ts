import type { MerchantDensity, QuietWindow } from "./types";
import type { WindowId } from "@/app/onboarding/_components/types";

const QUIET_THRESHOLD = 0.7;

export function detectQuietWindows(
  density: MerchantDensity,
  options: { minHours?: number; openFrom?: number; openTo?: number } = {}
): QuietWindow[] {
  const minHours = options.minHours ?? 1;
  const openFrom = options.openFrom ?? 7;
  const openTo = options.openTo ?? 23;
  const cutoff = density.baseline * QUIET_THRESHOLD;

  const windows: QuietWindow[] = [];

  for (let day = 0; day < density.matrix.length; day++) {
    let runStart = -1;
    let runSum = 0;
    let runLen = 0;

    const flush = (endHour: number) => {
      if (runStart === -1 || runLen < minHours) {
        runStart = -1;
        runSum = 0;
        runLen = 0;
        return;
      }
      const avg = runSum / runLen;
      windows.push({
        day,
        startHour: runStart,
        endHour,
        avgDensity: avg,
        deviationPct: (avg / density.baseline - 1) * 100,
      });
      runStart = -1;
      runSum = 0;
      runLen = 0;
    };

    for (let h = openFrom; h < openTo; h++) {
      const v = density.matrix[day][h];
      if (v <= cutoff) {
        if (runStart === -1) runStart = h;
        runSum += v;
        runLen += 1;
      } else {
        flush(h);
      }
    }
    flush(openTo);
  }

  windows.sort((a, b) => a.deviationPct - b.deviationPct);
  return windows;
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function formatQuietWindow(window: QuietWindow): string {
  const day = DAY_LABELS[window.day] ?? "—";
  return `${day} ${pad(window.startHour)}–${pad(window.endHour)}h`;
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

export function quietWindowsToConfiguredWindows(
  windows: QuietWindow[]
): WindowId[] {
  const set = new Set<WindowId>();
  for (const w of windows) {
    for (let h = w.startHour; h < w.endHour; h++) {
      const id = hourToWindowId(h);
      if (id) set.add(id);
    }
  }
  return Array.from(set);
}

function hourToWindowId(hour: number): WindowId | null {
  if (hour >= 7 && hour < 11) return "morning";
  if (hour >= 11 && hour < 14) return "lunch";
  if (hour >= 14 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 20) return "evening";
  if (hour >= 20 && hour < 24) return "late";
  return null;
}

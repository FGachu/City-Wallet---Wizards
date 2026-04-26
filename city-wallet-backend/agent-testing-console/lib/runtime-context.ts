/** Local wall-clock for agent runs (HH:MM, 24h). */
export function formatLocalTimeHHMM(d = new Date()): string {
  const h = d.getHours().toString().padStart(2, "0");
  const m = d.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

/** Longer label for the live bar (date + time + tz). */
export function formatLocalDateTimeLabel(d = new Date()): string {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short"
  }).format(d);
}

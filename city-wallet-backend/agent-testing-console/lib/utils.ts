import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMs(latency?: number) {
  if (!latency && latency !== 0) return "--";
  return `${latency} ms`;
}

export function formatTimestamp(iso?: string) {
  if (!iso) return "--";
  return new Date(iso).toLocaleTimeString();
}

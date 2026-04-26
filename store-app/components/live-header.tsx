"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function LiveHeader() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formattedDate = time
    ? new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }).format(time)
    : "Loading...";

  const formattedTime = time
    ? new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
      }).format(time)
    : "--:--";

  return (
    <div className="flex items-end justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Today</h1>
        <p className="text-sm text-ink-500 mt-1 flex items-center gap-2">
          <span>{formattedDate} · {formattedTime}</span>
          <span className="text-ink-300">|</span>
          <span>Live demand and offer performance.</span>
        </p>
      </div>
      <Link
        href="/monitoring"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
      >
        Open monitoring
        <ArrowUpRight className="size-4" />
      </Link>
    </div>
  );
}

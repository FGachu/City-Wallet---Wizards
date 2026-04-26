"use client";

import { useState } from "react";
import { PrettyResponse } from "./PrettyResponse";
import type { ApiId, ApiResult } from "./types";

type Props = {
  result: ApiResult | null;
  apiId: ApiId | null;
};

export function ResponsePanel({ result, apiId }: Props) {
  const [view, setView] = useState<"pretty" | "json">("pretty");

  if (!result || !apiId) {
    return (
      <div className="flex h-full items-center justify-center p-8 bg-zinc-50/50 dark:bg-zinc-950/40">
        <div className="text-center max-w-xs">
          <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Response panel
          </div>
          <div className="text-xs text-zinc-500">
            Pick an API in the middle column and press Run. The response will render here with a pretty view and the raw JSON.
          </div>
        </div>
      </div>
    );
  }

  const statusColor = result.ok ? "text-emerald-600" : "text-red-600";

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 space-y-1.5 flex-shrink-0 bg-white dark:bg-zinc-950">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-500">Response</span>
          <span className={`font-bold text-sm tabular-nums ${statusColor}`}>{result.status ?? "ERR"}</span>
          <span className="text-xs text-zinc-500 tabular-nums">{result.durationMs} ms</span>
          <div className="ml-auto inline-flex rounded-md border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <button
              onClick={() => setView("pretty")}
              className={`text-xs px-2.5 py-1 ${view === "pretty" ? "bg-zinc-900 text-white dark:bg-white dark:text-black" : "text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-900"}`}
            >
              Pretty
            </button>
            <button
              onClick={() => setView("json")}
              className={`text-xs px-2.5 py-1 ${view === "json" ? "bg-zinc-900 text-white dark:bg-white dark:text-black" : "text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-900"}`}
            >
              JSON
            </button>
          </div>
        </div>
        <code className="block text-[11px] break-all text-zinc-600 dark:text-zinc-400 font-mono">
          {result.method} {result.url}
        </code>
      </div>
      <div className="flex-1 overflow-auto p-4 bg-zinc-50/50 dark:bg-zinc-950/40">
        {view === "pretty" ? (
          <PrettyResponse apiId={apiId} body={result.body} />
        ) : (
          <pre className="text-xs leading-snug bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md p-3 overflow-auto font-mono">
            {JSON.stringify(result.body, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, TerminalSquare } from "lucide-react";
import type { AgentKey } from "@/lib/mock-agents";
import { AGENT_LABELS } from "@/lib/pipeline";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

type LogItem = {
  id: string;
  timestamp: string;
  agent: AgentKey;
  status: string;
  latency: number;
  tokens: number;
  requestPayload: unknown;
  responsePayload: unknown;
};

export function LogsPanel({ logs }: { logs: LogItem[] }) {
  const [open, setOpen] = useState(true);
  const renderedLogs = useMemo(() => logs.slice(0, 100), [logs]);

  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 shadow-glass backdrop-blur-md">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2 text-sm">
          <TerminalSquare className="h-4 w-4 text-primary" />
          Logs Console
        </div>
        <Button size="sm" variant="ghost" onClick={() => setOpen((value) => !value)}>
          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </Button>
      </div>
      {open ? (
        <>
          <Separator />
          <ScrollArea className="h-72 p-4">
            <div className="space-y-3 font-mono text-xs">
              {renderedLogs.length === 0 ? (
                <p className="text-muted-foreground">No logs yet. Run an agent to see request/response traces.</p>
              ) : (
                renderedLogs.map((log) => (
                  <div key={log.id} className="rounded-lg border border-white/10 bg-secondary/20 p-3">
                    <p className="mb-1 text-[11px] text-primary">
                      [{new Date(log.timestamp).toLocaleTimeString()}] {AGENT_LABELS[log.agent]} - {log.status}
                    </p>
                    <p className="mb-2 text-[11px] text-muted-foreground">
                      latency={log.latency}ms tokens={log.tokens}
                    </p>
                    <pre className="overflow-x-auto text-[11px] text-foreground/90">
{`request=${JSON.stringify(log.requestPayload)}
response=${JSON.stringify(log.responsePayload)}`}
                    </pre>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </>
      ) : null}
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { LoaderCircle, Play, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { formatMs, formatTimestamp } from "@/lib/utils";
import type { AgentKey, AgentStatus } from "@/lib/mock-agents";

type AgentCardProps = {
  agent: {
    key: AgentKey;
    name: string;
    status: AgentStatus;
    prompt: string;
    inputJson: string;
    streamedOutput: string;
    latency?: number;
    lastRun?: string;
    selected: boolean;
  };
  onSelect: () => void;
  onPromptChange: (value: string) => void;
  onInputChange: (value: string) => void;
  onRun: () => void;
  onClear: () => void;
};

const badgeMap: Record<AgentStatus, "secondary" | "warning" | "success" | "error"> = {
  idle: "secondary",
  running: "warning",
  success: "success",
  error: "error"
};

export function AgentCard({ agent, onSelect, onPromptChange, onInputChange, onRun, onClear }: AgentCardProps) {
  const [typedOutput, setTypedOutput] = useState("");

  const output = useMemo(() => agent.streamedOutput || "", [agent.streamedOutput]);

  useEffect(() => {
    if (!output) {
      setTypedOutput("");
      return;
    }
    let index = 0;
    const timer = window.setInterval(() => {
      index += 2;
      setTypedOutput(output.slice(0, index));
      if (index >= output.length) window.clearInterval(timer);
    }, 16);
    return () => window.clearInterval(timer);
  }, [output]);

  return (
    <motion.div layout whileHover={{ y: -2 }} onClick={onSelect}>
      <Card className={agent.selected ? "border-primary/40" : ""}>
        <CardHeader className="space-y-3">
          <div className="flex items-center justify-between">
            <CardTitle>{agent.name}</CardTitle>
            <Badge variant={badgeMap[agent.status]}>{agent.status}</Badge>
          </div>
          <Textarea value={agent.prompt} onChange={(e) => onPromptChange(e.target.value)} className="min-h-20 text-sm" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            className="min-h-20 font-mono text-xs"
            value={agent.inputJson}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder='{"example":true}'
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={onRun} disabled={agent.status === "running"}>
              {agent.status === "running" ? (
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}
              Run
            </Button>
            <Button size="sm" variant="outline" onClick={onClear}>
              <Trash2 className="mr-2 h-4 w-4" />
              Clear
            </Button>
          </div>
          <div className="rounded-xl border border-white/10 bg-secondary/20 p-3">
            <p className="mb-2 text-xs text-muted-foreground">Streaming output</p>
            <p className="min-h-8 text-sm">{typedOutput || "No output yet."}</p>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Latency: {formatMs(agent.latency)}</span>
            <span>Last run: {formatTimestamp(agent.lastRun)}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

"use client";

import { Play, RefreshCw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type HeaderProps = {
  environment: "Local" | "Staging" | "Production Mock";
  onEnvironmentChange: (value: "Local" | "Staging" | "Production Mock") => void;
  onRunPipeline: () => void;
  onReset: () => void;
  onSaveScenario: () => void;
  isPipelineRunning: boolean;
};

export function Header({
  environment,
  onEnvironmentChange,
  onRunPipeline,
  onReset,
  onSaveScenario,
  isPipelineRunning
}: HeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-white/10 bg-card/70 p-5 shadow-glass backdrop-blur-md lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">City Wallet Agent Testing Console</h1>
        <p className="text-sm text-muted-foreground">Internal multi-agent sandbox for backend + API validation.</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="w-44">
          <Select value={environment} onValueChange={(value: HeaderProps["environment"]) => onEnvironmentChange(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Environment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Local">Local</SelectItem>
              <SelectItem value="Staging">Staging</SelectItem>
              <SelectItem value="Production Mock">Production Mock</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={onRunPipeline} disabled={isPipelineRunning}>
          <Play className="mr-2 h-4 w-4" />
          {isPipelineRunning ? "Running..." : "Run Full Pipeline"}
        </Button>
        <Button variant="secondary" onClick={onReset}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Reset Session
        </Button>
        <Button variant="outline" onClick={onSaveScenario}>
          <Save className="mr-2 h-4 w-4" />
          Save Scenario
        </Button>
      </div>
    </div>
  );
}

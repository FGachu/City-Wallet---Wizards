"use client";

import { useCallback, useEffect, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import { AgentCard } from "@/components/agent-card";
import { Header } from "@/components/header";
import { LogsPanel } from "@/components/logs-panel";
import { Sidebar } from "@/components/sidebar";
import { isDataGrounding } from "@/lib/data-grounding";
import type { AgentKey } from "@/lib/mock-agents";
import { PIPELINE_ORDER } from "@/lib/pipeline";
import { useConsoleStore } from "@/store/useConsoleStore";

function parseObjectRecord(text: string): Record<string, unknown> {
  try {
    const v = JSON.parse(text) as unknown;
    if (v && typeof v === "object" && !Array.isArray(v)) return v as Record<string, unknown>;
  } catch {
    /* ignore */
  }
  return {};
}

export default function AgentConsolePage() {
  const {
    environment,
    setEnvironment,
    agents,
    setAgentPrompt,
    setAgentInputJson,
    setAgentStatus,
    setAgentResult,
    clearAgent,
    selectAgent,
    sharedMemory,
    sharedMemoryText,
    scenarioInputText,
    configText,
    sessionStateText,
    setSharedMemoryText,
    setScenarioInputText,
    setConfigText,
    setSessionStateText,
    addLog,
    logs,
    isPipelineRunning,
    setPipelineRunning,
    resetSession,
    saveScenario
  } = useConsoleStore();

  const runAgent = useCallback(
    async (agentKey: AgentKey) => {
      const agent = agents[agentKey];
      setAgentStatus(agentKey, "running");
      const scenarioObj = parseObjectRecord(scenarioInputText);
      const agentObj = parseObjectRecord(agent.inputJson);
      const { grounding: scenarioGrounding, ...scenarioRest } = scenarioObj;
      const input = { ...scenarioRest, ...agentObj };
      const grounding = isDataGrounding(scenarioGrounding) ? scenarioGrounding : undefined;
      const requestPayload = {
        agent: agentKey,
        prompt: agent.prompt,
        input,
        sharedMemory,
        ...(grounding ? { grounding } : {})
      };

      try {
        const response = await fetch("/api/run-agent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestPayload)
        });
        const data = (await response.json()) as {
          success: boolean;
          output: string;
          latency: number;
          tokens: number;
        };
        setAgentResult(agentKey, {
          output: data.output,
          streamedOutput: data.output,
          latency: data.latency,
          tokens: data.tokens
        });
        addLog({
          timestamp: new Date().toISOString(),
          agent: agentKey,
          status: data.success ? "success" : "error",
          latency: data.latency,
          tokens: data.tokens,
          requestPayload,
          responsePayload: data
        });
      } catch (error) {
        setAgentStatus(agentKey, "error");
        addLog({
          timestamp: new Date().toISOString(),
          agent: agentKey,
          status: "error",
          latency: 0,
          tokens: 0,
          requestPayload,
          responsePayload: { message: error instanceof Error ? error.message : "Unknown error" }
        });
      }
    },
    [addLog, agents, scenarioInputText, setAgentResult, setAgentStatus, sharedMemory]
  );

  const runPipeline = useCallback(async () => {
    setPipelineRunning(true);
    try {
      for (const agentKey of PIPELINE_ORDER) {
        // Keep sequence deterministic for scenario replay.
        // eslint-disable-next-line no-await-in-loop
        await runAgent(agentKey);
      }
    } finally {
      setPipelineRunning(false);
    }
  }, [runAgent, setPipelineRunning]);

  const selectedAgent = useMemo(
    () => (Object.values(agents).find((agent) => agent.selected)?.key ?? "context-agent") as AgentKey,
    [agents]
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const isCmdEnter = (event.metaKey || event.ctrlKey) && event.key === "Enter";
      if (isCmdEnter) {
        void runAgent(selectedAgent);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [runAgent, selectedAgent]);

  return (
    <main className="min-h-screen p-4 md:p-6">
      <Header
        environment={environment}
        onEnvironmentChange={setEnvironment}
        onRunPipeline={() => void runPipeline()}
        onReset={resetSession}
        onSaveScenario={saveScenario}
        isPipelineRunning={isPipelineRunning}
      />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-10">
        <section className="space-y-4 xl:col-span-7">
          <AnimatePresence>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {(Object.keys(agents) as AgentKey[]).map((agentKey) => {
                const agent = agents[agentKey];
                return (
                  <AgentCard
                    key={agent.key}
                    agent={agent}
                    onSelect={() => selectAgent(agent.key)}
                    onPromptChange={(value) => setAgentPrompt(agent.key, value)}
                    onInputChange={(value) => setAgentInputJson(agent.key, value)}
                    onRun={() => void runAgent(agent.key)}
                    onClear={() => clearAgent(agent.key)}
                  />
                );
              })}
            </div>
          </AnimatePresence>
        </section>
        <aside className="xl:col-span-3">
          <Sidebar
            sharedMemoryText={sharedMemoryText}
            scenarioInputText={scenarioInputText}
            configText={configText}
            sessionStateText={sessionStateText}
            setSharedMemoryText={setSharedMemoryText}
            setScenarioInputText={setScenarioInputText}
            setConfigText={setConfigText}
            setSessionStateText={setSessionStateText}
          />
        </aside>
      </div>
      <div className="mt-4">
        <LogsPanel logs={logs} />
      </div>
    </main>
  );
}

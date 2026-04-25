"use client";

import { create } from "zustand";
import {
  preloadedScenarios,
  type AgentKey,
  type AgentStatus,
  type SharedMemory
} from "@/lib/mock-agents";
import { AGENT_LABELS, DEFAULT_PROMPTS } from "@/lib/pipeline";

type LogItem = {
  id: string;
  timestamp: string;
  agent: AgentKey;
  status: AgentStatus;
  latency: number;
  tokens: number;
  requestPayload: unknown;
  responsePayload: unknown;
};

type AgentState = {
  key: AgentKey;
  name: string;
  status: AgentStatus;
  prompt: string;
  inputJson: string;
  output: string;
  streamedOutput: string;
  latency?: number;
  tokens?: number;
  lastRun?: string;
  selected: boolean;
};

type ConsoleState = {
  environment: "Local" | "Staging" | "Production Mock";
  sharedMemoryText: string;
  sharedMemory: SharedMemory;
  scenarioInputText: string;
  configText: string;
  sessionStateText: string;
  logs: LogItem[];
  isPipelineRunning: boolean;
  activeScenarioId: string;
  agents: Record<AgentKey, AgentState>;
  setEnvironment: (environment: ConsoleState["environment"]) => void;
  setSharedMemoryText: (value: string) => void;
  setScenarioInputText: (value: string) => void;
  setConfigText: (value: string) => void;
  setSessionStateText: (value: string) => void;
  setAgentPrompt: (key: AgentKey, prompt: string) => void;
  setAgentInputJson: (key: AgentKey, inputJson: string) => void;
  selectAgent: (key: AgentKey) => void;
  setAgentStatus: (key: AgentKey, status: AgentStatus) => void;
  setAgentResult: (
    key: AgentKey,
    payload: { output: string; latency: number; tokens: number; streamedOutput: string }
  ) => void;
  clearAgent: (key: AgentKey) => void;
  addLog: (log: Omit<LogItem, "id">) => void;
  setPipelineRunning: (value: boolean) => void;
  resetSession: () => void;
  saveScenario: () => void;
  loadScenario: (id: string) => void;
};

const baseScenario = preloadedScenarios[0];

function createAgentState(key: AgentKey): AgentState {
  return {
    key,
    name: AGENT_LABELS[key],
    status: "idle",
    prompt: DEFAULT_PROMPTS[key],
    inputJson: "{}",
    output: "",
    streamedOutput: "",
    selected: key === "context-agent"
  };
}

function getInitialAgents(): Record<AgentKey, AgentState> {
  return {
    "context-agent": createAgentState("context-agent"),
    "offer-generator-agent": createAgentState("offer-generator-agent"),
    "ux-copy-agent": createAgentState("ux-copy-agent"),
    "checkout-agent": createAgentState("checkout-agent"),
    "merchant-rules-agent": createAgentState("merchant-rules-agent"),
    "analytics-agent": createAgentState("analytics-agent")
  };
}

const initialSharedMemory = baseScenario.memory;

export const useConsoleStore = create<ConsoleState>((set, get) => ({
  environment: "Local",
  sharedMemoryText: JSON.stringify(initialSharedMemory, null, 2),
  sharedMemory: initialSharedMemory,
  scenarioInputText: JSON.stringify(baseScenario.inputs, null, 2),
  configText: JSON.stringify({ model: "mock-gpt-4.1", temperature: 0.3, topP: 0.95 }, null, 2),
  sessionStateText: JSON.stringify({ sessionId: "demo-session-01", retries: 0, cacheHits: 2 }, null, 2),
  logs: [],
  isPipelineRunning: false,
  activeScenarioId: baseScenario.id,
  agents: getInitialAgents(),
  setEnvironment: (environment) => set({ environment }),
  setSharedMemoryText: (value) => {
    try {
      const parsed = JSON.parse(value) as SharedMemory;
      set({ sharedMemoryText: value, sharedMemory: parsed });
    } catch {
      set({ sharedMemoryText: value });
    }
  },
  setScenarioInputText: (value) => set({ scenarioInputText: value }),
  setConfigText: (value) => set({ configText: value }),
  setSessionStateText: (value) => set({ sessionStateText: value }),
  setAgentPrompt: (key, prompt) =>
    set((state) => ({
      agents: { ...state.agents, [key]: { ...state.agents[key], prompt } }
    })),
  setAgentInputJson: (key, inputJson) =>
    set((state) => ({
      agents: { ...state.agents, [key]: { ...state.agents[key], inputJson } }
    })),
  selectAgent: (key) =>
    set((state) => {
      const next = { ...state.agents };
      (Object.keys(next) as AgentKey[]).forEach((agentKey) => {
        next[agentKey] = { ...next[agentKey], selected: agentKey === key };
      });
      return { agents: next };
    }),
  setAgentStatus: (key, status) =>
    set((state) => ({
      agents: { ...state.agents, [key]: { ...state.agents[key], status } }
    })),
  setAgentResult: (key, payload) =>
    set((state) => ({
      agents: {
        ...state.agents,
        [key]: {
          ...state.agents[key],
          ...payload,
          output: payload.output,
          status: "success",
          lastRun: new Date().toISOString()
        }
      }
    })),
  clearAgent: (key) =>
    set((state) => ({
      agents: {
        ...state.agents,
        [key]: {
          ...state.agents[key],
          status: "idle",
          output: "",
          streamedOutput: "",
          latency: undefined,
          tokens: undefined,
          lastRun: undefined
        }
      }
    })),
  addLog: (log) =>
    set((state) => ({
      logs: [{ id: crypto.randomUUID(), ...log }, ...state.logs].slice(0, 200)
    })),
  setPipelineRunning: (value) => set({ isPipelineRunning: value }),
  resetSession: () =>
    set({
      agents: getInitialAgents(),
      logs: [],
      sharedMemoryText: JSON.stringify(initialSharedMemory, null, 2),
      sharedMemory: initialSharedMemory
    }),
  saveScenario: () => {
    const state = get();
    const scenario = {
      savedAt: new Date().toISOString(),
      sharedMemoryText: state.sharedMemoryText,
      scenarioInputText: state.scenarioInputText,
      configText: state.configText
    };
    localStorage.setItem("city-wallet-scenario", JSON.stringify(scenario));
  },
  loadScenario: (id) => {
    const scenario = preloadedScenarios.find((item) => item.id === id);
    if (!scenario) return;
    set({
      activeScenarioId: id,
      sharedMemoryText: JSON.stringify(scenario.memory, null, 2),
      sharedMemory: scenario.memory,
      scenarioInputText: JSON.stringify(scenario.inputs, null, 2)
    });
  }
}));

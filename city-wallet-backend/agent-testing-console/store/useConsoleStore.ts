"use client";

import { create } from "zustand";
import {
  preloadedScenarios,
  type AgentKey,
  type AgentStatus,
  type SharedMemory
} from "@/lib/mock-agents";
import type { LiveWeatherApiResponse } from "@/lib/live-weather";
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
  /** Latest `/api/live-weather` response for the current shared-memory city. */
  liveWeather: LiveWeatherApiResponse | null;
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
  /** Append live tokens while `stream: true` SSE is in flight. */
  setAgentStreamOutput: (key: AgentKey, streamedOutput: string) => void;
  clearAgent: (key: AgentKey) => void;
  addLog: (log: Omit<LogItem, "id">) => void;
  setPipelineRunning: (value: boolean) => void;
  resetSession: () => void;
  saveScenario: () => void;
  loadScenario: (id: string) => void;
  fetchLiveWeather: () => Promise<void>;
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
  liveWeather: null,
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
  setAgentStreamOutput: (key, streamedOutput) =>
    set((state) => ({
      agents: {
        ...state.agents,
        [key]: {
          ...state.agents[key],
          streamedOutput,
          status: "running"
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
      liveWeather: null,
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
  },
  fetchLiveWeather: async () => {
    const fetchWeather = async (lat?: number, lon?: number) => {
      const city = get().sharedMemory.location?.trim() || "Stuttgart";
      let url = `/api/live-weather?q=${encodeURIComponent(city)}`;
      if (lat !== undefined && lon !== undefined) {
        url = `/api/live-weather?lat=${lat}&lon=${lon}`;
        
        // Fetch real nearby restaurants and events
        try {
          const [placesRes, eventsRes] = await Promise.all([
            fetch(`/api/live-places?lat=${lat}&lon=${lon}`).catch(() => null),
            fetch(`/api/live-events?lat=${lat}&lon=${lon}`).catch(() => null)
          ]);

          let updatedScenario = false;
          const currentScenarioText = get().scenarioInputText;
          let scenarioObj: any = null;

          try {
            scenarioObj = JSON.parse(currentScenarioText);
          } catch (e) {
            // Ignore parse errors if user has invalid JSON
          }

          if (scenarioObj) {
            if (placesRes && placesRes.ok) {
              const placesData = await placesRes.json();
              if (placesData.places && Array.isArray(placesData.places) && placesData.places.length > 0) {
                const topMerchants = placesData.places.slice(0, 10).map((p: any) => p.name);
                scenarioObj.nearbyMerchants = topMerchants;
                
                // Update the anchor POI and merchant name to match the first live restaurant
                const topName = topMerchants[0] || "Unknown Merchant";
                if (scenarioObj.grounding?.poi) {
                  scenarioObj.grounding.poi.anchorPoiName = topName;
                }
                if (scenarioObj.grounding?.payone) {
                  scenarioObj.grounding.payone.merchantName = topName;
                }
                
                // Fetch simulated Payone data for this merchant
                try {
                  const payoneRes = await fetch(`/api/payone-feed?merchant=${encodeURIComponent(topName)}`);
                  if (payoneRes.ok) {
                    const payoneData = await payoneRes.json();
                    if (scenarioObj.grounding) {
                      scenarioObj.grounding.payone = payoneData;
                    }
                  }
                } catch (e) {
                  console.error("Failed to fetch payone feed", e);
                }

                updatedScenario = true;
              }
            }

            if (eventsRes && eventsRes.ok) {
              const eventsData = await eventsRes.json();
              if (eventsData.events && Array.isArray(eventsData.events) && eventsData.events.length > 0) {
                scenarioObj.nearbyEvents = eventsData.events.map((e: any) => `${e.name} (${e.category}) at ${e.venueName}`);
                const topEvent = eventsData.events[0];
                if (scenarioObj.grounding?.localEvent) {
                  scenarioObj.grounding.localEvent.provider = "ticketmaster";
                  scenarioObj.grounding.localEvent.eventId = topEvent.id;
                  scenarioObj.grounding.localEvent.title = topEvent.name;
                  scenarioObj.grounding.localEvent.category = topEvent.category || "Event";
                  scenarioObj.grounding.localEvent.venueName = topEvent.venueName || "Local Venue";
                  scenarioObj.grounding.localEvent.startLocal = topEvent.startLocal;
                  scenarioObj.grounding.localEvent.distanceM = topEvent.distanceM;
                  updatedScenario = true;
                }
              }
            }

            if (updatedScenario) {
              set({ scenarioInputText: JSON.stringify(scenarioObj, null, 2) });
            }
          }
        } catch (err) {
          console.error("Failed to fetch live context data", err);
        }
      }
      
      try {
        const res = await fetch(url);
        const data = (await res.json()) as LiveWeatherApiResponse;
        set({ liveWeather: data });
        
        // If we successfully fetched weather for a new location via coordinates, 
        // update the shared memory so the agents know they are in the correct city
        if (data.ok && data.city) {
          const currentMem = get().sharedMemory;
          const updatedMem = { ...currentMem, location: data.city };
          set({ 
            sharedMemory: updatedMem,
            sharedMemoryText: JSON.stringify(updatedMem, null, 2)
          });
        }
      } catch {
        set({
          liveWeather: { ok: false, reason: "network", message: "Could not reach weather API." }
        });
      }
    };

    if (typeof navigator !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => fetchWeather(position.coords.latitude, position.coords.longitude),
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            alert("Location access is required for live data. Please click the lock icon in your address bar to allow location access, then refresh.");
            set({
              liveWeather: { ok: false, reason: "network", message: "Location access denied. Please enable location to continue." }
            });
          } else {
            fetchWeather(); // fallback if timeout or other error occurs
          }
        }
      );
    } else {
      fetchWeather();
    }
  }
}));

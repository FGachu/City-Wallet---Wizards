import {
  type DataGrounding,
  isDataGrounding,
  mergeLiveOpenWeather,
  stuttgartDemoGrounding
} from "@/lib/data-grounding";
import type { LiveOpenWeatherSnapshot } from "@/lib/live-weather";

export type AgentKey =
  | "context-agent"
  | "offer-generator-agent"
  | "ux-copy-agent"
  | "checkout-agent"
  | "merchant-rules-agent"
  | "analytics-agent";

export type AgentStatus = "idle" | "running" | "success" | "error";

export type SharedMemory = {
  weather: string;
  location: string;
  merchantTraffic: string;
  userIntent: string;
  userName: string;
  mood: string;
  time: string;
};

export type RunAgentRequest = {
  agent: AgentKey;
  input: Record<string, unknown>;
  prompt?: string;
  sharedMemory: SharedMemory;
  /** When omitted, a location-consistent demo bundle is derived from shared memory. */
  grounding?: DataGrounding;
  /** Live OpenWeatherMap snapshot from `/api/live-weather`; merged into resolved grounding. */
  liveOpenWeather?: LiveOpenWeatherSnapshot;
  /** Client hint; stripped before execution. When true, use SSE from `/api/run-agent`. */
  stream?: boolean;
};

export type RunAgentStreamEvent =
  | { type: "status"; message: string }
  | { type: "delta"; text: string }
  | {
      type: "complete";
      success: boolean;
      output: string;
      latency: number;
      tokens: number;
      payload: Record<string, unknown>;
    }
  | { type: "error"; message: string };

export type RunAgentResponse = {
  success: boolean;
  output: string;
  latency: number;
  tokens: number;
  payload: Record<string, unknown>;
};

const seedScenarioMemory: SharedMemory = {
  weather: "rainy",
  location: "Stuttgart",
  merchantTraffic: "low",
  userIntent: "hungry",
  userName: "Mia",
  mood: "hungry",
  time: "12:10"
};

const seededTokenWeights: Record<AgentKey, number> = {
  "context-agent": 260,
  "offer-generator-agent": 320,
  "ux-copy-agent": 210,
  "checkout-agent": 190,
  "merchant-rules-agent": 170,
  "analytics-agent": 220
};

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function resolveGrounding(request: RunAgentRequest): DataGrounding {
  if (request.grounding && isDataGrounding(request.grounding)) {
    return applyLiveOpenWeatherLayer(request.grounding, request);
  }
  const fromInput = request.input.grounding;
  if (isDataGrounding(fromInput)) {
    return applyLiveOpenWeatherLayer(fromInput, request);
  }
  const merchants = request.input.nearbyMerchants;
  const first =
    Array.isArray(merchants) && merchants.length > 0 && typeof merchants[0] === "string"
      ? merchants[0]
      : "Cafe Hafen";
  return applyLiveOpenWeatherLayer(stuttgartDemoGrounding(first), request);
}

function applyLiveOpenWeatherLayer(g: DataGrounding, request: RunAgentRequest): DataGrounding {
  if (request.liveOpenWeather) {
    return mergeLiveOpenWeather(g, request.liveOpenWeather);
  }
  return g;
}

function inferContext(memory: SharedMemory, g: DataGrounding) {
  const rain = g.weather.precipMm1h >= 0.5 || memory.weather.toLowerCase().includes("rain");
  const hungry = g.onDeviceIntent.abstractIntent === "food_now" || memory.userIntent === "hungry";
  const eventSpike = g.localEvent.demandTier === "high";
  const quiet = g.payone.quietScore >= 0.55;

  const parts = [
    `${g.weather.provider.toUpperCase()}: ${g.weather.conditionLabel}, ${g.weather.tempC}°C (feels ${g.weather.feelsLikeC}°C), +${g.weather.precipMm1h} mm/h precip.`,
    `Event signal (${g.localEvent.provider}): "${g.localEvent.title}" — demand ${g.localEvent.demandTier}${eventSpike ? " (spike risk on)" : ""}.`,
    `POI (${g.poi.provider}): ${g.poi.anchorPoiName} ~${g.poi.distanceM} m; footfall proxy ${g.poi.footfallProxy.toFixed(2)}, route density ${g.poi.routeDensityProxy.toFixed(2)}.`,
    `Payone window: ${g.payone.txPer15m} tx/15m vs baseline ${g.payone.baselineTxPer15m} (quietScore ${g.payone.quietScore.toFixed(2)})${quiet ? " → favourable for dynamic boost" : ""}.`,
    `On-device SLM (${g.onDeviceIntent.slmFamily}): abstract intent "${g.onDeviceIntent.abstractIntent}" @ ${(g.onDeviceIntent.confidence * 100).toFixed(0)}% confidence (no raw text on server).`
  ];

  if (rain && hungry) {
    parts.push("Synthesis: user likely wants warm food fast; prioritize covered-route merchants.");
  } else if (memory.time >= "18:00") {
    parts.push("Synthesis: post-work window — bias to quick dinner and commute-friendly pickup.");
  } else {
    parts.push("Synthesis: nearby convenient offer with clear value prop.");
  }

  return parts.join(" ");
}

function generateOffer(memory: SharedMemory, g: DataGrounding, request: RunAgentRequest) {
  const quietBoost = g.payone.quietScore >= 0.6 ? 8 : 4;
  
  // Extract time of day to make offers dynamic
  const hourMatch = memory.time.match(/^(\d{1,2})/);
  const hour = hourMatch ? parseInt(hourMatch[1], 10) : 12;
  
  let timeContext = "snack";
  if (hour < 11) timeContext = "breakfast & coffee";
  else if (hour >= 11 && hour <= 14) timeContext = "quick lunch";
  else if (hour > 14 && hour < 17) timeContext = "afternoon pick-me-up";
  else if (hour >= 17 && hour < 21) timeContext = "dinner special";
  else timeContext = "late-night bites";

  // Use the expanded nearby events and merchants if available
  const merchants = Array.isArray(request.input.nearbyMerchants) && request.input.nearbyMerchants.length > 0 
    ? request.input.nearbyMerchants 
    : [g.poi.anchorPoiName];
  
  const events = Array.isArray(request.input.nearbyEvents) && request.input.nearbyEvents.length > 0 
    ? request.input.nearbyEvents 
    : [];

  // Pick a merchant deterministically based on the hour
  const merchant = merchants[hour % merchants.length];
  
  const eventAdj = events.length > 0 
    ? `Bundle for attendees of [${events[0]}]` 
    : g.localEvent.demandTier === "high" ? "Bundle with festival snack tier" : "Standard city-wallet stack";

  if (memory.mood.toLowerCase().includes("hungry") || g.onDeviceIntent.abstractIntent === "food_now") {
    return `${eventAdj}: ${quietBoost + 12}% off ${timeContext} at ${merchant} (quiet-period Payone signal).`;
  }
  
  return `${quietBoost + 7}% cashback at ${merchant} and nearby partners (footfall ${g.poi.footfallProxy.toFixed(2)}).`;
}

function generateUxCopy(memory: SharedMemory, g: DataGrounding) {
  const precip = g.weather.precipMm1h >= 0.5 || memory.weather.toLowerCase().includes("rain");
  if (precip) {
    return `${g.weather.conditionLabel} — ${g.poi.distanceM} m to ${g.poi.anchorPoiName}. Warm lunch, GenUI surface ${g.genUi.surfaceId}.`;
  }
  return `Hey ${memory.userName}, ${g.poi.anchorPoiName} is close and matches your ${g.onDeviceIntent.abstractIntent} signal.`;
}

function generateCheckoutToken(memory: SharedMemory, g: DataGrounding) {
  const compact = `${g.payone.merchantId}|${memory.time}|${memory.userName}|${g.genUi.surfaceId}`
    .replace(/\W/g, "")
    .toUpperCase()
    .slice(0, 36);
  return `CWQR-${compact}`;
}

function merchantRules(memory: SharedMemory, g: DataGrounding, request: RunAgentRequest) {
  const quiet = g.payone.quietScore >= 0.55;
  const isRaining = g.weather.precipMm1h > 0 || memory.weather.toLowerCase().includes("rain");
  const events = Array.isArray(request.input.nearbyEvents) ? request.input.nearbyEvents : [];
  
  let ruleText = "Rule: standard corridor; Payone density within baseline band.";
  
  if (events.length > 0) {
    ruleText = `Rule: Surge pricing deactivated. High footfall expected due to ${events.length} live event(s) near ${memory.location}. Dynamic discount corridor tightly capped at 5 bp to protect merchant margins.`;
  } else if (quiet && isRaining) {
    ruleText = `Rule: Payone quietScore ${g.payone.quietScore.toFixed(2)} + ${g.weather.conditionLabel} detected in ${memory.location} → triggering hyper-local bad weather subsidy corridor (+${Math.round(12 + g.payone.quietScore * 10)} bp) to drive indoor footfall.`;
  } else if (quiet) {
    ruleText = `Rule: Payone quietScore ${g.payone.quietScore.toFixed(2)} → standard dynamic discount corridor enabled (+${Math.round(6 + g.payone.quietScore * 10)} bp).`;
  }
  
  return ruleText;
}

function analyticsPrediction(memory: SharedMemory, g: DataGrounding, request: RunAgentRequest) {
  const events = Array.isArray(request.input.nearbyEvents) ? request.input.nearbyEvents : [];
  const merchants = Array.isArray(request.input.nearbyMerchants) ? request.input.nearbyMerchants : [];
  
  const base = g.weather.precipMm1h >= 0.5 ? 0.7 : 0.62;
  const foot = (g.poi.footfallProxy - 0.5) * 0.06;
  const quiet = (g.payone.quietScore - 0.5) * 0.1;
  const intent = g.onDeviceIntent.confidence * 0.05;
  
  // Real-time location adjustments
  const eventBoost = events.length > 0 ? 0.15 : 0; // Live events highly increase acceptance of bundled offers
  const competitionPenalty = merchants.length > 5 ? 0.08 : 0; // High restaurant density lowers direct conversion
  
  const p = Math.min(0.98, Math.max(0.20, base + foot + quiet + intent + eventBoost - competitionPenalty));
  
  let explanation = `weather (${g.weather.tempC}°C), POI footfall, Payone quiet, intent`;
  if (events.length > 0) explanation += `, +15% surge due to ${events.length} live events`;
  if (merchants.length > 5) explanation += `, -8% competition penalty from ${merchants.length} nearby merchants`;
  
  return `Predicted acceptance: ${Math.round(p * 100)}% for location ${memory.location} (grounded on ${explanation}).`;
}

function baseLatencyMs(agent: AgentKey): number {
  return 520 + agent.length * 25;
}

function computeRun(request: RunAgentRequest): Omit<RunAgentResponse, "success" | "latency"> & { latencyMs: number } {
  const { agent, sharedMemory } = request;
  const g = resolveGrounding(request);
  let output = "";
  switch (agent) {
    case "context-agent":
      output = inferContext(sharedMemory, g);
      break;
    case "offer-generator-agent":
      output = generateOffer(sharedMemory, g, request);
      break;
    case "ux-copy-agent":
      output = generateUxCopy(sharedMemory, g);
      break;
    case "checkout-agent":
      output = `Generated QR token: ${generateCheckoutToken(sharedMemory, g)}`;
      break;
    case "merchant-rules-agent":
      output = merchantRules(sharedMemory, g, request);
      break;
    case "analytics-agent":
      output = analyticsPrediction(sharedMemory, g, request);
      break;
    default:
      output = "Agent run completed.";
  }

  const latencyMs = baseLatencyMs(agent);
  const tokens = seededTokenWeights[agent] + sharedMemory.location.length * 3;
  const payload: Record<string, unknown> = {
    prompt: request.prompt ?? "",
    input: request.input,
    memory: sharedMemory,
    grounding: g,
    groundingProvenance: {
      weather: g.weather.sourceNote,
      events: g.localEvent.sourceNote,
      poi: g.poi.sourceNote,
      payone: g.payone.sourceNote,
      onDevice: g.onDeviceIntent.sourceNote,
      genUi: g.genUi.sourceNote
    }
  };

  return { output, tokens, payload, latencyMs };
}

export const preloadedScenarios = [
  {
    id: "mia-rainy-lunch",
    name: "Mia Lunch in Rain",
    memory: seedScenarioMemory,
    inputs: {
      age: 28,
      nearbyMerchants: ["Cafe Hafen", "Brot Ecke", "Suppe & Co"],
      grounding: stuttgartDemoGrounding("Cafe Hafen")
    }
  }
];

export async function runMockAgent(request: RunAgentRequest): Promise<RunAgentResponse> {
  const { latencyMs, output, tokens, payload } = computeRun(request);
  await delay(latencyMs);
  return {
    success: true,
    output,
    latency: latencyMs,
    tokens,
    payload
  };
}

/** Strip fields the executor must not see. */
export function toExecutorRequest(body: RunAgentRequest): RunAgentRequest {
  const { stream, ...rest } = body;
  void stream;
  return rest;
}

const STREAM_CHUNK = 28;
const STREAM_CHUNK_GAP_MS = 14;

export async function* runMockAgentStream(request: RunAgentRequest): AsyncGenerator<RunAgentStreamEvent> {
  const started = Date.now();
  const { agent } = request;
  const wait = baseLatencyMs(agent);
  yield { type: "status", message: `${agent.replace(/-/g, " ")} — starting` };

  const ticks = 5;
  for (let i = 0; i < ticks; i++) {
    await delay(wait / ticks);
    yield { type: "status", message: `Grounding & policy… ${Math.round(((i + 1) / ticks) * 100)}%` };
  }

  const { latencyMs, output, tokens, payload } = computeRun(request);

  for (let i = 0; i < output.length; i += STREAM_CHUNK) {
    yield { type: "delta", text: output.slice(i, i + STREAM_CHUNK) };
    await delay(STREAM_CHUNK_GAP_MS);
  }

  const latency = Date.now() - started;
  yield {
    type: "complete",
    success: true,
    output,
    latency,
    tokens,
    payload: { ...payload, simulatedModelLatencyMs: latencyMs }
  };
}

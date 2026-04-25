import {
  type DataGrounding,
  isDataGrounding,
  stuttgartDemoGrounding
} from "@/lib/data-grounding";

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
};

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
    return request.grounding;
  }
  const fromInput = request.input.grounding;
  if (isDataGrounding(fromInput)) {
    return fromInput;
  }
  const merchants = request.input.nearbyMerchants;
  const first =
    Array.isArray(merchants) && merchants.length > 0 && typeof merchants[0] === "string"
      ? merchants[0]
      : "Cafe Hafen";
  return stuttgartDemoGrounding(first);
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

function generateOffer(memory: SharedMemory, g: DataGrounding) {
  const quietBoost = g.payone.quietScore >= 0.6 ? 8 : 4;
  const eventAdj = g.localEvent.demandTier === "high" ? "Bundle with festival snack tier" : "Standard city-wallet stack";
  if (memory.mood.toLowerCase().includes("hungry") || g.onDeviceIntent.abstractIntent === "food_now") {
    return `${eventAdj}: ${quietBoost + 12}% off hot drink + sandwich at ${g.poi.anchorPoiName} (quiet-period Payone signal).`;
  }
  return `${quietBoost + 7}% cashback at nearby partners (footfall ${g.poi.footfallProxy.toFixed(2)}).`;
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

function merchantRules(memory: SharedMemory, g: DataGrounding) {
  const quiet = g.payone.quietScore >= 0.55;
  const lowTraffic = memory.merchantTraffic === "low" || g.payone.txPer15m < g.payone.baselineTxPer15m * 0.5;
  if (quiet && lowTraffic) {
    return `Rule: Payone quietScore ${g.payone.quietScore.toFixed(2)} + legacy traffic "${memory.merchantTraffic}" → dynamic discount corridor enabled (+${Math.round(6 + g.payone.quietScore * 10)} bp).`;
  }
  return "Rule: standard corridor; Payone density within baseline band.";
}

function analyticsPrediction(memory: SharedMemory, g: DataGrounding) {
  const base = g.weather.precipMm1h >= 0.5 ? 0.7 : 0.62;
  const foot = (g.poi.footfallProxy - 0.5) * 0.06;
  const quiet = (g.payone.quietScore - 0.5) * 0.1;
  const intent = g.onDeviceIntent.confidence * 0.05;
  const p = Math.min(0.94, Math.max(0.28, base + foot + quiet + intent));
  return `Predicted acceptance: ${Math.round(p * 100)}% (grounded on weather precip, POI footfall, Payone quiet, on-device intent confidence).`;
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
  const { agent, sharedMemory } = request;
  const g = resolveGrounding(request);
  const baseDelay = 520 + agent.length * 25;
  await delay(baseDelay);

  let output = "";
  switch (agent) {
    case "context-agent":
      output = inferContext(sharedMemory, g);
      break;
    case "offer-generator-agent":
      output = generateOffer(sharedMemory, g);
      break;
    case "ux-copy-agent":
      output = generateUxCopy(sharedMemory, g);
      break;
    case "checkout-agent":
      output = `Generated QR token: ${generateCheckoutToken(sharedMemory, g)}`;
      break;
    case "merchant-rules-agent":
      output = merchantRules(sharedMemory, g);
      break;
    case "analytics-agent":
      output = analyticsPrediction(sharedMemory, g);
      break;
    default:
      output = "Agent run completed.";
  }

  return {
    success: true,
    output,
    latency: baseDelay,
    tokens: seededTokenWeights[agent] + sharedMemory.location.length * 3,
    payload: {
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
    }
  };
}

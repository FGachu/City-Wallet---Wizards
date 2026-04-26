import type { AgentKey } from "@/lib/mock-agents";

export const PIPELINE_ORDER: AgentKey[] = [
  "context-agent",
  "offer-generator-agent",
  "ux-copy-agent",
  "checkout-agent",
  "analytics-agent"
];

export const AGENT_LABELS: Record<AgentKey, string> = {
  "context-agent": "Context Agent",
  "offer-generator-agent": "Offer Generator Agent",
  "ux-copy-agent": "UX Copy Agent",
  "checkout-agent": "Checkout Agent",
  "merchant-rules-agent": "Merchant Rules Agent",
  "analytics-agent": "Analytics Agent"
};

export const DEFAULT_PROMPTS: Record<AgentKey, string> = {
  "context-agent": "Infer user intent from weather, location, and mood.",
  "offer-generator-agent": "Generate best wallet offer for current context.",
  "ux-copy-agent": "Write short motivating in-app copy with emoji if relevant.",
  "checkout-agent": "Generate secure QR checkout token for selected offer.",
  "merchant-rules-agent": "Apply merchant traffic and discount policy rules.",
  "analytics-agent": "Estimate acceptance probability and tracking event."
};

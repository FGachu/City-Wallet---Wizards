import type { RunAgentStreamEvent } from "@/lib/mock-agents";

export type StreamHandlers = {
  onStatus?: (message: string) => void;
  onDelta?: (text: string) => void;
  onComplete?: (event: Extract<RunAgentStreamEvent, { type: "complete" }>) => void;
  onError?: (message: string) => void;
};

/** Parse newline-delimited SSE `data: {...}` frames from a fetch Response body. */
export async function consumeRunAgentSse(response: Response, handlers: StreamHandlers): Promise<void> {
  const reader = response.body?.getReader();
  if (!reader) {
    handlers.onError?.("No response body");
    return;
  }

  const decoder = new TextDecoder();
  let carry = "";

  const flushBlock = (block: string) => {
    const lines = block.split("\n");
    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      const raw = line.slice(5).trim();
      if (!raw) continue;
      let ev: RunAgentStreamEvent;
      try {
        ev = JSON.parse(raw) as RunAgentStreamEvent;
      } catch {
        handlers.onError?.("Invalid SSE payload");
        continue;
      }
      if (ev.type === "status") handlers.onStatus?.(ev.message);
      else if (ev.type === "delta") handlers.onDelta?.(ev.text);
      else if (ev.type === "complete") handlers.onComplete?.(ev);
      else if (ev.type === "error") handlers.onError?.(ev.message);
    }
  };

  while (true) {
    const { done, value } = await reader.read();
    carry += decoder.decode(value, { stream: !done });
    const parts = carry.split("\n\n");
    carry = parts.pop() ?? "";
    for (const p of parts) {
      if (p.trim()) flushBlock(p);
    }
    if (done) break;
  }
  if (carry.trim()) flushBlock(carry);
}

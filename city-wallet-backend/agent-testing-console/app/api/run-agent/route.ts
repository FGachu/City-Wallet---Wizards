import { runMockAgent, runMockAgentStream, toExecutorRequest, type RunAgentRequest } from "@/lib/mock-agents";

type ExternalBackendContext = {
  city: string;
  current_time_utc: string;
  weather: { condition: string; temperature_c: number };
  merchant_activity: Array<{ merchant: string; category: string; activity: string; note: string }>;
};

function getExternalBaseUrl() {
  return process.env.AGENT_API_BASE_URL?.trim().replace(/\/+$/, "");
}

function getExternalHeaders() {
  const key = process.env.AGENT_API_KEY?.trim();
  return {
    "Content-Type": "application/json",
    ...(key ? { Authorization: `Bearer ${key}` } : {})
  };
}

function toOutputFromContext(ctx: ExternalBackendContext) {
  const activities = ctx.merchant_activity
    .map((m) => `${m.merchant}(${m.category}): ${m.activity}`)
    .join(", ");
  return `API context for ${ctx.city}: ${ctx.weather.condition}, ${ctx.weather.temperature_c}°C at ${ctx.current_time_utc}. Merchant activity: ${activities}.`;
}

async function callExternalCityWalletBackend(exec: RunAgentRequest) {
  const base = getExternalBaseUrl();
  if (!base) return null;

  const started = Date.now();
  const city = exec.sharedMemory.location || "Stuttgart";
  const headers = getExternalHeaders();

  try {
    if (exec.agent === "context-agent") {
      const res = await fetch(`${base}/context?city=${encodeURIComponent(city)}`, {
        method: "GET",
        cache: "no-store",
        headers: keylessHeaders(headers)
      });
      if (!res.ok) throw new Error(`External /context failed (${res.status})`);
      const ctx = (await res.json()) as ExternalBackendContext;
      return {
        success: true,
        output: toOutputFromContext(ctx),
        latency: Date.now() - started,
        tokens: 180,
        payload: { source: "external-api", endpoint: "/context", context: ctx }
      };
    }

    if (
      exec.agent === "offer-generator-agent" ||
      exec.agent === "ux-copy-agent" ||
      exec.agent === "analytics-agent"
    ) {
      const payload = {
        city,
        user_segment: exec.sharedMemory.userIntent || "daily-commuter",
        wallet_balance: Number(exec.input.walletBalance ?? 75),
        preferred_categories: Array.isArray(exec.input.preferredCategories)
          ? exec.input.preferredCategories
          : ["coffee", "grocery"]
      };
      const res = await fetch(`${base}/generate-offer`, {
        method: "POST",
        headers,
        cache: "no-store",
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const detail = await res.text();
        throw new Error(`External /generate-offer failed (${res.status}): ${detail}`);
      }
      const offer = (await res.json()) as {
        offer_title: string;
        offer_description: string;
        validity: string;
        redemption_hint: string;
        context: ExternalBackendContext;
      };
      const output =
        exec.agent === "analytics-agent"
          ? `Offer API signal: "${offer.offer_title}" valid ${offer.validity}. Weather ${offer.context.weather.condition}.`
          : exec.agent === "ux-copy-agent"
            ? `${offer.offer_title} - ${offer.offer_description}`
            : `${offer.offer_title}: ${offer.offer_description} (validity: ${offer.validity})`;

      return {
        success: true,
        output,
        latency: Date.now() - started,
        tokens: 260,
        payload: { source: "external-api", endpoint: "/generate-offer", offer }
      };
    }

    if (exec.agent === "checkout-agent") {
      const payload = {
        offer_id: String(exec.input.offerId ?? "offer_123"),
        user_id: String(exec.input.userId ?? exec.sharedMemory.userName ?? "user_1")
      };
      const res = await fetch(`${base}/redeem`, {
        method: "POST",
        headers,
        cache: "no-store",
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(`External /redeem failed (${res.status})`);
      const redeem = (await res.json()) as { status: string; qr_token: string; expires_at_utc: string };
      return {
        success: true,
        output: `Generated QR token: ${redeem.qr_token}`,
        latency: Date.now() - started,
        tokens: 140,
        payload: { source: "external-api", endpoint: "/redeem", redeem }
      };
    }

    return null;
  } catch (error) {
    return {
      success: false,
      output: "External API failed; using mock fallback.",
      latency: Date.now() - started,
      tokens: 0,
      payload: { source: "external-api", error: error instanceof Error ? error.message : "Unknown external error" }
    };
  }
}

function keylessHeaders(headers: Record<string, string>) {
  const next = { ...headers };
  delete next.Authorization;
  return next;
}

function sseResponse(stream: ReadableStream<Uint8Array>) {
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no"
    }
  });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RunAgentRequest;
    const exec = toExecutorRequest(body);
    const external = await callExternalCityWalletBackend(exec);

    if (body.stream) {
      const encoder = new TextEncoder();
      const readable = new ReadableStream<Uint8Array>({
        async start(controller) {
          const send = (obj: unknown) => {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
          };
          try {
            if (external?.success) {
              send({ type: "status", message: "Using configured external API backend" });
              send({ type: "delta", text: external.output });
              send({
                type: "complete",
                success: true,
                output: external.output,
                latency: external.latency,
                tokens: external.tokens,
                payload: external.payload
              });
              return;
            }
            for await (const event of runMockAgentStream(exec)) send(event);
          } catch (err) {
            send({
              type: "error",
              message: err instanceof Error ? err.message : "Stream failed"
            });
          } finally {
            controller.close();
          }
        }
      });
      return sseResponse(readable);
    }

    if (external?.success) return Response.json(external);
    return Response.json(await runMockAgent(exec));
  } catch (error) {
    return Response.json(
      {
        success: false,
        output: "Failed to run agent",
        latency: 0,
        tokens: 0,
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

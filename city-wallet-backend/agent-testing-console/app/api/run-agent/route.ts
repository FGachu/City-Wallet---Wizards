import { NextResponse } from "next/server";
import { runMockAgent, type RunAgentRequest } from "@/lib/mock-agents";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RunAgentRequest;
    const result = await runMockAgent(body);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
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

import { NextResponse } from "next/server";
import {
  isNavigationPath,
  type NavigationPath,
} from "@/lib/navigation-items";
import { db } from "@/lib/db";

const DEFAULT_PATH: NavigationPath = "/";

type ConsoleStateResponse = {
  onboardingComplete: boolean;
  lastVisitedPath: NavigationPath;
};

async function readConsoleState(): Promise<ConsoleStateResponse> {
  const row = await db.consoleState.findUnique({ where: { id: 1 } });
  const onboardingComplete = row?.onboardingComplete ?? false;
  const rawPath = row?.lastVisitedPath ?? DEFAULT_PATH;
  const lastVisitedPath = isNavigationPath(rawPath) ? rawPath : DEFAULT_PATH;

  return { onboardingComplete, lastVisitedPath };
}

export async function GET() {
  return NextResponse.json(await readConsoleState());
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    onboardingComplete?: boolean;
    lastVisitedPath?: string;
  };

  const currentState = await readConsoleState();
  const onboardingComplete =
    body.onboardingComplete ?? currentState.onboardingComplete;
  const requestedPath = body.lastVisitedPath ?? currentState.lastVisitedPath;
  const lastVisitedPath = isNavigationPath(requestedPath)
    ? requestedPath
    : currentState.lastVisitedPath;

  await db.consoleState.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      onboardingComplete,
      lastVisitedPath,
    },
    update: {
      onboardingComplete,
      lastVisitedPath,
    },
  });

  return NextResponse.json({
    onboardingComplete,
    lastVisitedPath,
  } satisfies ConsoleStateResponse);
}

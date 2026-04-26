import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  isNavigationPath,
  type NavigationPath,
} from "@/lib/navigation-items";

const ONBOARDING_COOKIE = "city-wallet-onboarding-complete";
const LAST_PATH_COOKIE = "city-wallet-last-path";
const DEFAULT_PATH: NavigationPath = "/";

type ConsoleStateResponse = {
  onboardingComplete: boolean;
  lastVisitedPath: NavigationPath;
};

async function readConsoleState(): Promise<ConsoleStateResponse> {
  const store = await cookies();
  const onboardingComplete = store.get(ONBOARDING_COOKIE)?.value === "true";
  const rawPath = store.get(LAST_PATH_COOKIE)?.value ?? DEFAULT_PATH;
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

  const store = await cookies();
  const oneYear = 60 * 60 * 24 * 365;

  store.set(ONBOARDING_COOKIE, String(onboardingComplete), {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: oneYear,
  });

  store.set(LAST_PATH_COOKIE, lastVisitedPath, {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: oneYear,
  });

  return NextResponse.json({
    onboardingComplete,
    lastVisitedPath,
  } satisfies ConsoleStateResponse);
}

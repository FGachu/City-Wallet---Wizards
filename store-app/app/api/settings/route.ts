import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  defaultMerchantSettings,
  parseMerchantSettings,
  type MerchantSettings,
} from "@/lib/merchant-settings";

const SETTINGS_COOKIE = "city-wallet-merchant-settings";

async function readSettings(): Promise<MerchantSettings> {
  const store = await cookies();
  const value = store.get(SETTINGS_COOKIE)?.value;
  if (!value) return defaultMerchantSettings;

  try {
    return parseMerchantSettings(JSON.parse(value));
  } catch {
    return defaultMerchantSettings;
  }
}

export async function GET() {
  return NextResponse.json(await readSettings());
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as unknown;
  const settings = parseMerchantSettings(body);
  const store = await cookies();

  store.set(SETTINGS_COOKIE, JSON.stringify(settings), {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  return NextResponse.json(settings);
}

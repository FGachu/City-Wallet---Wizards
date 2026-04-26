import { NextResponse } from "next/server";
import {
  defaultMerchantSettings,
  parseMerchantSettings,
  type MerchantSettings,
} from "@/lib/merchant-settings";
import { db } from "@/lib/db";

async function readSettings(): Promise<MerchantSettings> {
  try {
    const row = await db.merchantSettings.findUnique({ where: { id: 1 } });
    if (!row) return defaultMerchantSettings;
    return parseMerchantSettings(row);
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
  await db.merchantSettings.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      ...settings,
    },
    update: settings,
  });

  return NextResponse.json(settings);
}

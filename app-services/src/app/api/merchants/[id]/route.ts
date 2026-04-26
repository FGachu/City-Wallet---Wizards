import { NextResponse } from "next/server";
import { getMerchantById } from "@/lib/merchants/catalog";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const merchant = getMerchantById(id);

  if (!merchant) {
    return NextResponse.json(
      { error: "Merchant not found", id },
      { status: 404, headers: CORS_HEADERS },
    );
  }

  return NextResponse.json(
    {
      source: "registered.catalog",
      merchant: {
        id: merchant.id,
        name: merchant.name,
        category: merchant.category,
        mcc: merchant.mcc,
        address: merchant.address,
        location: { lat: merchant.lat, lon: merchant.lon },
        rating: merchant.rating,
        userRatingCount: merchant.userRatingCount,
        priceLevel: merchant.priceLevel,
        baselineDailyTx: merchant.baselineDailyTx,
        avgTicketCents: merchant.avgTicketCents,
        googlePlaceId: merchant.googlePlaceId,
        quietWindows: merchant.quietWindows,
        rules: merchant.rules,
        products: merchant.products,
      },
    },
    { headers: CORS_HEADERS },
  );
}

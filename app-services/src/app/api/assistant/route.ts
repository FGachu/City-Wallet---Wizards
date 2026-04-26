import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // For local hackathon dev purposes, return a dummy response if no key is found
      return NextResponse.json({
        message: "It's cold and overcast outside, and foot traffic is low. Suggesting a 15% 'Rainy Day' discount on Hot Chocolate to boost volume. (Simulated AI Response)",
        suggestedProduct: "Hot Chocolate",
        suggestedDiscount: 15
      }, { headers: CORS_HEADERS });
    }

    const body = await request.json();
    const { weather, events, demandLevel, maxDiscount, products } = body;

    // --- PRIVACY COMPLIANCE BOUNDARY ---
    // At this boundary, we strip all precise local coordinates, sensitive user histories, 
    // and exact merchant location data. We ONLY send abstract intent signals to the cloud AI.
    // e.g. We send "Raining, 11C" and "Demand: Low (Quiet Period)" instead of GPS coordinates.
    // This strict separation ensures GDPR compliance as requested by the DSV Hackathon rules.
    const abstractContext = {
      weatherCondition: weather?.conditions?.description || "Overcast",
      temperature: weather?.temperature?.current || 11,
      localEventsCount: events?.length || 0,
      currentDemand: demandLevel || "bring", // 'bring' (quiet), 'steady' (normal), 'full' (busy)
      maxAllowedDiscount: maxDiscount || 20,
      availableProducts: products?.map((p: any) => p.name).join(", ") || "Cappuccino, Apfelstrudel, Hot Chocolate",
    };

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
You are an expert marketing AI for a local merchant in a City Wallet app.
Current abstract context:
- Weather: ${abstractContext.temperature}°C, ${abstractContext.weatherCondition}
- Events nearby today: ${abstractContext.localEventsCount}
- Shop Demand Level: ${abstractContext.currentDemand} (bring = quiet/empty, steady = normal, full = very busy)
- Max allowed discount: ${abstractContext.maxAllowedDiscount}%
- Available products to promote: ${abstractContext.availableProducts}

Based on this context, generate a short, proactive, contextual notification to the merchant.
For example, if it's raining and demand is 'bring' (low), suggest a 'Rainy Day' discount on warm drinks.
If demand is 'full', suggest pausing promos.

Output the notification message, the suggested product, and the suggested discount percentage (must not exceed max allowed).

Respond ONLY with a JSON object in this exact format:
{
  "message": "It's raining and shop traffic is low today. Suggesting a 15% 'Rainy Day' discount on warm drinks to boost volume.",
  "suggestedProduct": "Hot Chocolate",
  "suggestedDiscount": 15
}
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanedText);

    return NextResponse.json(parsed, { headers: CORS_HEADERS });

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate notification", details: error.message },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
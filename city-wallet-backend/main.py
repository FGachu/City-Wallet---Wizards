import hashlib
import os
import random
import secrets
from datetime import datetime, timezone
from typing import Literal

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from openai import AsyncOpenAI
from pydantic import BaseModel, Field


app = FastAPI(title="City Wallet Backend", version="0.1.0")
STATIC_DIR = "static"

app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


class Weather(BaseModel):
    condition: str
    temperature_c: float


class MerchantActivity(BaseModel):
    merchant: str
    category: str
    activity: Literal["low", "medium", "high"]
    note: str


class ContextResponse(BaseModel):
    city: str
    current_time_utc: str
    weather: Weather
    merchant_activity: list[MerchantActivity]


class GenerateOfferRequest(BaseModel):
    city: str = Field(default="Tashkent")
    user_segment: str = Field(default="daily-commuter")
    wallet_balance: float = Field(default=50.0, ge=0)
    preferred_categories: list[str] = Field(default_factory=lambda: ["coffee", "grocery"])


class GenerateOfferResponse(BaseModel):
    offer_title: str
    offer_description: str
    validity: str
    redemption_hint: str
    context: ContextResponse


class RedeemRequest(BaseModel):
    offer_id: str
    user_id: str


class RedeemResponse(BaseModel):
    status: str
    qr_token: str
    expires_at_utc: str


def _simulate_weather(city: str) -> Weather:
    conditions = ["sunny", "cloudy", "rainy", "windy", "partly cloudy"]
    city_seed = int(hashlib.sha256(city.encode("utf-8")).hexdigest(), 16)
    rng = random.Random(city_seed + datetime.now(timezone.utc).hour)
    return Weather(
        condition=rng.choice(conditions),
        temperature_c=round(rng.uniform(9.0, 34.0), 1),
    )


def _simulate_merchant_activity(city: str) -> list[MerchantActivity]:
    city_seed = int(hashlib.md5(city.encode("utf-8")).hexdigest(), 16)  # nosec B324
    rng = random.Random(city_seed + datetime.now(timezone.utc).minute // 10)
    merchants = [
        ("Metro Cafe", "coffee"),
        ("Green Basket", "grocery"),
        ("RideNow", "transport"),
        ("FitHub", "fitness"),
        ("CityCinema", "entertainment"),
    ]
    levels: list[Literal["low", "medium", "high"]] = ["low", "medium", "high"]

    simulated: list[MerchantActivity] = []
    for merchant, category in merchants[:3]:
        level = rng.choice(levels)
        note = {
            "low": "Quiet period, merchants are likely to accept promo traffic.",
            "medium": "Steady traffic, targeted offers can still perform well.",
            "high": "Peak demand right now, urgency-based offers may convert better.",
        }[level]
        simulated.append(
            MerchantActivity(
                merchant=merchant,
                category=category,
                activity=level,
                note=note,
            )
        )
    return simulated


def build_context(city: str) -> ContextResponse:
    return ContextResponse(
        city=city,
        current_time_utc=datetime.now(timezone.utc).isoformat(),
        weather=_simulate_weather(city),
        merchant_activity=_simulate_merchant_activity(city),
    )


@app.get("/", include_in_schema=False)
async def serve_frontend() -> FileResponse:
    return FileResponse(f"{STATIC_DIR}/index.html")


@app.get("/context", response_model=ContextResponse)
async def get_context(city: str = "Tashkent") -> ContextResponse:
    return build_context(city=city)


@app.post("/generate-offer", response_model=GenerateOfferResponse)
async def generate_offer(payload: GenerateOfferRequest) -> GenerateOfferResponse:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY is not set.")
    openai_client = AsyncOpenAI(api_key=api_key)

    context = build_context(city=payload.city)
    prompt = f"""
You are generating one wallet offer for a city wallet app.
City: {payload.city}
UTC Time: {context.current_time_utc}
Weather: {context.weather.condition}, {context.weather.temperature_c}C
Merchant activity: {[m.model_dump() for m in context.merchant_activity]}
User segment: {payload.user_segment}
Wallet balance: {payload.wallet_balance}
Preferred categories: {payload.preferred_categories}

Return a concise JSON object with:
- offer_title
- offer_description
- validity
- redemption_hint
"""

    try:
        response = await openai_client.responses.create(
            model="gpt-4o-mini",
            input=prompt,
            response_format={
                "type": "json_schema",
                "json_schema": {
                    "name": "city_wallet_offer",
                    "schema": {
                        "type": "object",
                        "properties": {
                            "offer_title": {"type": "string"},
                            "offer_description": {"type": "string"},
                            "validity": {"type": "string"},
                            "redemption_hint": {"type": "string"},
                        },
                        "required": [
                            "offer_title",
                            "offer_description",
                            "validity",
                            "redemption_hint",
                        ],
                        "additionalProperties": False,
                    },
                    "strict": True,
                },
            },
        )

        offer = response.output_parsed
        return GenerateOfferResponse(context=context, **offer)
    except Exception as exc:  # Keep the endpoint simple and explicit for API clients.
        raise HTTPException(status_code=502, detail=f"OpenAI request failed: {exc}") from exc


@app.post("/redeem", response_model=RedeemResponse)
async def redeem_offer(payload: RedeemRequest) -> RedeemResponse:
    token = f"qr_{payload.offer_id}_{payload.user_id}_{secrets.token_urlsafe(12)}"
    return RedeemResponse(
        status="success",
        qr_token=token,
        expires_at_utc=datetime.now(timezone.utc).isoformat(),
    )

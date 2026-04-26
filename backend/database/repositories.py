"""Data access only — no offer-generation or external context logic."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Sequence

from sqlalchemy import func, literal, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.database.models import DiscountRule, Inventory, InventoryStatus, Item, Merchant

# Stock thresholds (tune per deployment via env later if needed)
LOW_STOCK_THRESHOLD = 5


def _stock_status(count: int) -> InventoryStatus:
    if count <= 0:
        return InventoryStatus.out_of_stock
    if count < LOW_STOCK_THRESHOLD:
        return InventoryStatus.low_stock
    return InventoryStatus.in_stock


def _haversine_distance_m(lat: float, lon: float):
    """SQL expression: great-circle distance in meters from (lat, lon) to merchants row."""
    r_m = literal(6371000.0)
    dlat = func.radians(Merchant.lat - literal(lat))
    dlon = func.radians(Merchant.lon - literal(lon))
    lat1 = func.radians(Merchant.lat)
    lat2 = func.radians(literal(lat))
    a = func.pow(func.sin(dlat / 2), 2) + func.cos(lat1) * func.cos(lat2) * func.pow(
        func.sin(dlon / 2), 2
    )
    a_clamped = func.least(1.0 - 1e-9, func.greatest(1e-12, a))
    return r_m * (2 * func.asin(func.sqrt(a_clamped)))


async def get_nearby_items(
    session: AsyncSession,
    lat: float,
    lon: float,
    *,
    radius_km: float = 10.0,
    limit: int = 50,
) -> Sequence[tuple[Item, float]]:
    """
    Return menu items for active merchants within ``radius_km`` of (lat, lon),
    ordered by distance (meters). Distance uses the merchant coordinates.
    """
    dist = _haversine_distance_m(lat, lon)
    radius_m = radius_km * 1000.0

    stmt = (
        select(Item, dist.label("distance_m"))
        .join(Merchant, Item.merchant_id == Merchant.id)
        .where(Merchant.is_active.is_(True))
        .where(dist <= literal(radius_m))
        .order_by(dist.asc())
        .limit(limit)
    )
    result = await session.execute(stmt)
    rows = result.all()
    return [(row[0], float(row[1])) for row in rows]


async def get_item_inventory(session: AsyncSession, item_id: int) -> Inventory | None:
    """Return the inventory row for ``item_id``, if any."""
    stmt = select(Inventory).where(Inventory.item_id == item_id)
    result = await session.execute(stmt)
    return result.scalar_one_or_none()


async def get_discount_rules(session: AsyncSession, item_id: int) -> Sequence[DiscountRule]:
    """
    Rules applicable to ``item_id``: same merchant, either global (no item) or
    targeted to this item.
    """
    merchant_id = await session.scalar(select(Item.merchant_id).where(Item.id == item_id))
    if merchant_id is None:
        return []
    stmt = (
        select(DiscountRule)
        .where(DiscountRule.merchant_id == merchant_id)
        .where(or_(DiscountRule.item_id.is_(None), DiscountRule.item_id == item_id))
        .order_by(DiscountRule.id.asc())
    )
    result = await session.execute(stmt)
    return result.scalars().all()


async def update_inventory(session: AsyncSession, item_id: int, delta: int) -> Inventory:
    """
    Apply ``delta`` to ``stock_count`` (clamped at zero). Creates a row if missing.
    Updates ``status`` and ``last_updated``.
    """
    now = datetime.now(timezone.utc)
    row = await get_item_inventory(session, item_id)
    if row is None:
        new_count = max(0, delta)
        row = Inventory(
            item_id=item_id,
            stock_count=new_count,
            status=_stock_status(new_count),
            last_updated=now,
        )
        session.add(row)
        await session.flush()
        return row

    row.stock_count = max(0, row.stock_count + delta)
    row.status = _stock_status(row.stock_count)
    row.last_updated = now
    await session.flush()
    return row

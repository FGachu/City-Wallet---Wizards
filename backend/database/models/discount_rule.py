"""Merchant-defined discount constraints (not generated offers)."""

from __future__ import annotations

import enum
from datetime import datetime
from typing import TYPE_CHECKING, Any

from sqlalchemy import DateTime, Enum as SAEnum, Float, ForeignKey, Integer, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base

if TYPE_CHECKING:
    from .item import Item
    from .merchant import Merchant


class DiscountRuleType(str, enum.Enum):
    GLOBAL = "GLOBAL"
    ITEM = "ITEM"
    TIME_BASED = "TIME_BASED"


class DiscountRule(Base):
    __tablename__ = "discount_rules"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    merchant_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("merchants.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    item_id: Mapped[int | None] = mapped_column(
        Integer,
        ForeignKey("items.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    max_discount_percent: Mapped[float] = mapped_column(Float, nullable=False)
    rule_type: Mapped[DiscountRuleType] = mapped_column(
        SAEnum(
            DiscountRuleType,
            name="discount_rule_type",
            create_type=False,
            native_enum=True,
        ),
        nullable=False,
    )
    condition: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)
    start_time: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    end_time: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    merchant: Mapped["Merchant"] = relationship(
        back_populates="discount_rules",
        foreign_keys=[merchant_id],
    )
    item: Mapped["Item | None"] = relationship(
        back_populates="discount_rules",
        foreign_keys=[item_id],
    )

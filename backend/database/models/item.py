"""Menu item — belongs to one merchant."""

from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base

if TYPE_CHECKING:
    from .discount_rule import DiscountRule
    from .inventory import Inventory
    from .merchant import Merchant


class Item(Base):
    __tablename__ = "items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    merchant_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("merchants.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str] = mapped_column(String(128), nullable=False)
    base_price: Mapped[float] = mapped_column(Float, nullable=False)
    is_perishable: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    is_high_margin: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    merchant: Mapped["Merchant"] = relationship(back_populates="items")
    inventory: Mapped["Inventory | None"] = relationship(
        back_populates="item",
        uselist=False,
    )
    discount_rules: Mapped[list["DiscountRule"]] = relationship(back_populates="item")

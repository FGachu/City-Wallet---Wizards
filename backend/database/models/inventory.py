"""Per-item stock state — semi-dynamic layer."""

from __future__ import annotations

import enum
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum as SAEnum, ForeignKey, Integer, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base

if TYPE_CHECKING:
    from .item import Item


class InventoryStatus(str, enum.Enum):
    in_stock = "in_stock"
    low_stock = "low_stock"
    out_of_stock = "out_of_stock"


class Inventory(Base):
    __tablename__ = "inventory"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    item_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("items.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )
    stock_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    status: Mapped[InventoryStatus] = mapped_column(
        SAEnum(
            InventoryStatus,
            name="inventory_status",
            create_type=False,
            native_enum=True,
        ),
        nullable=False,
        default=InventoryStatus.in_stock,
    )
    last_updated: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    item: Mapped["Item"] = relationship(back_populates="inventory")

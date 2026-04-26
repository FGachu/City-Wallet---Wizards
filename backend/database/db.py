"""Session helpers for FastAPI (or other ASGI) integration."""

from __future__ import annotations

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from sqlalchemy.ext.asyncio import AsyncSession

from backend.database.connection import AsyncSessionLocal, configure_engine


@asynccontextmanager
async def get_session() -> AsyncIterator[AsyncSession]:
    """
    Yield a database session.

    Callers commit or rollback explicitly after writes (recommended for FastAPI routes).
    """
    if AsyncSessionLocal is None:
        configure_engine()
    assert AsyncSessionLocal is not None
    async with AsyncSessionLocal() as session:
        yield session


async def session_dependency() -> AsyncIterator[AsyncSession]:
    """``Depends(session_dependency)`` — same semantics as ``get_session``."""
    if AsyncSessionLocal is None:
        configure_engine()
    assert AsyncSessionLocal is not None
    async with AsyncSessionLocal() as session:
        yield session


def init_db(engine=None) -> None:
    """Initialize global engine + session factory (app lifespan startup)."""
    configure_engine(engine)

"""Async SQLAlchemy engine and session factory (PostgreSQL / Supabase)."""

from __future__ import annotations

import os

from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)


def get_database_url() -> str:
    """Return async SQLAlchemy URL from ``DATABASE_URL``."""
    raw = os.environ.get("DATABASE_URL")
    if not raw or not raw.strip():
        raise RuntimeError(
            "DATABASE_URL is not set. Example: postgresql+asyncpg://user:pass@host:5432/dbname"
        )
    url = raw.strip()
    if url.startswith("postgres://"):
        url = "postgresql+asyncpg://" + url[len("postgres://") :]
    elif url.startswith("postgresql://") and "+asyncpg" not in url:
        url = "postgresql+asyncpg://" + url[len("postgresql://") :]
    return url


def create_async_engine_from_env(**kwargs) -> AsyncEngine:
    """Create async engine using ``DATABASE_URL``."""
    return create_async_engine(get_database_url(), pool_pre_ping=True, **kwargs)


_engine: AsyncEngine | None = None
AsyncSessionLocal: async_sessionmaker[AsyncSession] | None = None


def configure_engine(engine: AsyncEngine | None = None) -> None:
    """Initialize global engine and session factory (call once at app startup)."""
    global _engine, AsyncSessionLocal
    _engine = engine or create_async_engine_from_env()
    AsyncSessionLocal = async_sessionmaker(
        _engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autoflush=False,
    )


def get_engine() -> AsyncEngine:
    if _engine is None:
        configure_engine()
    assert _engine is not None
    return _engine

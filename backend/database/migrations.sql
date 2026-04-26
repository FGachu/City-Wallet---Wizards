-- Optional: hosted PostgreSQL / Supabase. Local dev uses store-app Prisma (SQLite, no Docker).
-- Apply with: psql "$DATABASE_URL" -f backend/database/migrations.sql

BEGIN;

CREATE TYPE inventory_status AS ENUM ('in_stock', 'low_stock', 'out_of_stock');

CREATE TYPE discount_rule_type AS ENUM ('GLOBAL', 'ITEM', 'TIME_BASED');

CREATE TABLE merchants (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    category        VARCHAR(128) NOT NULL,
    lat             DOUBLE PRECISION NOT NULL,
    lon             DOUBLE PRECISION NOT NULL,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX ix_merchants_active ON merchants (is_active) WHERE is_active = TRUE;

CREATE TABLE items (
    id               SERIAL PRIMARY KEY,
    merchant_id      INTEGER NOT NULL REFERENCES merchants (id) ON DELETE CASCADE,
    name             VARCHAR(255) NOT NULL,
    category         VARCHAR(128) NOT NULL,
    base_price       DOUBLE PRECISION NOT NULL,
    is_perishable    BOOLEAN NOT NULL DEFAULT FALSE,
    is_high_margin   BOOLEAN NOT NULL DEFAULT FALSE,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX ix_items_merchant_id ON items (merchant_id);
CREATE INDEX ix_items_category ON items (category);

CREATE TABLE discount_rules (
    id                     SERIAL PRIMARY KEY,
    merchant_id            INTEGER NOT NULL REFERENCES merchants (id) ON DELETE CASCADE,
    item_id                INTEGER REFERENCES items (id) ON DELETE CASCADE,
    max_discount_percent   DOUBLE PRECISION NOT NULL,
    rule_type              discount_rule_type NOT NULL,
    condition              JSONB,
    start_time             TIMESTAMPTZ,
    end_time               TIMESTAMPTZ,
    created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT ck_discount_percent CHECK (max_discount_percent >= 0 AND max_discount_percent <= 100)
);

CREATE INDEX ix_discount_rules_merchant ON discount_rules (merchant_id);
CREATE INDEX ix_discount_rules_item ON discount_rules (item_id);

CREATE TABLE inventory (
    id            SERIAL PRIMARY KEY,
    item_id       INTEGER NOT NULL UNIQUE REFERENCES items (id) ON DELETE CASCADE,
    stock_count   INTEGER NOT NULL DEFAULT 0,
    status        inventory_status NOT NULL DEFAULT 'in_stock',
    last_updated  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT ck_stock_non_negative CHECK (stock_count >= 0)
);

CREATE INDEX ix_inventory_status ON inventory (status);

COMMIT;

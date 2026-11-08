from psycopg_pool import ConnectionPool

from .config import settings

SCHEMA = """
CREATE TABLE IF NOT EXISTS sync_operations (
    op_id          UUID PRIMARY KEY,
    user_id        TEXT NOT NULL,
    op_type        TEXT NOT NULL,
    entity_type    TEXT NOT NULL,
    entity_id      TEXT,
    payload        JSONB NOT NULL,
    client_ts      TIMESTAMPTZ,
    schema_version INT NOT NULL DEFAULT 1,
    status         TEXT NOT NULL DEFAULT 'accepted',
    result         JSONB,
    received_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_sync_ops_user ON sync_operations (user_id, received_at);

CREATE TABLE IF NOT EXISTS farms (
    id UUID PRIMARY KEY,
    official_code TEXT,
    name TEXT NOT NULL,
    province TEXT NOT NULL,
    locality TEXT NOT NULL,
    farming_type TEXT NOT NULL,
    building_count_declared INT,
    status TEXT NOT NULL DEFAULT 'active',
    created_by TEXT NOT NULL,
    client_id UUID,
    version INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_farms_client_id ON farms (created_by, client_id) WHERE client_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS farm_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    clerk_user_id TEXT NOT NULL,
    membership_role TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (farm_id, clerk_user_id)
);
CREATE INDEX IF NOT EXISTS idx_memberships_user ON farm_memberships (clerk_user_id, status);

CREATE TABLE IF NOT EXISTS buildings (
    id UUID PRIMARY KEY,
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    capacity INT,
    status TEXT NOT NULL DEFAULT 'available',
    version INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bands (
    id UUID PRIMARY KEY,
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    building_id UUID REFERENCES buildings(id) ON DELETE SET NULL,
    official_code TEXT,
    placement_date DATE,
    initial_count INT,
    status TEXT NOT NULL DEFAULT 'active',
    version INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_bands_farm ON bands (farm_id, status);

CREATE TABLE IF NOT EXISTS daily_records (
    id UUID PRIMARY KEY,
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    band_id UUID NOT NULL REFERENCES bands(id) ON DELETE CASCADE,
    entry_date DATE NOT NULL,
    deaths INT,
    feed_kg NUMERIC(10,2),
    observations TEXT,
    created_by TEXT NOT NULL,
    version INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_band_date ON daily_records (band_id, entry_date) WHERE deaths IS NOT NULL OR feed_kg IS NOT NULL;

CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    action TEXT NOT NULL,
    detail JSONB,
    request_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_log (entity_type, entity_id);

-- Batch 03 : pesées, sorties, traitements, réceptions
CREATE TABLE IF NOT EXISTS weighings (
    id UUID PRIMARY KEY,
    farm_id UUID NOT NULL,
    band_id UUID NOT NULL,
    weighing_date DATE NOT NULL,
    sample_count INT NOT NULL,
    total_weight_kg NUMERIC(10,3) NOT NULL,
    average_weight_kg NUMERIC(10,4),
    recorded_by TEXT,
    version INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (band_id, weighing_date)
);

CREATE TABLE IF NOT EXISTS flock_exits (
    id UUID PRIMARY KEY,
    farm_id UUID NOT NULL,
    band_id UUID NOT NULL,
    exit_type TEXT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    recipient TEXT,
    exit_date DATE NOT NULL,
    lot_id UUID,
    provisional_lot_code TEXT,
    version INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Idempotence = op_id côté sync_operations, PAS contrainte métier :
-- deux cessions légitimes identiques (date/type/qté) doivent être possibles.
ALTER TABLE flock_exits DROP CONSTRAINT IF EXISTS flock_exits_band_id_exit_date_exit_type_quantity_key;

CREATE TABLE IF NOT EXISTS treatment_events (
    id UUID PRIMARY KEY,
    farm_id UUID NOT NULL,
    band_id UUID NOT NULL,
    treatment_type TEXT NOT NULL,
    product_name TEXT NOT NULL,
    batch_number TEXT,
    method TEXT,
    animals_treated INT,
    event_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending_confirmation',
    created_by TEXT,
    version INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS inventory_movements (
    id UUID PRIMARY KEY,
    farm_id UUID NOT NULL,
    product_id TEXT,
    band_id UUID,
    quantity NUMERIC(12,3) NOT NULL,
    unit TEXT NOT NULL,
    movement_type TEXT NOT NULL,
    source_record_id TEXT,
    movement_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_inv_mov_farm ON inventory_movements (farm_id, movement_date);

CREATE TABLE IF NOT EXISTS inventory_receipts (
    id UUID PRIMARY KEY,
    farm_id UUID NOT NULL,
    product_name TEXT NOT NULL,
    quantity NUMERIC(12,3) NOT NULL,
    unit TEXT NOT NULL,
    receipt_date DATE NOT NULL,
    delivery_ref TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    movement_id UUID,
    version INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS health_declarations (
    id UUID PRIMARY KEY,
    farm_id UUID NOT NULL,
    band_id UUID NOT NULL,
    problem_type TEXT NOT NULL,
    signs TEXT,
    affected_count INT,
    notes TEXT,
    event_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending_review',
    created_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS health_attachments (
    id UUID PRIMARY KEY,
    declaration_id UUID NOT NULL,
    storage_path TEXT NOT NULL,
    mime_type TEXT,
    file_size BIGINT,
    checksum TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lots (
    id UUID PRIMARY KEY,
    farm_id UUID NOT NULL,
    band_id UUID NOT NULL,
    official_code TEXT UNIQUE,
    provisional_code TEXT,
    quantity INT NOT NULL,
    transfer_date DATE NOT NULL,
    recipient TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS farm_contacts (
    id UUID PRIMARY KEY,
    farm_id UUID NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS app_notifications (
    id UUID PRIMARY KEY,
    user_id TEXT NOT NULL,
    farm_id UUID,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    section TEXT NOT NULL DEFAULT 'general',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
"""

_pool: ConnectionPool | None = None


def get_pool() -> ConnectionPool:
    global _pool
    if _pool is None:
        if not settings.database_url:
            raise RuntimeError("DATABASE_URL non configurée")
        _pool = ConnectionPool(settings.database_url, min_size=1, max_size=5)
    return _pool


def init_db() -> None:
    with get_pool().connection() as conn:
        conn.execute(SCHEMA)


def check_db() -> bool:
    with get_pool().connection() as conn:
        conn.execute("SELECT 1")
    return True

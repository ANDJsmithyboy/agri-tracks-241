from datetime import datetime, timezone
from typing import Any
from uuid import UUID

from pydantic import BaseModel, Field, field_validator


class HealthOut(BaseModel):
    ok: bool
    db: str


class SyncOperationIn(BaseModel):
    """Opération client → serveur. op_id = UUID immuable généré côté client."""

    op_id: UUID
    op_type: str = Field(min_length=1, max_length=64)  # create|update|delete
    entity_type: str = Field(min_length=1, max_length=64)
    entity_id: str | None = None
    payload: dict[str, Any]
    client_ts: datetime | None = None
    schema_version: int = 1

    @field_validator("client_ts", mode="before")
    @classmethod
    def _parse_client_ts(cls, v: Any) -> datetime | Any:
        if isinstance(v, (int, float)):
            ts = v / 1000.0 if v > 1e10 else float(v)
            return datetime.fromtimestamp(ts, tz=timezone.utc)
        return v


class SyncPushRequest(BaseModel):
    operations: list[SyncOperationIn] = Field(max_length=500)


class SyncOpResult(BaseModel):
    op_id: UUID
    status: str  # accepted | duplicate | rejected
    server_revision: int | None = None
    message: str | None = None


class SyncPushResponse(BaseModel):
    results: list[SyncOpResult]


class SyncPullResponse(BaseModel):
    cursor: int
    server_operations: list[dict[str, Any]] = []
    reference_data: dict[str, list[dict[str, Any]]] = {
        "farms": [],
        "flocks": [],
        "buildings": [],
        "products": [],
        "business_rules": [],
    }


class SyncStatusResponse(BaseModel):
    server_pending_ops: int
    last_cursor: int
    server_time: datetime


# ── Fermes ──────────────────────────────────────────────────────────────

GABON_PROVINCES = {
    "estuaire", "haut-ogooue", "moyen-ogooue", "ngounie", "nyanga",
    "ogooue-ivindo", "ogooue-lolo", "ogooue-maritime", "woleu-ntem",
}
FARMING_TYPES = {"chair", "pondeuses", "mixte"}
MEMBERSHIP_ROLES = {"owner", "manager", "worker", "viewer"}


class FarmCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    province: str = Field(min_length=2, max_length=60)
    locality: str = Field(min_length=2, max_length=120)
    farming_type: str
    building_count_declared: int | None = Field(default=None, ge=1, le=200)
    client_id: UUID | None = None  # idempotence : UUID généré par le client


class BandSummary(BaseModel):
    id: str
    official_code: str | None = None
    placement_date: str | None = None
    initial_count: int | None = None
    current_population: int | None = None


class FarmOut(BaseModel):
    id: str
    official_code: str | None = None
    name: str
    province: str
    locality: str
    farming_type: str
    building_count_declared: int | None = None
    status: str
    membership_role: str
    version: int
    active_band: BandSummary | None = None
    created_at: str
    updated_at: str


class FarmListResponse(BaseModel):
    farms: list[FarmOut]

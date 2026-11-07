import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Query
from psycopg.types.json import Jsonb

from ..auth import get_claims
from ..db import check_db, get_pool
from ..schemas import (
    HealthOut,
    SyncOpResult,
    SyncPullResponse,
    SyncPushRequest,
    SyncPushResponse,
    SyncStatusResponse,
)

router = APIRouter(prefix="/api/v1", tags=["sync"])


@router.get("/health", response_model=HealthOut)
def health() -> HealthOut:
    try:
        check_db()
        return HealthOut(ok=True, db="up")
    except Exception:
        return HealthOut(ok=False, db="down")


@router.get("/me")
def me(claims: dict = Depends(get_claims)) -> dict:
    """Identité Clerk de l'utilisateur courant."""
    return {
        "sub": claims.get("sub"),
        "email": claims.get("email"),
        "name": claims.get("name"),
        "role": (claims.get("public_metadata") or {}).get("poufa_role"),
        "org_id": claims.get("org_id"),
    }


@router.post("/sync/push", response_model=SyncPushResponse)
def sync_push(
    body: SyncPushRequest,
    claims: dict = Depends(get_claims),
) -> SyncPushResponse:
    """
    Reçoit des opérations offline du client.
    Idempotent : op_id UUID déjà vu → 'duplicate', jamais retraité.
    L'acceptation autoritaire par entité métier viendra avec le schéma métier.
    """
    user_id = claims["sub"]
    results: list[SyncOpResult] = []

    with get_pool().connection() as conn:
        for op in body.operations:
            inserted = conn.execute(
                """
                INSERT INTO sync_operations
                    (op_id, user_id, op_type, entity_type, entity_id,
                     payload, client_ts, schema_version)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (op_id) DO NOTHING
                RETURNING op_id
                """,
                (
                    str(op.op_id),
                    user_id,
                    op.op_type,
                    op.entity_type,
                    op.entity_id,
                    Jsonb(op.payload),
                    op.client_ts,
                    op.schema_version,
                ),
            ).fetchone()
            status = "accepted" if inserted else "duplicate"
            if inserted:
                _apply_business_op(conn, user_id, op, results)
            results.append(
                SyncOpResult(
                    op_id=op.op_id,
                    status=status,
                    message=None if inserted else "opération déjà enregistrée",
                )
            )
    return SyncPushResponse(results=results)


def _apply_business_op(conn, user_id: str, op, results: list) -> None:
    """
    Applique une opération acceptée aux tables métier — idempotent via
    les contraintes UNIQUE (op rejouée → ON CONFLICT → ignorée).
    """
    p = op.payload
    et = op.entity_type
    try:
        if et == "daily_record":
            conn.execute(
                """
                INSERT INTO daily_records (id, farm_id, band_id, entry_date, deaths, feed_kg, observations, created_by)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
                ON CONFLICT (band_id, entry_date) WHERE deaths IS NOT NULL OR feed_kg IS NOT NULL
                DO UPDATE SET deaths=EXCLUDED.deaths, feed_kg=EXCLUDED.feed_kg,
                              observations=EXCLUDED.observations, updated_at=now(), version=daily_records.version+1
                """,
                (op.entity_id, p.get("farm_id"), p.get("band_id"), p.get("record_date"),
                 p.get("deaths"), p.get("feed_kg"), p.get("observations"), user_id),
            )
        elif et == "weighing":
            conn.execute(
                """
                INSERT INTO weighings (id, farm_id, band_id, weighing_date, sample_count, total_weight_kg, average_weight_kg, recorded_by)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
                ON CONFLICT (band_id, weighing_date) DO NOTHING
                """,
                (op.entity_id, p.get("farm_id"), p.get("band_id"), p.get("date"),
                 p.get("sample_count"), p.get("total_weight_kg"),
                 (p.get("total_weight_kg") or 0) / (p.get("sample_count") or 1)
                 if p.get("sample_count") else None, user_id),
            )
        elif et == "flock_exit":
            conn.execute(
                """
                INSERT INTO flock_exits (id, farm_id, band_id, exit_type, quantity, recipient, exit_date, lot_id, provisional_lot_code)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)
                ON CONFLICT (band_id, exit_date, exit_type, quantity) DO NOTHING
                """,
                (op.entity_id, p.get("farm_id"), p.get("band_id"), p.get("type"),
                 p.get("quantity"), p.get("recipient"), p.get("date"),
                 p.get("lot_id"), p.get("provisional_lot_code")),
            )
        elif et == "treatment":
            conn.execute(
                """
                INSERT INTO treatment_events (id, farm_id, band_id, treatment_type, product_name, batch_number, method, animals_treated, event_date, created_by)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                ON CONFLICT DO NOTHING
                """,
                (op.entity_id, p.get("farm_id"), p.get("band_id"), p.get("type"),
                 p.get("product"), p.get("batch"), p.get("method"),
                 p.get("animals"), p.get("date"), user_id),
            )
        elif et == "receipt_confirm":
            conn.execute(
                """
                INSERT INTO inventory_movements (id, farm_id, product_id, quantity, unit, movement_type, source_record_id, movement_date)
                VALUES (%s,%s,%s,%s,%s,'receipt',%s,now())
                ON CONFLICT DO NOTHING
                """,
                (p.get("movement_id") or str(uuid.uuid4()), p.get("farm_id"),
                 p.get("product_id"), p.get("quantity"), p.get("unit"), op.entity_id),
            )
            conn.execute(
                "UPDATE inventory_receipts SET status='confirmed', movement_id=%s, updated_at=now() WHERE id=%s",
                (p.get("movement_id"), op.entity_id),
            )
    except Exception:
        # L'op reste 'accepted' dans sync_operations ; l'échec métier
        # sera tracé — ne pas bloquer le batch entier.
        conn.execute(
            "UPDATE sync_operations SET status='apply_error', result=%s WHERE op_id=%s",
            (Jsonb({"error": "business_apply_failed"}), str(op.op_id)),
        )


@router.get("/sync/pull", response_model=SyncPullResponse)
def sync_pull(
    cursor: int = Query(0, ge=0),
    limit: int = Query(200, ge=1, le=1000),
    claims: dict = Depends(get_claims),
) -> SyncPullResponse:
    """
    Données serveur → client (référentiels + ops serveur).
    Les référentiels métier seront remplis quand le schéma métier existera ;
    pour l'instant on retourne les opérations déjà poussées par l'utilisateur
    au-delà du cursef (traçabilité/audit côté client).
    """
    with get_pool().connection() as conn:
        rows = conn.execute(
            """
            SELECT op_id, op_type, entity_type, entity_id, payload,
                   client_ts, received_at
            FROM sync_operations
            WHERE user_id = %s
            ORDER BY received_at
            LIMIT %s OFFSET %s
            """,
            (claims["sub"], limit, cursor),
        ).fetchall()

    ops = [
        {
            "op_id": str(r[0]),
            "op_type": r[1],
            "entity_type": r[2],
            "entity_id": r[3],
            "payload": r[4],
            "client_ts": r[5].isoformat() if r[5] else None,
            "received_at": r[6].isoformat() if r[6] else None,
        }
        for r in rows
    ]
    return SyncPullResponse(cursor=cursor + len(rows), server_operations=ops)


@router.get("/sync/status", response_model=SyncStatusResponse)
def sync_status(claims: dict = Depends(get_claims)) -> SyncStatusResponse:
    with get_pool().connection() as conn:
        pending = conn.execute(
            "SELECT count(*) FROM sync_operations WHERE status = 'pending'"
        ).fetchone()[0]
    return SyncStatusResponse(
        server_pending_ops=pending,
        last_cursor=0,
        server_time=datetime.now(timezone.utc),
    )

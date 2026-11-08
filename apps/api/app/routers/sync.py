import uuid
from datetime import date, datetime, timezone
from typing import Any

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


def _to_date(val: Any) -> date:
    if val is None:
        return datetime.now(timezone.utc).date()
    if isinstance(val, datetime):
        return val.date()
    if isinstance(val, date):
        return val
    if isinstance(val, (int, float)):
        ts = val / 1000.0 if val > 1e10 else float(val)
        return datetime.fromtimestamp(ts, tz=timezone.utc).date()
    if isinstance(val, str):
        s = val.strip()
        if s.isdigit():
            num = int(s)
            ts = num / 1000.0 if num > 1e10 else float(num)
            return datetime.fromtimestamp(ts, tz=timezone.utc).date()
        return date.fromisoformat(s[:10])
    return datetime.now(timezone.utc).date()


def _to_timestamptz(val: Any) -> datetime:
    if val is None:
        return datetime.now(timezone.utc)
    if isinstance(val, datetime):
        return val if val.tzinfo else val.replace(tzinfo=timezone.utc)
    if isinstance(val, date):
        return datetime(val.year, val.month, val.day, tzinfo=timezone.utc)
    if isinstance(val, (int, float)):
        ts = val / 1000.0 if val > 1e10 else float(val)
        return datetime.fromtimestamp(ts, tz=timezone.utc)
    if isinstance(val, str):
        s = val.strip()
        if s.isdigit():
            num = int(s)
            ts = num / 1000.0 if num > 1e10 else float(num)
            return datetime.fromtimestamp(ts, tz=timezone.utc)
        return datetime.fromisoformat(s.replace("Z", "+00:00"))
    return datetime.now(timezone.utc)


def _resolve_farm_id(conn, user_id: str, p: dict[str, Any], entity_id: str | None = None) -> str | None:
    if p.get("farm_id"):
        return str(p["farm_id"])
    if p.get("band_id"):
        row = conn.execute(
            "SELECT farm_id FROM bands WHERE id = %s",
            (str(p["band_id"]),),
        ).fetchone()
        if row and row[0]:
            return str(row[0])
    if entity_id:
        row = conn.execute(
            "SELECT farm_id FROM inventory_receipts WHERE id = %s",
            (str(entity_id),),
        ).fetchone()
        if row and row[0]:
            return str(row[0])
    row = conn.execute(
        """
        SELECT farm_id FROM farm_memberships
        WHERE clerk_user_id = %s AND status = 'active'
        ORDER BY created_at LIMIT 1
        """,
        (user_id,),
    ).fetchone()
    return str(row[0]) if row and row[0] else None


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
                _apply_business_op(conn, user_id, op)
            results.append(
                SyncOpResult(
                    op_id=op.op_id,
                    status=status,
                    message=None if inserted else "opération déjà enregistrée",
                )
            )
    return SyncPushResponse(results=results)


def _apply_business_op(conn, user_id: str, op) -> None:
    """
    Applique une opération acceptée aux tables métier dans un SAVEPOINT —
    idempotent via les contraintes UNIQUE (op rejouée → ON CONFLICT → ignorée).
    """
    p = op.payload
    et = op.entity_type
    try:
        with conn.transaction():
            farm_id = _resolve_farm_id(conn, user_id, p, op.entity_id)
            if et == "daily_record":
                conn.execute(
                    """
                    INSERT INTO daily_records (id, farm_id, band_id, entry_date, deaths, feed_kg, observations, created_by)
                    VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
                    ON CONFLICT (band_id, entry_date) WHERE deaths IS NOT NULL OR feed_kg IS NOT NULL
                    DO UPDATE SET deaths=EXCLUDED.deaths, feed_kg=EXCLUDED.feed_kg,
                                  observations=EXCLUDED.observations, updated_at=now(), version=daily_records.version+1
                    """,
                    (
                        op.entity_id,
                        farm_id,
                        p.get("band_id"),
                        _to_date(p.get("record_date")),
                        p.get("deaths"),
                        p.get("feed_kg"),
                        p.get("observations"),
                        user_id,
                    ),
                )
            elif et == "weighing":
                sample_count = p.get("sample_count")
                total_weight_kg = p.get("total_weight_kg")
                avg_weight = (
                    (float(total_weight_kg) / int(sample_count))
                    if sample_count and total_weight_kg is not None and int(sample_count) > 0
                    else None
                )
                conn.execute(
                    """
                    INSERT INTO weighings (id, farm_id, band_id, weighing_date, sample_count, total_weight_kg, average_weight_kg, recorded_by)
                    VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
                    ON CONFLICT (band_id, weighing_date) DO NOTHING
                    """,
                    (
                        op.entity_id,
                        farm_id,
                        p.get("band_id"),
                        _to_date(p.get("date")),
                        sample_count,
                        total_weight_kg,
                        avg_weight,
                        user_id,
                    ),
                )
            elif et == "flock_exit":
                exit_date = _to_date(p.get("date"))
                conn.execute(
                    """
                    INSERT INTO flock_exits (id, farm_id, band_id, exit_type, quantity, recipient, exit_date, lot_id, provisional_lot_code)
                    VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)
                    ON CONFLICT (id) DO NOTHING
                    """,
                    (
                        op.entity_id,
                        farm_id,
                        p.get("band_id"),
                        p.get("type"),
                        p.get("quantity"),
                        p.get("recipient"),
                        exit_date,
                        p.get("lot_id"),
                        p.get("provisional_lot_code"),
                    ),
                )
                if p.get("type") == "cession" and p.get("lot_id") and farm_id and p.get("band_id"):
                    conn.execute(
                        """
                        INSERT INTO lots (id, farm_id, band_id, provisional_code, quantity, transfer_date, recipient, status)
                        VALUES (%s,%s,%s,%s,%s,%s,%s,'active')
                        ON CONFLICT (id) DO NOTHING
                        """,
                        (
                            p.get("lot_id"),
                            farm_id,
                            p.get("band_id"),
                            p.get("provisional_lot_code"),
                            p.get("quantity"),
                            exit_date,
                            p.get("recipient"),
                        ),
                    )
            elif et == "treatment":
                conn.execute(
                    """
                    INSERT INTO treatment_events (id, farm_id, band_id, treatment_type, product_name, batch_number, method, animals_treated, event_date, created_by)
                    VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                    ON CONFLICT (id) DO NOTHING
                    """,
                    (
                        op.entity_id,
                        farm_id,
                        p.get("band_id"),
                        p.get("type"),
                        p.get("product"),
                        p.get("batch"),
                        p.get("method"),
                        p.get("animals"),
                        _to_date(p.get("date")),
                        user_id,
                    ),
                )
            elif et == "receipt_confirm":
                movement_id = p.get("movement_id") or str(uuid.uuid4())
                conn.execute(
                    """
                    INSERT INTO inventory_movements (id, farm_id, product_id, quantity, unit, movement_type, source_record_id, movement_date)
                    VALUES (%s,%s,%s,%s,%s,'receipt',%s,now())
                    ON CONFLICT (id) DO NOTHING
                    """,
                    (
                        movement_id,
                        farm_id,
                        p.get("product_id") or op.entity_id,
                        p.get("quantity"),
                        p.get("unit"),
                        op.entity_id,
                    ),
                )
                conn.execute(
                    "UPDATE inventory_receipts SET status='confirmed', movement_id=%s, updated_at=now() WHERE id=%s",
                    (movement_id, op.entity_id),
                )
            elif et == "receipt_create":
                conn.execute(
                    """
                    INSERT INTO inventory_receipts (id, farm_id, product_name, quantity, unit, receipt_date, delivery_ref, status)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, 'pending')
                    ON CONFLICT (id) DO NOTHING
                    """,
                    (
                        op.entity_id,
                        farm_id,
                        p.get("product"),
                        p.get("quantity"),
                        p.get("unit"),
                        _to_date(p.get("date")),
                        p.get("delivery_ref"),
                    ),
                )
            elif et == "inventory_usage":
                qty = float(p.get("quantity") or 0)
                conn.execute(
                    """
                    INSERT INTO inventory_movements (id, farm_id, product_id, band_id, quantity, unit, movement_type, movement_date)
                    VALUES (%s, %s, %s, %s, %s, %s, 'usage', %s)
                    ON CONFLICT (id) DO NOTHING
                    """,
                    (
                        op.entity_id,
                        farm_id,
                        p.get("product_id"),
                        p.get("band_id"),
                        -abs(qty),
                        p.get("unit"),
                        _to_timestamptz(p.get("date")),
                    ),
                )
            elif et == "health_declaration":
                if op.op_type == "update":
                    conn.execute(
                        "UPDATE health_declarations SET notes=%s, updated_at=now() WHERE id=%s",
                        (p.get("notes"), op.entity_id),
                    )
                else:
                    conn.execute(
                        """
                        INSERT INTO health_declarations (id, farm_id, band_id, problem_type, signs, affected_count, notes, event_date, status, created_by)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'pending_review', %s)
                        ON CONFLICT (id) DO NOTHING
                        """,
                        (
                            op.entity_id,
                            farm_id,
                            p.get("band_id"),
                            p.get("type"),
                            p.get("signs"),
                            p.get("count"),
                            p.get("notes"),
                            _to_date(p.get("date")),
                            user_id,
                        ),
                    )
            elif et == "health_attachment":
                conn.execute(
                    """
                    INSERT INTO health_attachments (id, declaration_id, storage_path, mime_type, file_size, checksum)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    ON CONFLICT (id) DO NOTHING
                    """,
                    (
                        op.entity_id,
                        p.get("declaration_id"),
                        f"private/health/{op.entity_id}",
                        p.get("mime_type"),
                        p.get("file_size"),
                        p.get("checksum"),
                    ),
                )
            elif et == "farm":
                if op.op_type == "update":
                    conn.execute(
                        "UPDATE farms SET name=%s, locality=%s, farming_type=%s, updated_at=now(), version=version+1 WHERE id=%s",
                        (p.get("name"), p.get("locality"), p.get("farming_type"), op.entity_id),
                    )
                else:
                    conn.execute(
                        """
                        INSERT INTO farms (id, name, province, locality, farming_type, building_count_declared, created_by, client_id)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                        ON CONFLICT (id) DO NOTHING
                        """,
                        (
                            op.entity_id,
                            p.get("name"),
                            (p.get("province") or "estuaire").strip().lower(),
                            p.get("locality"),
                            p.get("farming_type") or "chair",
                            p.get("building_count_declared"),
                            user_id,
                            p.get("client_id"),
                        ),
                    )
                    conn.execute(
                        """
                        INSERT INTO farm_memberships (farm_id, clerk_user_id, membership_role, status)
                        VALUES (%s, %s, 'owner', 'active')
                        ON CONFLICT (farm_id, clerk_user_id) DO NOTHING
                        """,
                        (op.entity_id, user_id),
                    )
            elif et == "building":
                conn.execute(
                    """
                    INSERT INTO buildings (id, farm_id, label, capacity, status)
                    VALUES (%s, %s, %s, %s, 'available')
                    ON CONFLICT (id) DO NOTHING
                    """,
                    (op.entity_id, farm_id, p.get("name"), p.get("capacity")),
                )
            elif et == "invitation":
                conn.execute(
                    """
                    INSERT INTO farm_memberships (id, farm_id, clerk_user_id, membership_role, status)
                    VALUES (%s, %s, %s, %s, 'pending')
                    ON CONFLICT (farm_id, clerk_user_id) DO NOTHING
                    """,
                    (op.entity_id, farm_id, p.get("email"), p.get("role") or "technicien"),
                )
            elif et == "user_profile":
                conn.execute(
                    """
                    INSERT INTO audit_log (actor_id, entity_type, entity_id, action, detail)
                    VALUES (%s, 'user_profile', %s, 'update', %s)
                    """,
                    (user_id, op.entity_id, Jsonb(p)),
                )
            elif et == "band":
                conn.execute(
                    """
                    INSERT INTO bands (id, farm_id, building_id, initial_count, placement_date, status)
                    VALUES (%s, %s, %s, %s, %s, 'active')
                    ON CONFLICT (id) DO NOTHING
                    """,
                    (
                        op.entity_id,
                        farm_id,
                        p.get("building_id"),
                        p.get("chicks"),
                        _to_date(p.get("date")),
                    ),
                )
                if p.get("building_id"):
                    conn.execute(
                        "UPDATE buildings SET status='occupied' WHERE id=%s",
                        (p.get("building_id"),),
                    )
            elif et == "band_closure":
                target_band_id = p.get("band_id") or op.entity_id
                conn.execute(
                    "UPDATE bands SET status='closed', updated_at=now() WHERE id=%s",
                    (target_band_id,),
                )
                conn.execute(
                    "UPDATE buildings SET status='available' WHERE id=(SELECT building_id FROM bands WHERE id=%s)",
                    (target_band_id,),
                )
    except Exception as exc:
        # L'op reste 'accepted' dans sync_operations ; le SAVEPOINT (conn.transaction())
        # a été annulé proprement, on peut donc mettre à jour le statut sans InFailedSqlTransaction.
        conn.execute(
            "UPDATE sync_operations SET status='apply_error', result=%s WHERE op_id=%s",
            (Jsonb({"error": "business_apply_failed", "detail": str(exc)}), str(op.op_id)),
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
